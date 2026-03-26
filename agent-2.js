//* Rebuild ReAct agent with custom graph
/* 
1 define tool (always define tool before llm)
2 Get the llm
3 build the graph
4 invoke the agent 
5 add the memory
*/

import { ChatGroq } from "@langchain/groq";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { tool, createAgent } from "langchain";
import z from "zod";
import { printGraph } from "./utils.js";
import readline from "node:readline/promises";
import { MemorySaver } from "@langchain/langgraph";


//* 1 define tools

//* in-built tools
const Searchtool = new TavilySearch({
  maxResults: 3,
  topic: "general",
});
//* custom tool
const CalenderEvents = tool(
  async ({ query }) => {
    // hardcoded for learning
    return JSON.stringify([
      {
        Title: "Meeting",
        Time: "1pm",
        Location: "Zoom",
      },
    ]);
  },
  {
    name: "get-calender-events",
    description: "Call to get calender events.",
    schema: z.object({
      query: z.string().describe("The query to use in calender event search."),
    }),
  },
);

const tools = [Searchtool, CalenderEvents];
// creating node for tools , this node added in graph
const toolNode = new ToolNode(tools);

//* 2 Get the llm
// bindTools() -> in-built, to attach/add tools in llm
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
}).bindTools(tools);

//note : state is aglobal storage all function(node) can access it, it contain messages history( ai message , human message )
async function callModel(state) {
  // call the llm
  const response = await llm.invoke(state.messages);
//   console.log("response from call model:", response);
  return { messages: [response] };
}

//* 3 Build the graph
function wheretogo(state) {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return "__end__";
}

const graph = new StateGraph(MessagesAnnotation)
  //-------node added---------
  .addNode("llm", callModel)
  .addNode("tools", toolNode)
  //-------edges added---------
  .addEdge("__start__", "llm")
  .addConditionalEdges("llm", wheretogo)
  .addEdge("tools", "llm");



//* 5  Add the memory
const checkpointer = new MemorySaver();
let config ={configurable: { thread_id: "1" }} 
  
//* 4 Invoke the agent
const app = graph.compile({checkpointer}); // checkpointer -> memory added

async function main() {
  //print graph to visualize
  const filepath = "./agent2-graph.png";
  await printGraph(app, filepath);

  // dynamic user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userQuery = await rl.question('You: ')
   if(userQuery === "bye") break

    const result = await app.invoke({
      messages: [
        { role: "user", content: userQuery },
      ],
    },
    config
);

    const messages = result.messages;
    const final = messages[messages.length - 1];
    console.log("Ai:", final.content);
  }
  rl.close()
}
main();
