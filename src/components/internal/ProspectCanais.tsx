"use client"

import { useState, useTransition } from "react"
import {
  Mail,
  AtSign,
  MessageCircle,
  Search,
  Send,
  ExternalLink,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import {
  descobrirContato,
  enviarEmail,
  marcarIgEnviado,
  type AcaoResultado,
} from "@/lib/prospect-actions"

export type CanaisLead = {
  phone?: string | null
  email?: string | null
  emailStatus?: string | null // discovered|sent|delivered|opened|clicked|bounced|unsubscribed
  instagram?: string | null
  igStatus?: string | null // sent|replied
  temIscaEmail?: boolean
}

// Painel de canais do lead: WhatsApp / Email / Instagram, cada um com status +
// ação. As ações chamam a API da máquina (Server Actions); a UI atualiza via
// revalidate/Realtime. Instagram é manual — a Meta não permite DM frio.
export function ProspectCanais({ placeId, lead = {} }: { placeId: string; lead?: CanaisLead }) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  function run(fn: () => Promise<AcaoResultado>, sucesso: string) {
    setMsg(null)
    start(async () => {
      const r = await fn()
      setMsg({ ok: r.ok, texto: r.ok ? sucesso : r.error ?? "Falhou." })
    })
  }

  const temEmail = Boolean(lead.email)
  const igHandle = lead.instagram?.replace(/^@/, "")

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Canais</h3>
        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="space-y-2.5">
        {/* WhatsApp */}
        <Linha icon={MessageCircle} nome="WhatsApp" valor={lead.phone ?? "—"} status={null} />

        {/* Email */}
        <Linha
          icon={Mail}
          nome="Email"
          valor={lead.email ?? "não descoberto"}
          status={lead.emailStatus ?? null}
        >
          {!temEmail ? (
            <Btn
              icon={Search}
              label="Descobrir"
              disabled={pending}
              onClick={() => run(() => descobrirContato(placeId), "Varredura feita.")}
            />
          ) : (
            <Btn
              icon={Send}
              label="Enviar isca"
              tone="primary"
              disabled={pending}
              onClick={() => run(() => enviarEmail(placeId), "Email enviado.")}
            />
          )}
        </Linha>

        {/* Instagram (manual) */}
        <Linha
          icon={AtSign}
          nome="Instagram"
          valor={lead.instagram ?? "não descoberto"}
          status={lead.igStatus ?? null}
        >
          {igHandle ? (
            <>
              <a
                href={`https://instagram.com/${igHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <ExternalLink className="size-3.5" /> Abrir
              </a>
              <Btn
                icon={CheckCircle2}
                label="Marcar DM enviada"
                disabled={pending}
                onClick={() => run(() => marcarIgEnviado(placeId), "DM registrada.")}
              />
            </>
          ) : (
            <Btn
              icon={Search}
              label="Descobrir"
              disabled={pending}
              onClick={() => run(() => descobrirContato(placeId), "Varredura feita.")}
            />
          )}
        </Linha>
      </div>

      {msg && (
        <p className={`mt-3 text-xs ${msg.ok ? "text-emerald-600" : "text-destructive"}`}>{msg.texto}</p>
      )}
    </div>
  )
}

function Linha({
  icon: Icon,
  nome,
  valor,
  status,
  children,
}: {
  icon: LucideIcon
  nome: string
  valor: string
  status: string | null
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{nome}</span>
          {status && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {status}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{valor}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">{children}</div>
    </div>
  )
}

function Btn({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: "primary"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-50 ${
        tone === "primary"
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "border border-border hover:bg-accent"
      }`}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  )
}
