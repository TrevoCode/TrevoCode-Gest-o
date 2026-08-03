"use client"

import { useEffect, useMemo, useState } from "react"
import { MailOpen, MessageCircle, Copy, Check, Phone } from "lucide-react"
import { Panel } from "@/components/internal/Panel"
import { cn } from "@/lib/utils"
import type { ChipZap, FilaWhatsappItem } from "@/lib/prospeccao"
import { cidadeCurta, foneWa, mensagemWhatsapp, nichoLabel, nomeDisplay } from "@/lib/whatsapp-copy"

// Fila de envio manual: cada card traz a mensagem pronta (copy A/B/C em
// rodízio) e o link wa.me. O envio é HUMANO, SEMPRE pelo app no CELULAR do
// chip (WhatsApp Web/pareado toma cartão amarelo da Meta). "Enviado" fica no
// navegador de quem opera (localStorage) — bom o bastante pra fila do dia.

const SENDER: Record<ChipZap, string> = { "31": "Fabrício", "11": "Nobre" }
const COPYS = ["A", "B", "C"] as const
const LS_KEY = "zap-enviados"

function lerEnviados(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[])
  } catch {
    return new Set()
  }
}

function Card({
  item,
  copy,
  enviado,
  onToggle,
}: {
  item: FilaWhatsappItem
  copy: (typeof COPYS)[number]
  enviado: boolean
  onToggle: () => void
}) {
  const [copiado, setCopiado] = useState(false)
  const fone = foneWa(item.phone)
  const msg = mensagemWhatsapp(item, copy, SENDER[item.chip])
  if (!fone) return null
  const dias = Math.max(0, Math.floor((Date.now() - new Date(item.email_sent_at).getTime()) / 86400000))

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", enviado && "opacity-50")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-sm">{nomeDisplay(item.name) || item.place_id}</strong>
            {item.abriu && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-muted-foreground">
                <MailOpen className="size-3" /> Abriu o email
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {nichoLabel(item.niche)} · {cidadeCurta(item.city)} · {fone.display}
            {fone.fixo ? " (fixo, pode não ter WhatsApp)" : ""} · copy {copy} · {item.toques} toque(s) · email há {dias}d
          </p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" checked={enviado} onChange={onToggle} className="accent-primary" />
          enviado
        </label>
      </div>
      <textarea
        readOnly
        rows={6}
        value={msg}
        className="mt-3 w-full resize-y rounded-lg border border-border bg-background p-2.5 text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/${fone.wa}?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <MessageCircle className="size-3.5" /> Abrir no WhatsApp
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(msg)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 1500)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
        >
          {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copiado ? "Copiado" : "Copiar mensagem"}
        </button>
      </div>
    </div>
  )
}

const LS_OPERADOR = "zap-operador"

export function WhatsappFila({ itens }: { itens: FilaWhatsappItem[] }) {
  const [enviados, setEnviados] = useState<Set<string>>(new Set())
  const [chip, setChip] = useState<ChipZap>("11")
  useEffect(() => {
    setEnviados(lerEnviados())
    // ?op=nobre|fb no link ganha; senão vale a última escolha deste aparelho.
    const op = new URLSearchParams(window.location.search).get("op")?.toLowerCase()
    if (op === "nobre") setChip("11")
    else if (op === "fb" || op === "fabricio") setChip("31")
    else if (localStorage.getItem(LS_OPERADOR) === "31") setChip("31")
  }, [])
  const trocarChip = (c: ChipZap) => {
    setChip(c)
    localStorage.setItem(LS_OPERADOR, c)
  }
  const toggle = (id: string) => {
    setEnviados((atual) => {
      const prox = new Set(atual)
      if (prox.has(id)) prox.delete(id)
      else prox.add(id)
      localStorage.setItem(LS_KEY, JSON.stringify([...prox]))
      return prox
    })
  }

  // Copy A/B/C em rodízio por chip (mesma regra da lista /zap da máquina).
  const copyPorLead = useMemo(() => {
    const mapa = new Map<string, (typeof COPYS)[number]>()
    for (const chip of ["11", "31"] as const) {
      itens.filter((i) => i.chip === chip).forEach((i, idx) => mapa.set(i.place_id, COPYS[idx % 3]))
    }
    return mapa
  }, [itens])

  const secao = (chip: ChipZap, titulo: string, descricao: string) => {
    const lista = itens.filter((i) => i.chip === chip)
    const feitos = lista.filter((i) => enviados.has(i.place_id)).length
    return (
      <Panel
        icon={Phone}
        title={`${titulo} (${feitos}/${lista.length})`}
        description={descricao}
        bodyClassName="space-y-3"
      >
        {lista.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguém na fila desta praça.</p>
        ) : (
          lista.map((i) => (
            <Card
              key={i.place_id}
              item={i}
              copy={copyPorLead.get(i.place_id) ?? "A"}
              enviado={enviados.has(i.place_id)}
              onToggle={() => toggle(i.place_id)}
            />
          ))
        )}
      </Panel>
    )
  }

  const aba = (c: ChipZap, rotulo: string) => {
    const lista = itens.filter((i) => i.chip === c)
    const feitos = lista.filter((i) => enviados.has(i.place_id)).length
    return (
      <button
        type="button"
        onClick={() => trocarChip(c)}
        className={cn(
          "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          chip === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        )}
      >
        {rotulo}
        <span className={cn("ml-2 text-xs", chip === c ? "text-primary-foreground/80" : "")}>
          {feitos}/{lista.length}
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {aba("11", "Nobre")}
        {aba("31", "FB")}
      </div>
      {chip === "11"
        ? secao("11", "Chip 11 · Nobre · SP e demais cidades", "Quem abriu o email vem primeiro. Enviar SÓ pelo app no celular do chip, 5 a 8 por dia, espaçados.")
        : secao("31", "Chip 31 · Fabrício · BH e região", "Mesma regra: abertos primeiro, envio pelo app do celular, 5 a 8 por dia.")}
    </div>
  )
}
