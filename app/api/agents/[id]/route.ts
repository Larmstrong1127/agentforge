import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  systemPrompt: z.string().min(1).optional(),
  provider: z.enum(["openai", "anthropic"]).optional(),
  model: z.string().min(1).optional(),
  tools: z.array(z.string()).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: { runs: { orderBy: { createdAt: "desc" }, take: 10, include: { messages: true } } },
  });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = { ...parsed.data, ...(parsed.data.tools ? { tools: JSON.stringify(parsed.data.tools) } : {}) };
  const agent = await prisma.agent.update({ where: { id }, data });
  return NextResponse.json(agent);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.agent.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
