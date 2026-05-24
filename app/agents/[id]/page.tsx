"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ChatInterface from "@/components/ChatInterface";
import ProviderBadge from "@/components/ProviderBadge";

interface ToolCall {
  tool: string;
  input: Record<string, unknown>;
  output: string;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  provider: string;
  model: string;
  systemPrompt: string;
  tools: string;
}

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  useEffect(() => {
    fetch(`/api/agents/${id}`).then((r) => r.json()).then(setAgent);
  }, [id]);

  if (!agent) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  const agentTools: string[] = JSON.parse(agent.tools || "[]");

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Agents</Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-white font-semibold">{agent.name}</h1>
          <ProviderBadge provider={agent.provider} />
          <span className="text-xs text-slate-500 font-mono bg-[#0d1526] px-2 py-0.5 rounded border border-slate-700/50">{agent.model}</span>
        </div>
        <Link href={`/agents/${id}/edit`} className="px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-300 text-sm transition-colors">
          Edit
        </Link>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 bg-[#0d1526] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          <ChatInterface agentId={id} onToolCall={(tc) => setToolCalls((prev) => [tc, ...prev])} />
        </div>

        <div className="w-72 flex flex-col gap-4">
          <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wide">System Prompt</h3>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-6 font-mono">{agent.systemPrompt}</p>
          </div>

          {agentTools.length > 0 && (
            <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wide">Tools</h3>
              <div className="flex flex-wrap gap-1.5">
                {agentTools.map((t) => (
                  <span key={t} className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2 flex-1 overflow-hidden">
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wide">Execution Trace</h3>
            {toolCalls.length === 0 ? (
              <p className="text-slate-600 text-xs">Tool calls will appear here</p>
            ) : (
              <div className="overflow-y-auto flex flex-col gap-2">
                {toolCalls.map((tc, i) => (
                  <div key={i} className="bg-[#0a0f1e] border border-slate-700/30 rounded-lg p-2.5 text-xs">
                    <div className="text-cyan-400 font-mono font-medium mb-1">⚙ {tc.tool}</div>
                    <div className="text-slate-500 mb-1">In: {JSON.stringify(tc.input)}</div>
                    <div className="text-slate-400">Out: {tc.output}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
