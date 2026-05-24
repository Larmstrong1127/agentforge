const STYLES = {
  openai: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  anthropic: "bg-orange-500/10 border-orange-500/30 text-orange-400",
};

const LABELS = { openai: "OpenAI", anthropic: "Anthropic" };

export default function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STYLES[provider as keyof typeof STYLES] ?? "bg-slate-500/10 border-slate-500/30 text-slate-400"}`}>
      {LABELS[provider as keyof typeof LABELS] ?? provider}
    </span>
  );
}
