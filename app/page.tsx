"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgentCard from "@/components/AgentCard";

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  provider: string;
  model: string;
  updatedAt: string;
  _count?: { runs: number };
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = () =>
    fetch("/api/agents").then((r) => r.json()).then(setAgents).finally(() => setLoading(false));

  useEffect(() => { fetchAgents(); }, []);

  const deleteAgent = async (id: string) => {
    if (!confirm("Delete this agent?")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-slate-500 text-sm mt-1">Build and run AI agents powered by OpenAI and Anthropic</p>
        </div>
        <Link href="/agents/new" className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
          + New Agent
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-4xl">🤖</div>
          <p className="text-slate-400 font-medium">No agents yet</p>
          <p className="text-slate-600 text-sm">Create your first agent to get started</p>
          <Link href="/agents/new" className="mt-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
            Create Agent
          </Link>
        </div>
      )}

      {!loading && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={deleteAgent} />
          ))}
        </div>
      )}
    </div>
  );
}
