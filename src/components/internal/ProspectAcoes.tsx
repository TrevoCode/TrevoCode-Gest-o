"use client"

import { useState, useTransition } from "react"
import {
  Sparkles,
  ImagePlus,
  Send,
  CheckCircle2,
  Ban,
  Loader2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"
import {
  gerarIsca,
  gerarIsca2,
  enfileirar,
  registrarToque,
  marcarDesfecho,
  optout,
  type AcaoResultado,
} from "@/lib/prospect-actions"

type Estado = {
  temIsca: boolean
  temIsca2: boolean
  emCadencia: boolean
  fechado: boolean
}

// Botões de ação do lead (chamam a API da máquina via Server Action). Mostram
// "rodando…" e o resultado. A UI de dados atualiza via revalidate/Realtime.
export function ProspectAcoes({ placeId, estado }: { placeId: string; estado: Estado }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)
  const [fechando, setFechando] = useState(false)
  const [ticket, setTicket] = useState("")

  function run(fn: () => Promise<AcaoResultado>, sucesso: string) {
    setMsg(null)
    start(async () => {
      const r = await fn()
      setMsg({ ok: r.ok, texto: r.ok ? sucesso : (r.error ?? "Falhou.") })
      if (r.ok) setFechando(false)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Acao
          icon={Sparkles}
          label={estado.temIsca ? "Regerar isca" : "Gerar isca"}
          tone="primary"
          disabled={pending}
          onClick={() => run(() => gerarIsca(placeId), "Isca gerada.")}
        />
        <Acao
          icon={ImagePlus}
          label={estado.temIsca2 ? "Regerar mockup + demo" : "Gerar mockup + demo"}
          disabled={pending}
          onClick={() => run(() => gerarIsca2(placeId), "Mockup + demo em geração.")}
        />
        {estado.emCadencia ? (
          <Acao
            icon={Send}
            label="Registrar toque"
            disabled={pending}
            onClick={() => run(() => registrarToque(placeId), "Toque registrado.")}
          />
        ) : (
          <Acao
            icon={Send}
            label="Enfileirar na cadência"
            disabled={pending}
            onClick={() => run(() => enfileirar(placeId), "Enfileirado na cadência.")}
          />
        )}
        <Acao
          icon={CheckCircle2}
          label={estado.fechado ? "Fechado ✓" : "Marcar fechamento"}
          tone="success"
          disabled={pending || estado.fechado}
          onClick={() => {
            setMsg(null)
            setFechando((v) => !v)
          }}
        />
        <Acao
          icon={Ban}
          label="Opt-out"
          tone="danger"
          disabled={pending}
          onClick={() => run(() => optout(placeId), "Contato suprimido.")}
        />
      </div>

      {fechando && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <label className="text-xs font-medium">
            <span className="mb-1 block text-muted-foreground">Ticket fechado (R$)</span>
            <input
              type="number"
              inputMode="numeric"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="0"
              className="w-36 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus-visible:border-ring"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  marcarDesfecho(placeId, {
                    closed: true,
                    ticket: ticket ? Number(ticket) : undefined,
                  }),
                "Fechamento registrado."
              )
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            <CheckCircle2 className="size-4" /> Confirmar fechamento
          </button>
        </div>
      )}

      {pending && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Falando com a máquina…
        </p>
      )}
      {msg && !pending && (
        <p
          className={`flex items-center gap-1.5 text-xs ${
            msg.ok ? "text-success" : "text-danger"
          }`}
        >
          {msg.ok ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
          {msg.texto}
        </p>
      )}
    </div>
  )
}

function Acao({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = "neutral",
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: "primary" | "success" | "danger" | "neutral"
}) {
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : tone === "success"
        ? "border border-success/40 text-success hover:bg-success-muted"
        : tone === "danger"
          ? "border border-danger/40 text-danger hover:bg-danger-muted"
          : "border border-border text-foreground hover:bg-accent"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-xs transition-colors disabled:opacity-60 ${cls}`}
    >
      <Icon className="size-4" /> {label}
    </button>
  )
}
