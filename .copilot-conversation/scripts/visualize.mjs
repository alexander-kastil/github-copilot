import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { consolidateSession } from './consolidate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');

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

  let d = `%%{init: {'theme':'dark', 'themeVariables': {'primaryTextColor':'#ffff00', 'primaryBorderColor':'#ffff00', 'textColor':'#ffff00'}}}%%\n`;
  d += 'sequenceDiagram\n';
  d += '    autonumber\n';
  d += '    actor User as User\n';
  d += '    participant Bot as GH Copilot\n';
  if (hasTools) d += '    participant API as Tool Use\n';
  agentNames.forEach(name => {
    d += `    participant Sub_${sanitize(name)} as Sub: ${sanitize(name)}\n`;
  });
  d += '\n';
  d += `    Note over User,Bot: Conversation starts\n\n`;

  const events = [];

  if (history.messages) {
    history.messages.forEach((msg, msgIdx) => {
      if (!msg || !msg.content) return;
      events.push({
        type: 'message',
        role: msg.role,
        content: msg.content,
        ts: toMs(msg.timestamp),
        msgIdx: msgIdx
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
          d += `    User->>Bot: ${truncate(evt.content)}\n`;
          
          // For Level 1, add action summary after user message
          if (level === 1) {
            const nextMsgIdx = evt.msgIdx + 1;
            if (nextMsgIdx < history.messages.length) {
              const msgTime = toMs(evt.ts);
              const nextMsgTime = toMs(history.messages[nextMsgIdx].timestamp);
              const actionsInRange = tools.filter(t => {
                const toolTime = toMs(t.timestamp);
                return toolTime >= msgTime && toolTime < nextMsgTime;
              });
              
              if (actionsInRange.length > 0) {
                const summary = buildActionSummaryShort(actionsInRange);
                d += `    Bot-->>User: ${summary}\n`;
              }
            } else if (evt.msgIdx === history.messages.length - 1) {
              // Last message - show actions to present time
              const msgTime = toMs(evt.ts);
              const actionsInRange = tools.filter(t => {
                const toolTime = toMs(t.timestamp);
                return toolTime >= msgTime;
              });
              
              if (actionsInRange.length > 0) {
                const summary = buildActionSummaryShort(actionsInRange);
                d += `    Bot-->>User: ${summary}\n`;
              }
            }
          }
        }
        break;
      case 'assistant-response':
        if (level === 2) {
          d += '    Bot-->>User: [processing]/[response]\n';
        }
        break;
      case 'tool-call': {
        const label = evt.toolName === 'unknown' ? `Tool Call #${evt.toolId}` : truncate(evt.toolName, 40);
        d += `    Bot->>+API: ${label}\n`;
        break;
      }
      case 'tool-response': {
        const status = evt.resultType === 'success' ? 'OK' : evt.resultType;
        d += `    API-->>-Bot: ${status}\n`;
        break;
      }
      case 'agent-start':
        d += `    Bot->>+Sub_${sanitize(evt.agentName)}: start\n`;
        break;
      case 'agent-stop':
        d += `    Sub_${sanitize(evt.agentName)}-->>-Bot: done\n`;
        break;
    }
  });

  d += `\n    Note over User,Bot: Conversation ends\n`;
  return d;
}

function buildActionSummaryShort(tools) {
  const grouped = {};
  tools.forEach(t => {
    if (!grouped[t.toolName]) {
      grouped[t.toolName] = 0;
    }
    grouped[t.toolName]++;
  });

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const topActions = sorted.slice(0, 3);

  if (tools.length === 0) return '';
  
  if (topActions.length === 1 && topActions[0][1] === 1) {
    return `Executed: ${topActions[0][0]}`;
  }
  
  const summary = topActions.map(([name, count]) => {
    const clean = name.replace(/copilot_|mcp_/g, '').replace(/_/g, ' ');
    return count === 1 ? clean : `${count}× ${clean}`;
  }).join(', ');
  
  return `Executed ${tools.length} actions: ${summary}`;
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
  md += '\n';

  md += '## Sequence Diagram\n\n';
  md += '```mermaid\n';
  md += buildDiagram(history, tools, agents, level);
  md += '```\n\n';
  
  if (level === 1) {
    md += '> Level 1: User prompts with Copilot action summaries\n\n';
  } else if (level === 2) {
    md += buildMetrics(tools);
  }

  md += `---\n_Session: ${sessionId} | Level: ${level}_\n`;
  return md;
}

