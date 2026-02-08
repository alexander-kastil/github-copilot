import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateConversationSequenceDiagram(messages, toolEvents) {
  let diagram = 'sequenceDiagram\n';
  diagram += '    autonumber\n';
  diagram += '    actor User as User\n';
  diagram += '    participant Bot as Assistant\n';
  
  if (toolEvents && toolEvents.length > 0) {
    diagram += '    participant Tools as External API\n';
  }
  
  diagram += '\n';
  diagram += '    Note over User,Bot: Conversation starts\n';
  diagram += '\n';
  
  // Process messages and interleave with tool calls
  if (messages && messages.length > 0) {
    messages.forEach((msg, idx) => {
      if (msg.role === 'user') {
        const msgText = truncateText(msg.content, 50);
        diagram += `    User->>Bot: ${msgText}\n`;
      } else {
        const msgText = truncateText(msg.content, 50);
        diagram += `    Bot-->>User: ${msgText}\n`;
        
        // Check if there are tool calls after this assistant message
        const nextToolCalls = getToolCallsAfterMessage(idx, toolEvents);
        if (nextToolCalls.length > 0) {
          diagram += '    alt Tool Execution\n';
          nextToolCalls.forEach(event => {
            if (event.type === 'call') {
              const toolName = event.message.split('(')[1]?.replace(')', '') || event.message;
              diagram += `        Bot->>+Tools: ${event.message}\n`;
              diagram += `        Note right of Tools: ${event.noteText}\n`;
              diagram += `        Tools-->>-Bot: ${event.status} (${event.responseTime})\n`;
            }
          });
          diagram += '    end\n';
        }
      }
      diagram += '\n';
    });
  } else if (toolEvents && toolEvents.length > 0) {
    // If no messages, show tool execution sequence
    toolEvents.forEach(event => {
      if (event.type === 'call') {
        diagram += `    Bot->>+Tools: ${event.message}\n`;
        diagram += `    Note right of Tools: ${event.noteText}\n`;
        diagram += `    Tools-->>-Bot: ${event.status} (${event.responseTime})\n`;
        diagram += '\n';
      }
    });
  }
  
  diagram += '    Note over User,Bot: Conversation ends\n';
  
  return diagram;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text.replace(/"/g, "'");
  return text.substring(0, maxLength).replace(/"/g, "'") + '...';
}

function getToolCallsAfterMessage(messageIndex, toolEvents) {
  // Group tool calls with assistant messages
  // For now, return all tool events that follow in sequence
  if (!toolEvents || toolEvents.length === 0) return [];
  
  // Get events that would logically follow this message
  // In a real scenario, we'd match based on timestamps or other metadata
  return toolEvents.slice(0, Math.ceil(toolEvents.length / (messageIndex + 1)));
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

function formatMessages(messages) {
  if (!messages || messages.length === 0) {
    return '';
  }
  
  let content = '## Conversation Transcript\n\n';
  
  messages.forEach(msg => {
    const role = msg.role === 'user' ? '👤 **User**' : '🤖 **Assistant**';
    const timestamp = new Date(msg.timestamp).toLocaleString();
    content += `### ${role} — ${timestamp}\n\n`;
    content += `${msg.content}\n\n`;
  });
  
  return content;
}

function generateMarkdown(toolData, historyData) {
  const startTime = new Date(historyData.startTime).toLocaleString();
  
  let markdown = `# Session: ${historyData.sessionId}\n\n`;
  markdown += `**Started**: ${startTime}\n\n`;
  
  markdown += formatMessages(historyData.messages);
  
  // Generate conversation sequence diagram
  const toolEvents = toolData.sequence && toolData.sequence.events ? toolData.sequence.events : [];
  const conversationDiagram = generateConversationSequenceDiagram(historyData.messages, toolEvents);
  
  if (historyData.messages && historyData.messages.length > 0) {
    markdown += '## Conversation Flow\n\n';
    markdown += '```mermaid\n';
    markdown += conversationDiagram;
    markdown += '```\n\n';
  }
  
  if (toolData.metrics && toolData.metrics.tools.length > 0) {
    markdown += '## Tool Execution Metrics\n\n';
    markdown += '```mermaid\n';
    markdown += generateMetricsDiagram(toolData.metrics);
    markdown += '```\n\n';
  }
  
  markdown += '---\n\n';
  markdown += `_Data sources: [tool-use--${historyData.sessionId}.json](./data/tool-use--${historyData.sessionId}.json) | [conversation-history--${historyData.sessionId}.json](./data/conversation-history--${historyData.sessionId}.json)_\n`;
  
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
      
      const toolData = JSON.parse(fs.readFileSync(toolPath, 'utf-8'));
      const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
      
      const markdown = generateMarkdown(toolData, historyData);
      fs.writeFileSync(mdPath, markdown, 'utf-8');
      
      console.log(`✓ Generated conversation--${sessionId}.md`);
    }
    
    console.log(`\n✓ All ${toolFiles.length} session(s) generated successfully`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
