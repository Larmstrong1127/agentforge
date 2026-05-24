"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AgentForm from "@/components/AgentForm";

interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  provider: string;
  model: string;
  tools: string;
}

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetch(`/api/agents/${id}`).then((r) => r.json()).then(setAgent);
  }, [id]);

  if (!agent) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Agent</h1>
        <p className="text-slate-500 text-sm mt-1">{agent.name}</p>
      </div>
      <AgentForm initial={agent} />
    </div>
  );
}
