import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const AgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPrompt: z.string().min(1),
  provider: z.enum(["openai", "anthropic"]),
  model: z.string().min(1),
  tools: z.array(z.string()).default([]),
});

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { runs: true } } },
  });
  return NextResponse.json(agents);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = AgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const agent = await prisma.agent.create({
    data: { ...parsed.data, tools: JSON.stringify(parsed.data.tools) },
  });
  return NextResponse.json(agent, { status: 201 });
}
