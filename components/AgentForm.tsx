"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OPENAI_MODELS } from "@/lib/providers/openai";
import { ANTHROPIC_MODELS } from "@/lib/providers/anthropic";
import { AVAILABLE_TOOLS } from "@/lib/tools";

interface AgentFormProps {
  initial?: {
    id?: string;
    name?: string;
    description?: string;
    systemPrompt?: string;
    provider?: string;
    model?: string;
    tools?: string;
  };
}

export default function AgentForm({ initial }: AgentFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? "You are a helpful assistant.");
  const [provider, setProvider] = useState<"openai" | "anthropic">(
    (initial?.provider as "openai" | "anthropic") ?? "openai"
  );
  const [model, setModel] = useState(initial?.model ?? "gpt-4o-mini");
  const [tools, setTools] = useState<string[]>(
    initial?.tools ? JSON.parse(initial.tools) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const models = provider === "openai" ? OPENAI_MODELS : ANTHROPIC_MODELS;

  const handleProviderChange = (p: "openai" | "anthropic") => {
    setProvider(p);
    setModel(p === "openai" ? OPENAI_MODELS[0].id : ANTHROPIC_MODELS[0].id);
  };

  const toggleTool = (name: string) => {
    setTools((prev) => prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = initial?.id ? `/api/agents/${initial.id}` : "/api/agents";
      const method = initial?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, systemPrompt, provider, model, tools }),
      });
      if (!res.ok) throw new Error("Failed to save agent");
      const agent = await res.json();
      router.push(`/agents/${agent.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Agent Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Research Agent"
          required
          className="w-full bg-[#0d1526] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-1 block">Description (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this agent do?"
          className="w-full bg-[#0d1526] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-1 block">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          required
          className="w-full bg-[#0d1526] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm font-mono resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 mb-2 block">Provider</label>
          <div className="flex gap-2">
            {(["openai", "anthropic"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleProviderChange(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  provider === p
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                    : "border-slate-700/50 text-slate-400 hover:text-slate-300"
                }`}
              >
                {p === "openai" ? "OpenAI" : "Anthropic"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-2 block">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#0d1526] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-2 block">Tools</label>
        <div className="flex gap-2 flex-wrap">
          {AVAILABLE_TOOLS.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => toggleTool(t.name)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                tools.includes(t.name)
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                  : "border-slate-700/50 text-slate-400 hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-1.5">Tools the agent can call during a conversation</p>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
        >
          {loading ? "Saving..." : initial?.id ? "Update Agent" : "Create Agent"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-300 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
