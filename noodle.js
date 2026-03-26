import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { writeFileSync } from "node:fs";

//* in this i learned to creat custom grap(part of langGraph) and converted it into code 
// check notion for better understanfing of graph
/*  
 start
   |
   v   
 boil water
   |
   v
 add noodles
   |
   v 
 add masala
   |
   v
 add salt 
   |
   v
 taste noodle
   |
   v
 end  */

//*note
/* 
start and end node are in-built
nodes are called function 
Arrows between nodes are called edges
*/

// node created
// node is nothing but function
function boilwater(state) {
  console.log("boiling..");
  return state;
}
function addnoodles(state) {
  console.log("adding noodles...");
  return state;
}
function addmasala(state) {
  console.log("adding masala...");
  return state;
}
function addsalt(state) {
  console.log("add salt...");
  return state;
}
function tastenoodle(state) {
  console.log("taste noodle..");
  return state;
}

// this function is for making decision
function wheretogo() {
  if (true) {
    return "__end__";
  } else {
    return "addsalt";
  }
}

const graph = new StateGraph(MessagesAnnotation)
  // MessagesAnnotation is nothing but messages
  /* adding nodes */
  // --------naming--------function
  .addNode("boilwater", boilwater)
  .addNode("addnoodles", addnoodles)
  .addNode("addmasala", addmasala)
  .addNode("addsalt", addsalt)
  .addNode("tastenoodle", tastenoodle)
  //   --------------adding edges
  //--------from/start---to/end
  .addEdge("__start__", "boilwater")
  .addEdge("boilwater", "addnoodles")
  .addEdge("addnoodles", "addmasala")
  .addEdge("addmasala", "addsalt")
  .addEdge("addsalt", "tastenoodle")
  .addConditionalEdges("tastenoodle", wheretogo, {
    __end__: END,
    addsalt: "addsalt",
  });

// compiling
const app = graph.compile();
// invoking
async function main() {
  const finalstate = await app.invoke({
    messages: [],
  });
  console.log("final", finalstate);
}

main();
// ----------------below code is not part of custom graph-----------
//To visualize by graph, how agent is working
const drawGraph = await app.getGraphAsync();
const graphStateImage = await drawGraph.drawMermaidPng();
const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

const filePath = "./noodleState.png";
writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));
