// to generate graph(visualize)
//i used this in agent-2.js
import {writeFileSync} from 'node:fs'

export async function printGraph(agent, filePath) {
    
const drawGraph = await agent.getGraphAsync();
  const graphStateImage = await drawGraph.drawMermaidPng();
  const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

  
  writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));
 
}