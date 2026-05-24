import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);

  await prisma.agent.deleteMany();

  await prisma.agent.createMany({
    data: [
      {
        name: "Research Assistant",
        description: "Searches the web and answers questions with citations",
        systemPrompt: "You are a research assistant. When asked a question, use the web_search tool to find current information, then provide a clear, well-structured answer with sources. Always verify facts before responding.",
        provider: "openai",
        model: "gpt-4o-mini",
        tools: JSON.stringify(["web_search", "datetime"]),
      },
      {
        name: "Math Tutor",
        description: "Solves math problems step by step using a calculator",
        systemPrompt: "You are a patient math tutor. Break down problems step by step, use the calculator tool for computations, and explain your reasoning clearly. Encourage the student and check their understanding.",
        provider: "anthropic",
        model: "claude-haiku-4-5-20251001",
        tools: JSON.stringify(["calculator"]),
      },
      {
        name: "General Assistant",
        description: "A versatile assistant with access to all tools",
        systemPrompt: "You are a helpful, knowledgeable assistant. Use the available tools when they help answer questions more accurately. Be concise and friendly.",
        provider: "openai",
        model: "gpt-4o",
        tools: JSON.stringify(["calculator", "datetime", "web_search"]),
      },
    ],
  });

  console.log("Seeded 3 demo agents.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
