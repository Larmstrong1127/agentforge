"use client";

import Link from "next/link";
import ProviderBadge from "./ProviderBadge";

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  provider: string;
  model: string;
  updatedAt: string;
  _count?: { runs: number };
}

export default function AgentCard({ agent, onDelete }: { agent: Agent; onDelete: (id: string) => void }) {
  return (
    <div className="bg-[#0d1526] border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{agent.name}</h3>
          {agent.description && <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">{agent.description}</p>}
        </div>
        <ProviderBadge provider={agent.provider} />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="bg-[#0a0f1e] px-2 py-0.5 rounded border border-slate-700/50 font-mono">{agent.model}</span>
        <span>·</span>
        <span>{agent._count?.runs ?? 0} runs</span>
      </div>

      <div className="flex gap-2 mt-auto pt-2">
        <Link
          href={`/agents/${agent.id}`}
          className="flex-1 text-center py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
        >
          Run
        </Link>
        <Link
          href={`/agents/${agent.id}/edit`}
          className="px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-300 text-sm transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(agent.id)}
          className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
