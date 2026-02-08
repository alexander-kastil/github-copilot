import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateConversationSequenceDiagram(messages, toolExecution) {
  let diagram = 'sequenceDiagram\n';
  diagram += '    autonumber\n';
  diagram += '    actor User as User\n';
  diagram += '    participant Bot as Assistant\n';

  const hasTools = toolExecution && Array.isArray(toolExecution) && toolExecution.length > 0;
  if (hasTools) {
    diagram += '    participant API as External API\n';
  }

  diagram += '\n';
  diagram += '    Note over User,Bot: Conversation starts\n';
  diagram += '\n';

  const messageEvents = [];
  if (messages && Array.isArray(messages)) {
    messages.forEach(msg => {
      if (!msg || !msg.content) {
        return;
      }
      if (msg.content.includes('```') || msg.content.includes('sequenceDiagram') || msg.content.toLowerCase().includes('mermaid')) {
        return;
      }
      const timestamp = new Date(msg.timestamp).getTime();
      messageEvents.push({
        type: 'message',
        role: msg.role,
        content: sanitizeText(msg.content),
        timestamp: Number.isNaN(timestamp) ? 0 : timestamp
      });
    });
  }

  const toolEvents = [];
  if (hasTools) {
    toolExecution.forEach(tool => {
      if (!tool || !tool.toolName) {
        return;
      }
      const timestamp = new Date(tool.timestamp).getTime();
      toolEvents.push({
        type: tool.phase === 'post' ? 'tool-response' : 'tool-call',
        toolName: sanitizeText(tool.toolName),
        success: tool.success,
        resultType: tool.resultType,
        timestamp: Number.isNaN(timestamp) ? 0 : timestamp
      });
    });
  }

  let events = [];
  if (messageEvents.length === 0) {
    events = toolEvents;
  } else if (toolEvents.length === 0) {
    events = messageEvents;
  } else {
    const messageTimes = messageEvents.map(event => event.timestamp).filter(time => time > 0);
    const minMessageTime = messageTimes.length > 0 ? Math.min(...messageTimes) : 0;
    const maxMessageTime = messageTimes.length > 0 ? Math.max(...messageTimes) : 0;
    const toolInRange = toolEvents.filter(event => event.timestamp >= minMessageTime && event.timestamp <= maxMessageTime);
    const toolOutOfRange = toolEvents.filter(event => event.timestamp < minMessageTime || event.timestamp > maxMessageTime);

    const typeOrder = { message: 0, 'tool-call': 1, 'tool-response': 2 };
    const interleaved = messageEvents.concat(toolInRange).sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9);
    });
    events = interleaved.concat(toolOutOfRange);
  }

  events.forEach(event => {
    if (event.type === 'message') {
      const msgText = truncateText(event.content, 60);
      if (event.role === 'user') {
        diagram += `    User->>Bot: ${msgText}\n`;
      } else {
        diagram += `    Bot-->>User: ${msgText}\n`;
      }
      diagram += '\n';
    }

    if (event.type === 'tool-call') {
      const toolName = truncateText(event.toolName, 40);
      diagram += `    Bot->>+API: ${toolName}\n`;
    }

    if (event.type === 'tool-response') {
      const status = event.success === true ? '200 OK' : 'Error';
      const resultType = event.resultType ? ` (${sanitizeText(event.resultType)})` : '';
      diagram += `    API-->>-Bot: ${status}${resultType}\n`;
      diagram += '\n';
    }
  });

  diagram += '    Note over User,Bot: Conversation ends\n';

  return diagram;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text.replace(/"/g, "'");
  return text.substring(0, maxLength).replace(/"/g, "'") + '...';
}

function sanitizeText(text) {
  return String(text)
    .replace(/[\r\n]+/g, ' ')
    .replace(/`/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSequenceDiagram(sequence) {
  let diagram = 'sequenceDiagram\n';
  
  sequence.actors.forEach(actor => {
    diagram += `    participant ${actor}\n`;
  });
  
  diagram += '    \n';
  
  sequence.events.forEach(event => {
    if (event.type === 'call') {
      diagram += `    ${event.from}->>+${event.to}: ${event.message}\n`;
      diagram += `    Note right of ${event.to}: ${event.noteText}\n`;
      diagram += `    ${event.to}->>-${event.from}: ${event.status} (${event.responseTime})\n`;
      diagram += '    \n';
    }
  });
  
  return diagram;
}

function generateMetricsDiagram(metrics) {
  let diagram = 'graph TD\n';
  
  diagram += `    ROOT["Tool Execution Metrics"]\n`;
  diagram += `    ROOT --> TOTAL["Total Calls: ${metrics.totalCalls}"]\n`;
  diagram += `    ROOT --> SUCCESS["Success: ${metrics.successCount}"]\n`;
  diagram += `    ROOT --> TIME["Total: ${metrics.totalTime}"]\n`;
  diagram += `    ROOT --> AVG["Avg: ${metrics.averageTime}"]\n`;
  diagram += '    \n';
  diagram += `    ROOT --> TOOLS["Tools"]\n`;
  
  metrics.tools.forEach((tool, index) => {
    // Handle both formats: simple {name, duration} and detailed {name, count, totalDuration}
    const displayValue = tool.duration || `${tool.count}x (${tool.totalDuration})`;
    diagram += `    TOOLS --> T${index + 1}["${tool.name} - ${displayValue}"]\n`;
  });
  
  diagram += '    \n';
  diagram += '    style SUCCESS fill:#90EE90\n';
  diagram += '    style TIME fill:#87CEEB\n';
  
  return diagram;
}

function generateMarkdown(toolEvents, historyData) {
  const conversationDiagram = generateConversationSequenceDiagram(
    historyData.messages,
    toolEvents
  );

  let markdown = '```mermaid\n';
  markdown += conversationDiagram;
  markdown += '```\n';

  return markdown;
}

async function main() {
  const metadataDir = __dirname;
  const dataDir = path.join(metadataDir, 'data');
  
  try {
    // Find all tool-use--{sessionId}.json files in data directory
    const toolFiles = await glob('tool-use--*.json', { cwd: dataDir });
    
    if (toolFiles.length === 0) {
      console.log('No tool-use files found in data directory');
      return;
    }
    
    for (const toolFile of toolFiles) {
      const match = toolFile.match(/tool-use--(.+)\.json/);
      if (!match) continue;
      
      const sessionId = match[1];
      const toolPath = path.join(dataDir, toolFile);
      const historyPath = path.join(dataDir, `conversation-history--${sessionId}.json`);
      const mdPath = path.join(metadataDir, `conversation--${sessionId}.md`);
      
      // Check if history file exists
      if (!fs.existsSync(historyPath)) {
        console.warn(`⚠ History file not found for session ${sessionId}`);
        continue;
      }
      
      try {
        const toolData = JSON.parse(fs.readFileSync(toolPath, 'utf-8'));
        const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
        
        if (!historyData.tools) {
          historyData.tools = [];
        }
        if (!Array.isArray(historyData.tools)) {
          historyData.tools = [historyData.tools];
        }
        historyData.tools = historyData.tools.filter(tool => tool && tool.toolName);

        let toolEvents = [];
        if (Array.isArray(toolData)) {
          toolEvents = toolData.filter(tool => tool && tool.toolName);
        } else if (toolData && toolData.toolName) {
          toolEvents = [toolData];
        }
        if (toolEvents.length === 0) {
          toolEvents = historyData.tools;
        }

        const markdown = generateMarkdown(toolEvents, historyData);
        fs.writeFileSync(mdPath, markdown, 'utf-8');
        
        console.log(`✓ Generated conversation--${sessionId}.md`);
      } catch (sessionError) {
        console.error(`Error processing session ${sessionId}: ${sessionError.message}`);
        console.error(sessionError.stack);
      }
    }
    
    console.log(`\n✓ All ${toolFiles.length} session(s) processed`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
