// Selo de "dor digital" (pain_score 0–100): quanto maior, mais oportunidade.
// Faixas: <40 frio · 40–69 morno · 70+ quente.
export function PainBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const tone =
    score >= 70
      ? "bg-danger-muted text-danger-muted-foreground"
      : score >= 40
        ? "bg-warning-muted text-warning-muted-foreground"
        : "bg-muted text-muted-foreground"
  const cls = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tabular-nums ${tone} ${cls}`}
      title="Dor digital (0–100) — quanto maior, mais oportunidade"
    >
      🔥 {score}
    </span>
  )
}
