import { NextResponse } from "next/server";
import { openai } from "@/lib/providers/openai";
import { anthropic } from "@/lib/providers/anthropic";

export async function POST(req: Request) {
  const { systemPrompt, userMessage, configs } = await req.json();

  const results = await Promise.all(
    configs.map(async (cfg: { provider: string; model: string }) => {
      const start = Date.now();
      try {
        let content = "";
        if (cfg.provider === "openai") {
          const res = await openai.chat.completions.create({
            model: cfg.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });
          content = res.choices[0]?.message?.content ?? "";
        } else {
          const res = await anthropic.messages.create({
            model: cfg.model,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }],
          });
          content = res.content[0]?.type === "text" ? res.content[0].text : "";
        }
        return { ...cfg, content, latencyMs: Date.now() - start, error: null };
      } catch (err) {
        return { ...cfg, content: "", latencyMs: Date.now() - start, error: err instanceof Error ? err.message : "Error" };
      }
    })
  );

  return NextResponse.json({ results });
}