function buildLevel1_5Content(history, tools) {
  let md = '> Shows the conversation flow with summaries of actions Copilot took between your prompts.\n\n';

  if (!history.messages) return md;

  history.messages.forEach((msg, msgIdx) => {
    if (!msg || !msg.content) return;

    const msgTime = new Date(msg.timestamp).getTime();
    const nextMsgTime = (msgIdx + 1 < history.messages.length) 
      ? new Date(history.messages[msgIdx + 1].timestamp).getTime()
      : Date.now();

    // User message
    md += `**User [${new Date(msg.timestamp).toLocaleTimeString()}]:**\n`;
    md += `> ${msg.content.substring(0, 500)}\n`;
    if (msg.content.length > 500) md += `> ...\n`;
    md += '\n';

    // Find actions between messages
    const actionsInRange = tools.filter(t => {
      const toolTime = new Date(t.timestamp).getTime();
      return toolTime >= msgTime && toolTime < nextMsgTime;
    });

    if (actionsInRange.length > 0) {
      md += `**Copilot Response [${((nextMsgTime - msgTime) / 1000).toFixed(1)}s]:**\n\n`;

      // Group by phase
      const preCalls = actionsInRange.filter(t => t.phase === 'pre');
      
      // Summarize actions
      const grouped = {};
      preCalls.forEach(t => {
        if (!grouped[t.toolName]) grouped[t.toolName] = 0;
        grouped[t.toolName]++;
      });

      const actionList = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => {
          const cleanName = name.replace(/^copilot_|^mcp_|_/g, (m) => m === '_' ? ' ' : '').replace(/([A-Z])/g, ' $1').trim();
          return count === 1 ? `• ${cleanName}` : `• ${cleanName} (${count}×)`;
        });

      md += 'Executed:\n';
      md += actionList.join('\n');
      md += '\n\n';

      md += `<details>\n<summary>View Tool Calls (${preCalls.length} total)</summary>\n\n`;
      md += `| Position | Tool | Time |\n`;
      md += `|----------|------|------|\n`;
      
      preCalls.forEach((t, idx) => {
        const cleanName = t.toolName.replace(/^copilot_|^mcp_/g, '').replace(/_/g, ' ');
        const toolTime = new Date(t.timestamp).toLocaleTimeString();
        md += `| ${idx + 1} | ${cleanName} | ${toolTime} |\n`;
      });

      md += `\n</details>\n\n`;
    } else {
      md += `**Copilot:** (No additional actions taken)\n\n`;
    }

    md += '---\n\n';
  });

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

function findAllSessions() {
  if (!fs.existsSync(dataDir)) return [];
  const files = fs.readdirSync(dataDir);
  const sessionIds = new Set();
  
  files.forEach(f => {
    const match = f.match(/^(history|tools|debug|agents-.+)-(.*)\.(json|log)$/);
    if (match && match[2]) {
      sessionIds.add(match[2]);
    }
  });
  
  return Array.from(sessionIds).sort();
}

function deleteSession(sessionId) {
  if (!fs.existsSync(dataDir)) {
    console.log('❌ Data directory not found');
    return false;
  }

  const conversationsDir = path.join(__dirname, '../conversations');
  const files = [
    path.join(dataDir, `history-${sessionId}.json`),
    path.join(dataDir, `tools-${sessionId}.json`),
    path.join(dataDir, `debug-${sessionId}.log`),
    path.join(dataDir, `conv-${sessionId}.json`),
    path.join(conversationsDir, `conv-${sessionId}.md`)
  ];

  // Also find agent files for this session
  const allFiles = fs.readdirSync(dataDir);
  const agentFiles = allFiles
    .filter(f => f.startsWith('agents-') && f.endsWith(`-${sessionId}.json`))
    .map(f => path.join(dataDir, f));
  
  files.push(...agentFiles);

  let deleted = 0;
  files.forEach(f => {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      deleted++;
    }
  });

  if (deleted > 0) {
    console.log(`✓ Deleted ${deleted} file(s) for session ${sessionId}`);
    return true;
  } else {
    console.log(`⚠️  No files found for session ${sessionId}`);
    return false;
  }
}

