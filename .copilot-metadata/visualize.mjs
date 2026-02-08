import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

function sanitize(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\r\n]+/g, ' ')
    .replace(/["`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max = 60) {
  const clean = sanitize(text);
  return clean.length <= max ? clean : clean.substring(0, max) + '...';
}

function toMs(ts) {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function buildDiagram(history, tools, agents) {
  const hasTools = tools.length > 0;
  const agentNames = [...new Set(agents.map(a => a.agentName))];
  const hasAgents = agentNames.length > 0;

  let d = 'sequenceDiagram\n';
  d += '    autonumber\n';
  d += '    actor User as User\n';
  d += '    participant Bot as GH Copilot\n';
  if (hasTools) d += '    participant API as Tool Use\n';
  agentNames.forEach(name => {
    d += `    participant Sub_${sanitize(name)} as Sub: ${sanitize(name)}\n`;
  });
  d += '\n';
  d += '    Note over User,Bot: Conversation starts\n\n';

  const events = [];

  if (history.messages) {
    history.messages.forEach(msg => {
      if (!msg || !msg.content) return;
      events.push({
        type: 'message',
        role: msg.role,
        content: msg.content,
        ts: toMs(msg.timestamp)
      });
    });
  }

  tools.forEach(t => {
    if (t.phase === 'pre') {
      events.push({ type: 'tool-call', toolName: t.toolName, ts: toMs(t.timestamp) });
    } else if (t.phase === 'post') {
      events.push({
        type: 'tool-response',
        toolName: t.toolName,
        resultType: t.resultType || 'success',
        ts: toMs(t.timestamp)
      });
    }
  });

  agents.forEach(agent => {
    (agent.events || []).forEach(evt => {
      events.push({
        type: evt.phase === 'start' ? 'agent-start' : 'agent-stop',
        agentName: agent.agentName,
        ts: toMs(evt.timestamp)
      });
    });
  });

  events.sort((a, b) => a.ts - b.ts);

  events.forEach(evt => {
    switch (evt.type) {
      case 'message':
        if (evt.role === 'user') {
          d += `    User->>Bot: ${truncate(evt.content)}\n\n`;
        }
        break;
      case 'tool-call':
        d += `    Bot->>+API: ${truncate(evt.toolName, 40)}\n`;
        break;
      case 'tool-response': {
        const status = evt.resultType === 'success' ? 'OK' : evt.resultType;
        d += `    API-->>-Bot: ${status}\n\n`;
        break;
      }
      case 'agent-start':
        d += `    Bot->>+Sub_${sanitize(evt.agentName)}: start\n`;
        break;
      case 'agent-stop':
        d += `    Sub_${sanitize(evt.agentName)}-->>-Bot: done\n\n`;
        break;
    }
  });

  d += '    Note over User,Bot: Conversation ends\n';
  return d;
}

function buildMetrics(tools) {
  const postTools = tools.filter(t => t.phase === 'post');
  const total = postTools.length;
  const success = postTools.filter(t => t.resultType === 'success').length;
  const failed = total - success;

  const byName = {};
  tools.forEach(t => {
    if (!byName[t.toolName]) byName[t.toolName] = 0;
    if (t.phase === 'pre') byName[t.toolName]++;
  });

  let md = '## Metrics\n\n';
  md += '| Metric | Value |\n|--------|-------|\n';
  md += `| Total Tool Calls | ${total} |\n`;
  md += `| Successful | ${success} |\n`;
  md += `| Failed | ${failed} |\n\n`;

  if (Object.keys(byName).length > 0) {
    md += '### Tools Used\n\n';
    md += '| Tool | Calls |\n|------|-------|\n';
    Object.entries(byName).forEach(([name, count]) => {
      md += `| ${name} | ${count} |\n`;
    });
    md += '\n';
  }
  return md;
}

function generateMarkdown(sessionId, history, tools, agents) {
  let md = `# Conversation: ${sessionId}\n\n`;
  md += `**Started:** ${history.startTime || 'N/A'}\n`;
  if (history.endTime) md += `**Ended:** ${history.endTime}\n`;
  if (history.status) md += `**Status:** ${history.status}\n`;
  md += '\n';

  md += '## Sequence Diagram\n\n';
  md += '```mermaid\n';
  md += buildDiagram(history, tools, agents);
  md += '```\n\n';
  md += buildMetrics(tools);

  md += `---\n_Session: ${sessionId}_\n`;
  return md;
}

function findAgentFiles(sessionId) {
  if (!fs.existsSync(dataDir)) return [];
  return fs.readdirSync(dataDir)
    .filter(f => f.startsWith('agents-') && f.endsWith(`-${sessionId}.json`))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8'));
      return data;
    });
}

function processSession(sessionId) {
  const historyPath = path.join(dataDir, `history-${sessionId}.json`);
  const toolsPath = path.join(dataDir, `tools-${sessionId}.json`);

  if (!fs.existsSync(historyPath)) {
    console.error(`History file not found: history-${sessionId}.json`);
    return false;
  }

  const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

  let tools = [];
  if (fs.existsSync(toolsPath)) {
    const toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
    tools = Array.isArray(toolsData.tools) ? toolsData.tools.filter(t => t && t.toolName) : [];
  }

  const agents = findAgentFiles(sessionId);

  const md = generateMarkdown(sessionId, history, tools, agents);
  const outPath = path.join(__dirname, `conv-${sessionId}.md`);
  fs.writeFileSync(outPath, md, 'utf-8');
  console.log(`✓ Generated conv-${sessionId}.md`);
  return true;
}

function main() {
  const sessionId = process.argv[2];

  if (sessionId) {
    processSession(sessionId);
    return;
  }

  if (!fs.existsSync(dataDir)) {
    console.log('No data directory found');
    return;
  }

  const historyFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('history-') && f.endsWith('.json'));
  if (historyFiles.length === 0) {
    console.log('No session data found');
    return;
  }

  let count = 0;
  for (const f of historyFiles) {
    const match = f.match(/^history-(.+)\.json$/);
    if (!match) continue;
    if (processSession(match[1])) count++;
  }
  console.log(`\n✓ Processed ${count} session(s)`);
}

main();
