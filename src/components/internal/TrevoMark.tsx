// Marca TrevoCode — quatrefoil (trevo de 4 folhas) em tom único, herda
// currentColor. Mesmo silhueta do favicon; nítido em qualquer tamanho.
export function TrevoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="6.6" r="6.3" />
      <circle cx="17.4" cy="12" r="6.3" />
      <circle cx="12" cy="17.4" r="6.3" />
      <circle cx="6.6" cy="12" r="6.3" />
    </svg>
  )
}
