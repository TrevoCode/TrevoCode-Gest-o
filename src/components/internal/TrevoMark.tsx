"use client"

import { useId } from "react"

// Marca TrevoCode — trevo "pinwheel" de 8 segmentos em tons de verde
// (mesma arte do favicon). Cores fixas da marca; nítida em claro e escuro.
export function TrevoMark({ className }: { className?: string }) {
  const clip = `trevo-${useId().replace(/:/g, "")}`
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <circle cx="24" cy="13" r="13" />
          <circle cx="35" cy="24" r="13" />
          <circle cx="24" cy="35" r="13" />
          <circle cx="13" cy="24" r="13" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <path d="M24 24 84 24 66.4 66.4Z" fill="#16A34A" />
        <path d="M24 24 66.4 66.4 24 84Z" fill="#15803D" />
        <path d="M24 24 24 84 -18.4 66.4Z" fill="#166534" />
        <path d="M24 24 -18.4 66.4 -36 24Z" fill="#15803D" />
        <path d="M24 24 -36 24 -18.4 -18.4Z" fill="#22C55E" />
        <path d="M24 24 -18.4 -18.4 24 -36Z" fill="#6EE7B7" />
        <path d="M24 24 24 -36 66.4 -18.4Z" fill="#A7F3D0" />
        <path d="M24 24 66.4 -18.4 84 24Z" fill="#34D399" />
      </g>
    </svg>
  )
}
