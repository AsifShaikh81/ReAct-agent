import { ChatGroq } from "@langchain/groq";
import { createAgent, tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import z from "zod";

// https://github.com/langchain-ai/langgraphjs (refer this)
// https://docs.langchain.com/oss/javascript/langchain/agents
async function main(params) {
  //https://docs.langchain.com/oss/javascript/integrations/chat/groq

  //*define tool
  //https://docs.langchain.com/oss/javascript/integrations/tools/tavily_search
  const Searchtool = new TavilySearch({
    maxResults: 3,
    topic: "general",
  });
 //*custom tool
  const CalenderEvents = tool(
  async ({ query }) => {
    return JSON.stringify([{
      Title:"Meeting",
      Time:"1pm",
      Location:"Zoom"
    }])
  },
  {
    name: "get-calender-events",
    description: "Call to get calender events.",
    schema: z.object({
      query: z.string().describe("The query to use in calender event search."),
    }),
  }
);

  //*model created
  const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
  });

  //*agent created
  const agent = createAgent({
    model: model,
    tools: [Searchtool, CalenderEvents],
  });

  //*invoke agent
  const result = await agent.invoke({
    messages: [
      {
        role:"system",
        content :`You are a personal assistant. Use provided tools to get the information if you don't have it.`
      },
      {
        role: "user",
        content: "what is current mumbai weather",
      },
    ],
  });
  console.log("AI: ", result.messages[result.messages.length - 1].content);
}

main();
