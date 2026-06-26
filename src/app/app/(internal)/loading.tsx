// Skeleton exibido durante a navegação / carregamento das páginas internas.
// Reserva espaço para evitar "pulo" de conteúdo quando as queries reais entrarem.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="mt-2 h-4 w-72 rounded bg-muted/70" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-xl border border-border bg-card" />
    </div>
  )
}
