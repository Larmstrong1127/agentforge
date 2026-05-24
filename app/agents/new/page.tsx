import AgentForm from "@/components/AgentForm";

export default function NewAgentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Agent</h1>
        <p className="text-slate-500 text-sm mt-1">Configure a new AI agent</p>
      </div>
      <AgentForm />
    </div>
  );
}
