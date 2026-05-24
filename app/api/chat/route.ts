import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/providers/openai";
import { anthropic } from "@/lib/providers/anthropic";
import { executeTool, OPENAI_TOOL_DEFINITIONS, ANTHROPIC_TOOL_DEFINITIONS, ToolName } from "@/lib/tools";

export async function POST(req: Request) {
  const { agentId, runId, message } = await req.json();

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  let currentRunId = runId;
  if (!currentRunId) {
    const run = await prisma.run.create({ data: { agentId } });
    currentRunId = run.id;
  }

  await prisma.message.create({ data: { runId: currentRunId, role: "user", content: message } });

  const history = await prisma.message.findMany({
    where: { runId: currentRunId },
    orderBy: { createdAt: "asc" },
  });

  const agentTools: ToolName[] = JSON.parse(agent.tools || "[]");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        if (agent.provider === "openai") {
          const messages = [
            { role: "system" as const, content: agent.systemPrompt },
            ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          ];
          const tools = agentTools.length > 0 ? OPENAI_TOOL_DEFINITIONS.filter(t => agentTools.includes(t.function.name as ToolName)) : undefined;

          let fullContent = "";
          let continueLoop = true;

          while (continueLoop) {
            const response = await openai.chat.completions.create({
              model: agent.model,
              messages,
              tools,
              stream: true,
            });

            let toolCallsAccumulator: Record<string, { name: string; arguments: string }> = {};
            let finishReason = "";

            for await (const chunk of response) {
              const delta = chunk.choices[0]?.delta;
              finishReason = chunk.choices[0]?.finish_reason ?? "";

              if (delta?.content) {
                fullContent += delta.content;
                send({ type: "token", content: delta.content });
              }

              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = String(tc.index);
                  if (!toolCallsAccumulator[idx]) toolCallsAccumulator[idx] = { name: "", arguments: "" };
                  if (tc.function?.name) toolCallsAccumulator[idx].name += tc.function.name;
                  if (tc.function?.arguments) toolCallsAccumulator[idx].arguments += tc.function.arguments;
                }
              }
            }

            if (finishReason === "tool_calls") {
              const toolCalls = Object.values(toolCallsAccumulator);
              messages.push({ role: "assistant" as const, content: fullContent || null, tool_calls: toolCalls.map((tc, i) => ({ id: `call_${i}`, type: "function" as const, function: tc })) } as never);

              for (const [i, tc] of toolCalls.entries()) {
                const input = JSON.parse(tc.arguments || "{}");
                const output = executeTool(tc.name as ToolName, input);
                send({ type: "tool_call", tool: tc.name, input, output });
                messages.push({ role: "tool" as const, tool_call_id: `call_${i}`, content: output } as never);
              }
            } else {
              continueLoop = false;
            }
          }

          await prisma.message.create({ data: { runId: currentRunId, role: "assistant", content: fullContent } });

        } else {
          // Anthropic
          const messages = history
            .filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

          const tools = agentTools.length > 0 ? ANTHROPIC_TOOL_DEFINITIONS.filter(t => agentTools.includes(t.name as ToolName)) : undefined;
          let fullContent = "";
          let continueLoop = true;

          while (continueLoop) {
            const response = await anthropic.messages.create({
              model: agent.model,
              max_tokens: 1024,
              system: agent.systemPrompt,
              messages,
              tools,
              stream: true,
            });

            type ToolUse = { id: string; name: string; input: Record<string, unknown>; rawJson: string };
            const toolUses: ToolUse[] = [];

            for await (const event of response) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                fullContent += event.delta.text;
                send({ type: "token", content: event.delta.text });
              }
              if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
                toolUses.push({ id: event.content_block.id, name: event.content_block.name, input: {}, rawJson: "" });
              }
              if (event.type === "content_block_delta" && event.delta.type === "input_json_delta") {
                if (toolUses.length > 0) {
                  toolUses[toolUses.length - 1].rawJson += event.delta.partial_json;
                }
              }
            }

            // Parse accumulated JSON for each tool use
            for (const tu of toolUses) {
              try { tu.input = tu.rawJson ? JSON.parse(tu.rawJson) : {}; } catch { tu.input = {}; }
            }

            if (toolUses.length > 0) {
              // Assistant message must include tool_use content blocks
              const assistantContent: unknown[] = [];
              if (fullContent) assistantContent.push({ type: "text", text: fullContent });
              for (const tu of toolUses) {
                assistantContent.push({ type: "tool_use", id: tu.id, name: tu.name, input: tu.input });
              }
              messages.push({ role: "assistant", content: assistantContent } as never);

              // All tool results go in one user message
              const toolResults: unknown[] = [];
              for (const tu of toolUses) {
                const output = executeTool(tu.name as ToolName, tu.input);
                send({ type: "tool_call", tool: tu.name, input: tu.input, output });
                toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: output });
              }
              messages.push({ role: "user", content: toolResults } as never);
              fullContent = "";
            } else {
              continueLoop = false;
            }
          }

          await prisma.message.create({ data: { runId: currentRunId, role: "assistant", content: fullContent } });
        }

        send({ type: "done", runId: currentRunId });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
