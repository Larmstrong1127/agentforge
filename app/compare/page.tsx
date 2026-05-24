"use client";

import { useState } from "react";
import { OPENAI_MODELS } from "@/lib/providers/openai";
import { ANTHROPIC_MODELS } from "@/lib/providers/anthropic";
import ProviderBadge from "@/components/ProviderBadge";

interface CompareConfig {
  provider: "openai" | "anthropic";
  model: string;
}

interface CompareResult {
  provider: string;
  model: string;
  content: string;
  latencyMs: number;
  error: string | null;
}

const DEFAULT_CONFIGS: CompareConfig[] = [
  { provider: "openai", model: "gpt-4o-mini" },
  { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
];

export default function ComparePage() {
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant. Be concise.");
  const [userMessage, setUserMessage] = useState("");
  const [configs, setConfigs] = useState<CompareConfig[]>(DEFAULT_CONFIGS);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addConfig = () => {
    setConfigs((prev) => [...prev, { provider: "openai", model: "gpt-4o-mini" }]);
  };

  const removeConfig = (i: number) => {
    setConfigs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateConfig = (i: number, field: keyof CompareConfig, value: string) => {
    setConfigs((prev) => {
      const updated = [...prev];
      if (field === "provider") {
        updated[i] = {
          provider: value as "openai" | "anthropic",
          model: value === "openai" ? OPENAI_MODELS[0].id : ANTHROPIC_MODELS[0].id,
        };
      } else {
        updated[i] = { ...updated[i], model: value };
      }
      return updated;
    });
  };

  const runComparison = async () => {
    if (!userMessage.trim() || loading) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userMessage, configs }),
      });
      const data = await res.json();
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  };

  const fastestMs = results.length > 0 ? Math.min(...results.filter((r) => !r.error).map((r) => r.latencyMs)) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compare Models</h1>
        <p className="text-slate-500 text-sm mt-1">Run the same prompt across multiple providers and models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-slate-300 text-sm font-medium">System Prompt</h3>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="bg-[#0a0f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-300 text-sm font-medium">Models</h3>
              <button
                onClick={addConfig}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {configs.map((cfg, i) => {
                const models = cfg.provider === "openai" ? OPENAI_MODELS : ANTHROPIC_MODELS;
                return (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      value={cfg.provider}
                      onChange={(e) => updateConfig(i, "provider", e.target.value)}
                      className="bg-[#0a0f1e] border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                    </select>
                    <select
                      value={cfg.model}
                      onChange={(e) => updateConfig(i, "model", e.target.value)}
                      className="flex-1 bg-[#0a0f1e] border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
                    >
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                    {configs.length > 1 && (
                      <button
                        onClick={() => removeConfig(i)}
                        className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-slate-300 text-sm font-medium">Prompt</h3>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.metaKey && runComparison()}
              placeholder="Enter your message..."
              rows={4}
              className="bg-[#0a0f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <button
              onClick={runComparison}
              disabled={loading || !userMessage.trim()}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
            >
              {loading ? "Running..." : `Compare ${configs.length} Model${configs.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading && (
            <div className="flex flex-col gap-4">
              {configs.map((_, i) => (
                <div key={i} className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-5 h-40 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-[#0d1526] border border-slate-700/50 rounded-xl">
              <div className="text-3xl">⚖️</div>
              <p className="text-slate-400 font-medium">Ready to compare</p>
              <p className="text-slate-600 text-sm">Enter a prompt and hit Compare</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((result, i) => (
                <div key={i} className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderBadge provider={result.provider} />
                      <span className="text-xs text-slate-500 font-mono bg-[#0a0f1e] px-2 py-0.5 rounded border border-slate-700/50">
                        {result.model}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {fastestMs === result.latencyMs && !result.error && (
                        <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          fastest
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">{result.latencyMs}ms</span>
                    </div>
                  </div>
                  {result.error ? (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {result.error}
                    </p>
                  ) : (
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{result.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