function deleteAllSessions() {
  const sessions = findAllSessions();
  
  if (sessions.length === 0) {
    console.log('❌ No sessions found');
    return;
  }

  console.log(`\n⚠️  Deleting all ${sessions.length} session(s)...\n`);
  
  let totalDeleted = 0;
  sessions.forEach(id => {
    const result = deleteSession(id);
    if (result) totalDeleted++;
  });
  
  console.log(`\n✓ Deleted ${totalDeleted} session(s)`);
}

function promptForSessions() {
  const sessions = findAllSessions();
  
  if (sessions.length === 0) {
    console.log('❌ No sessions found');
    return [];
  }

  console.log('\n📊 Available conversations:\n');
  sessions.forEach((id, idx) => {
    const historyPath = path.join(dataDir, `history-${id}.json`);
    let title = id;
    try {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      if (history.messages && history.messages.length > 0) {
        const firstMsg = history.messages[0].content;
        title = firstMsg.length > 40 ? firstMsg.substring(0, 40) + '...' : firstMsg;
      }
    } catch (e) {}
    
    console.log(`  [${idx + 1}] ${id}`);
    console.log(`      "${title}"`);
  });

  return sessions;
}

function showAvailableSessions() {
  const sessions = findAllSessions();
  
  if (sessions.length === 0) {
    console.log('❌ No sessions found');
    return;
  }

  console.log('\n📊 Available conversations:\n');
  sessions.forEach((id, idx) => {
    const historyPath = path.join(dataDir, `history-${id}.json`);
    let title = id;
    try {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      if (history.messages && history.messages.length > 0) {
        const firstMsg = history.messages[0].content;
        const truncated = firstMsg.length > 40 ? firstMsg.substring(0, 40) + '...' : firstMsg;
        title = truncated;
      }
    } catch (e) {}
    
    console.log(`  [${idx + 1}] ${id}`);
    console.log(`      "${title}"`);
  });

  console.log('\nUsage for deletion:');
  console.log(`  node ./scripts/visualize.mjs --delete --session <id>`);
  console.log(`  node ./scripts/visualize.mjs --delete --session all\n`);
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
  const conversationsDir = path.join(__dirname, '../conversations');
  fs.mkdirSync(conversationsDir, { recursive: true });
  const outPath = path.join(conversationsDir, `conv-${sessionId}.md`);
  fs.writeFileSync(outPath, md, 'utf-8');
  console.log(`✓ Generated conversations/conv-${sessionId}.md`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  
  let sessionId = null;
  let level = 1;
  let deleteMode = false;

  // Parse --session, --level, and --delete flags
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--session' && i + 1 < args.length) {
      sessionId = args[i + 1];
      i++;
    } else if (args[i] === '--level' && i + 1 < args.length) {
      const lvl = parseInt(args[i + 1]);
      if (lvl === 1 || lvl === 2) {
        level = lvl;
      }
      i++;
    } else if (args[i] === '--delete') {
      deleteMode = true;
    }
  }

  // Handle delete mode
  if (deleteMode) {
    if (sessionId === 'all') {
      deleteAllSessions();
    } else if (sessionId) {
      deleteSession(sessionId);
    } else {
      showAvailableSessions();
    }
    return;
  }

  // If session provided, process it
  if (sessionId) {
    console.log(`📍 Session ID: ${sessionId}`);
    console.log(`📊 Rendering level: ${level}`);
    
    processSession(sessionId, level);
    return;
  }
  
  // No session specified - show available and process all
  const sessions = promptForSessions();
  if (sessions.length === 0) {
    return;
  }

  console.log(`📊 Processing ${sessions.length} session(s)...\n`);

  let count = 0;
  for (const sessionId of sessions) {
    if (processSession(sessionId, 1)) count++;
  }
  console.log(`\n✓ Processed ${count} session(s)`);
}

export { buildDiagram, addInferredResponses, buildMetrics, sanitize, truncate, toMs, processSession, generateMarkdown };

main();
