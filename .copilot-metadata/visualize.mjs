import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { consolidateSession } from './consolidate.mjs';

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
  if (!ts || typeof ts === 'object') return 0;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function isValidString(val) {
  return val && typeof val === 'string' && val.length > 0;
}

function buildDiagram(history, tools, agents, level = 1) {
  const validTools = level === 1 ? [] : tools.filter(t => t && t.toolName);
  const hasTools = validTools.length > 0;
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
  d += `    Note over User,Bot: Conversation starts (Level ${level})\n\n`;

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

  if (level === 2) {
    validTools.forEach((t, idx) => {
      if (t.phase === 'pre') {
        events.push({ type: 'tool-call', toolName: t.toolName, toolId: idx, ts: toMs(t.timestamp) });
      } else if (t.phase === 'post') {
        events.push({
          type: 'tool-response',
          toolName: t.toolName,
          toolId: idx,
          resultType: t.resultType || 'success',
          ts: toMs(t.timestamp)
        });
      }
    });
  }

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

  const enriched = addInferredResponses(events);

  enriched.forEach(evt => {
    switch (evt.type) {
      case 'message':
        if (evt.role === 'user') {
          d += `    User->>Bot: ${truncate(evt.content)}\n\n`;
        }
        break;
      case 'assistant-response':
        d += '    Bot-->>User: [response]\n\n';
        break;
      case 'tool-call': {
        const label = evt.toolName === 'unknown' ? `Tool Call #${evt.toolId}` : truncate(evt.toolName, 40);
        d += `    Bot->>+API: ${label}\n`;
        break;
      }
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

  d += `    Note over User,Bot: Conversation ends (Level ${level})\n`;
  return d;
}

function addInferredResponses(events) {
  const result = [];
  let hadAgentActivity = false;
  let pendingToolCalls = [];

  for (let i = 0; i < events.length; i++) {
    const evt = events[i];

    if (evt.type === 'tool-call') {
      pendingToolCalls.push(evt);
      result.push(evt);
      continue;
    }

    if (evt.type === 'tool-response') {
      hadAgentActivity = true;
      result.push(evt);
      continue;
    }

    if (evt.type === 'agent-start' || evt.type === 'agent-stop') {
      hadAgentActivity = true;
    }

    if (evt.type === 'message' && evt.role === 'user') {
      // Close out any pending tool calls with synthetic responses
      pendingToolCalls.forEach(toolCall => {
        result.push({
          type: 'tool-response',
          toolName: toolCall.toolName,
          toolId: toolCall.toolId,
          resultType: 'success',
          ts: toolCall.ts + 100
        });
      });
      pendingToolCalls = [];

      if (hadAgentActivity) {
        result.push({ type: 'assistant-response', ts: evt.ts - 1 });
        hadAgentActivity = false;
      }
    }

    result.push(evt);
  }

  // Handle any remaining pending tool calls
  pendingToolCalls.forEach(toolCall => {
    result.push({
      type: 'tool-response',
      toolName: toolCall.toolName,
      toolId: toolCall.toolId,
      resultType: 'success',
      ts: toolCall.ts + 100
    });
  });

  if (hadAgentActivity) {
    result.push({ type: 'assistant-response', ts: Date.now() });
  }

  return result;
}

function buildMetrics(tools) {
  const validTools = tools.filter(t => t && t.toolName);
  const postTools = validTools.filter(t => t.phase === 'post');
  const total = validTools.filter(t => t.phase === 'pre').length;
  const success = postTools.filter(t => t.resultType === 'success').length;
  const failed = postTools.filter(t => t.resultType !== 'success').length;

  const byName = {};
  validTools.forEach(t => {
    if (t.phase === 'pre') {
      if (!byName[t.toolName]) byName[t.toolName] = 0;
      byName[t.toolName]++;
    }
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

function generateMarkdown(sessionId, history, tools, agents, level = 1) {
  const startTime = isValidString(history.startTime) ? history.startTime : 'N/A';
  const endTime = isValidString(history.endTime) ? history.endTime : null;
  const status = isValidString(history.status) ? history.status : null;

  let md = `# Conversation: ${sessionId}\n\n`;
  md += `**Started:** ${startTime}\n`;
  if (endTime) md += `**Ended:** ${endTime}\n`;
  if (status) md += `**Status:** ${status}\n`;
  md += `**Visualization Level:** ${level}\n`;
  md += '\n';

  md += '## Sequence Diagram\n\n';
  md += '```mermaid\n';
  md += buildDiagram(history, tools, agents, level);
  md += '```\n\n';
  
  if (level === 2) {
    md += buildMetrics(tools);
  } else {
    md += `## Note\nLevel 1 shows user-agent conversation flow only. Use level 2 to see tool calls with extended info.\n\n`;
  }

  md += `---\n_Session: ${sessionId} | Level: ${level}_\n`;
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

function processSession(sessionId, level = 1) {
  const historyPath = path.join(dataDir, `history-${sessionId}.json`);
  const toolsPath = path.join(dataDir, `tools-${sessionId}.json`);

  if (!fs.existsSync(historyPath)) {
    console.error(`❌ History file not found: history-${sessionId}.json`);
    return false;
  }
  
  console.log(`✓ History file found`);

  const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

  let tools = [];
  if (fs.existsSync(toolsPath)) {
    console.log(`✓ Tools file found`);
    const toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
    tools = Array.isArray(toolsData.tools) ? toolsData.tools.filter(t => t && t.toolName) : [];
  }

  const agents = findAgentFiles(sessionId);
  if (agents.length > 0) {
    console.log(`✓ Found ${agents.length} agent file(s)`);
  }

  const md = generateMarkdown(sessionId, history, tools, agents, level);
  const outPath = path.join(__dirname, `conv-${sessionId}-level${level}.md`);
  fs.writeFileSync(outPath, md, 'utf-8');
  console.log(`✓ Generated conv-${sessionId}-level${level}.md`);
  return true;
}

function main() {
  const sessionId = process.argv[2];
  const levelsArg = process.argv[3] || '-levels';
  const defaultLevel = levelsArg.startsWith('-levels') ? 1 : (levelsArg === '2' ? 2 : 1);

  // Parse levels parameter: -levels or -levels=1 or -levels=1,2
  let levels = [defaultLevel];
  if (process.argv.includes('-levels=1,2') || process.argv.includes('-levels=1') || process.argv[4] === '-levels=2') {
    const levelParam = process.argv.find(arg => arg.includes('-levels='));
    if (levelParam) {
      const parts = levelParam.split('=')[1];
      levels = parts === '1,2' ? [1, 2] : [parseInt(parts), 2];
    }
  }

  // If last argument is 2, render level 2 only or both
  if (process.argv[process.argv.length - 1] === '2') {
    levels = process.argv[process.argv.length - 2] === '1' ? [1, 2] : [2];
  } else if (process.argv[process.argv.length - 1] === '1,2') {
    levels = [1, 2];
  } else if (process.argv[process.argv.length - 1] === '1') {
    levels = [1];
  }

  if (sessionId && !sessionId.startsWith('-')) {
    console.log(`📍 Session ID detected: ${sessionId}`);
    console.log(`📊 Rendering levels: ${levels.join(', ')}`);
    
    for (const level of levels) {
      processSession(sessionId, level);
    }
    return;
  }
  
  console.log('❌ No session ID provided, processing all sessions...');
  console.log('Usage: node visualize.mjs <sessionId> [1|2|1,2]');
  console.log('       node visualize.mjs <sessionId> -levels (default level 1)');
  console.log('       node visualize.mjs <sessionId> -levels=2');
  console.log('       node visualize.mjs <sessionId> 1 2 (renders both levels)');

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
    if (processSession(match[1], 1)) count++;
  }
  console.log(`\n✓ Processed ${count} session(s)`);
}

export { buildDiagram, addInferredResponses, buildMetrics, sanitize, truncate, toMs, processSession, generateMarkdown };

main();
