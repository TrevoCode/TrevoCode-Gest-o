"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  Check,
  Copy,
  Gem,
  Globe,
  MailOpen,
  MapPin,
  MessageCircle,
  Phone,
  Smartphone,
  Star,
  User,
} from "lucide-react"
import { Panel } from "@/components/internal/Panel"
import { cn } from "@/lib/utils"
import type { FilaWhatsappItem } from "@/lib/prospeccao"
import { cidadeCurta, foneWa, nichoLabel, nomeDisplay } from "@/lib/whatsapp-copy"
import {
  RESULTADOS,
  aberturaLigacao,
  anoInicio,
  dddDe,
  mapsUrl,
  porteLabel,
  siteInfo,
  type ResultadoLigacao,
} from "@/lib/ligacoes"

// Cockpit de ligação: mesmo público da fila de WhatsApp, mas o card é um
// dossiê completo pra ligar sem pesquisar nada. Divisão de operador pelo
// DDD do telefone: 31 = Fabrício; demais DDDs = Nobre (agrupados por DDD,
// pra ligar região por região). Resultado e anotação ficam no navegador de
// quem opera (localStorage) — plataforma segue SÓ lendo o schema prospect.

type Registro = { r: ResultadoLigacao; nota: string; at: string }
const LS_KEY = "lig-resultados"
const LS_OPERADOR = "lig-operador"
const SENDER: Record<string, string> = { fb: "Fabrício", nobre: "Nobre" }

function lerRegistros(): Record<string, Registro> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") as Record<string, Registro>
  } catch {
    return {}
  }
}

const fmtSP = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
})

function Badge({ tone, children }: { tone: "success" | "warn" | "muted"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "success" && "bg-success-muted text-success-muted-foreground",
        tone === "warn" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        tone === "muted" && "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}

function Card({
  item,
  sender,
  registro,
  onRegistro,
}: {
  item: FilaWhatsappItem
  sender: string
  registro: Registro | undefined
  onRegistro: (r: Partial<Registro>) => void
}) {
  const [copiado, setCopiado] = useState<"fone" | "abertura" | null>(null)
  const fone = foneWa(item.phone)
  if (!fone) return null
  const site = siteInfo(item)
  const abertura = aberturaLigacao(item, sender)
  const ano = anoInicio(item.reasons)
  const porte = porteLabel(item.reasons)
  const resultado = registro?.r ?? ""
  const encerrado = resultado === "sem_interesse" || resultado === "numero_errado"

  const copiar = async (texto: string, qual: "fone" | "abertura") => {
    await navigator.clipboard.writeText(texto)
    setCopiado(qual)
    setTimeout(() => setCopiado(null), 1500)
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        resultado === "quer_previa" && "border-success",
        encerrado && "opacity-50"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-base">{nomeDisplay(item.name) || item.place_id}</strong>
            {item.premium && (
              <Badge tone="success">
                <Gem className="size-3" /> Porte EPP ou maior
              </Badge>
            )}
            {item.abriu && (
              <Badge tone="success">
                <MailOpen className="size-3" /> Abriu o email
              </Badge>
            )}
            {fone.fixo ? (
              <Badge tone="warn">
                <Phone className="size-3" /> Fixo, só voz
              </Badge>
            ) : (
              <Badge tone="muted">
                <Smartphone className="size-3" /> Celular
              </Badge>
            )}
            <Badge tone={site.tem ? "muted" : "warn"}>
              <Globe className="size-3" /> {site.rotulo}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {nichoLabel(item.niche)} · {cidadeCurta(item.city)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold tabular-nums">{fone.display}</div>
          <div className="text-xs text-muted-foreground">DDD {dddDe(item.phone)}</div>
        </div>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <p className="flex items-start gap-1.5">
          <User className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          {item.owner_name ? (
            <span>
              Falar com <strong>{item.owner_name}</strong>
            </span>
          ) : (
            <span className="text-muted-foreground">Dono não identificado. Pedir pelo responsável.</span>
          )}
        </p>
        <p className="flex items-start gap-1.5">
          <Star className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          {item.rating != null ? (
            <span>
              {String(item.rating).replace(".", ",")} no Google · {item.reviews_count ?? 0} avaliações
            </span>
          ) : (
            <span className="text-muted-foreground">Sem nota no Google</span>
          )}
        </p>
        <p className="flex items-start gap-1.5 sm:col-span-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <span>
            {item.address ?? <span className="text-muted-foreground">Endereço não disponível</span>}{" "}
            <a href={mapsUrl(item)} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">
              ver no Maps
            </a>
          </span>
        </p>
        {(ano || porte) && (
          <p className="flex items-start gap-1.5">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <span>
              {ano ? `No mercado desde ${ano}` : ""}
              {ano && porte ? " · " : ""}
              {porte ?? ""}
            </span>
          </p>
        )}
        {site.url && (
          <p className="flex items-start gap-1.5">
            <Globe className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <a href={site.url} target="_blank" rel="noreferrer" className="truncate text-primary underline-offset-2 hover:underline">
              {site.url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </p>
        )}
        <p className="flex items-start gap-1.5 sm:col-span-2">
          <MailOpen className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            {item.premium ? "Nunca tocado por email: ligação a frio, sem referência de contato anterior" : `${item.toques} email(s) enviado(s)`}
            {item.isca_email_subj ? (
              <>
                , último assunto: <em className="text-foreground">{item.isca_email_subj}</em>
              </>
            ) : null}
            {item.abriu && item.email_event_at ? ` · abriu em ${fmtSP.format(new Date(item.email_event_at))}` : ""}
          </span>
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-background p-2.5">
        <p className="text-xs font-medium text-muted-foreground">Abertura (10 segundos, ler natural)</p>
        <p className="mt-1 text-sm">{abertura}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={`tel:+${fone.wa}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <Phone className="size-3.5" /> Ligar
        </a>
        {!fone.fixo && (
          <a
            href={`https://wa.me/${fone.wa}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
          >
            <MessageCircle className="size-3.5" /> WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => copiar(fone.display, "fone")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
        >
          {copiado === "fone" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copiado === "fone" ? "Copiado" : "Copiar número"}
        </button>
        <select
          value={resultado}
          onChange={(e) => onRegistro({ r: e.target.value as ResultadoLigacao, at: new Date().toISOString() })}
          className="ml-auto rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-medium"
        >
          {RESULTADOS.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.rotulo}
            </option>
          ))}
        </select>
      </div>
      {resultado !== "" && (
        <textarea
          rows={2}
          placeholder="Anotação da ligação (fica só neste navegador)"
          value={registro?.nota ?? ""}
          onChange={(e) => onRegistro({ nota: e.target.value })}
          className="mt-2 w-full resize-y rounded-lg border border-border bg-background p-2.5 text-sm"
        />
      )}
    </div>
  )
}

const LS_FONTE = "lig-fonte"

export function LigacoesCockpit({ itens, premium }: { itens: FilaWhatsappItem[]; premium: FilaWhatsappItem[] }) {
  const [registros, setRegistros] = useState<Record<string, Registro>>({})
  const [operador, setOperador] = useState<"fb" | "nobre">("nobre")
  const [fonte, setFonte] = useState<"premium" | "email">("premium")
  useEffect(() => {
    setRegistros(lerRegistros())
    const op = new URLSearchParams(window.location.search).get("op")?.toLowerCase()
    if (op === "nobre") setOperador("nobre")
    else if (op === "fb" || op === "fabricio") setOperador("fb")
    else if (localStorage.getItem(LS_OPERADOR) === "fb") setOperador("fb")
    if (localStorage.getItem(LS_FONTE) === "email") setFonte("email")
  }, [])
  const trocarFonte = (f: "premium" | "email") => {
    setFonte(f)
    localStorage.setItem(LS_FONTE, f)
  }
  const trocar = (o: "fb" | "nobre") => {
    setOperador(o)
    localStorage.setItem(LS_OPERADOR, o)
  }
  const registrar = (id: string) => (parcial: Partial<Registro>) => {
    setRegistros((atual) => {
      const base: Registro = atual[id] ?? { r: "", nota: "", at: new Date().toISOString() }
      const prox = { ...atual, [id]: { ...base, ...parcial } }
      localStorage.setItem(LS_KEY, JSON.stringify(prox))
      return prox
    })
  }

  // Divisão pelo DDD do telefone: 31 = FB; demais = Nobre, agrupado por DDD.
  // Ordem: fila do email = abertos primeiro, fixos na frente; premium = maior
  // movimento no Google primeiro (reviews desc).
  const { deFb, gruposNobre } = useMemo(() => {
    const ativos = fonte === "premium" ? premium : itens
    const ordena =
      fonte === "premium"
        ? (a: FilaWhatsappItem, b: FilaWhatsappItem) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0)
        : (a: FilaWhatsappItem, b: FilaWhatsappItem) => {
            const fixo = (i: FilaWhatsappItem) => Number(foneWa(i.phone)?.fixo ?? false)
            return Number(b.abriu) - Number(a.abriu) || fixo(b) - fixo(a) || a.email_sent_at.localeCompare(b.email_sent_at)
          }
    const deFb = ativos.filter((i) => dddDe(i.phone) === "31").sort(ordena)
    const porDdd = new Map<string, FilaWhatsappItem[]>()
    for (const i of ativos.filter((i) => dddDe(i.phone) !== "31")) {
      const d = dddDe(i.phone)
      porDdd.set(d, [...(porDdd.get(d) ?? []), i])
    }
    const gruposNobre = [...porDdd.entries()]
      .map(([ddd, lista]) => ({ ddd, lista: lista.sort(ordena), cidades: [...new Set(lista.map((i) => cidadeCurta(i.city)))] }))
      .sort((a, b) => b.lista.length - a.lista.length || a.ddd.localeCompare(b.ddd))
    return { deFb, gruposNobre }
  }, [itens, premium, fonte])

  const feitos = (lista: FilaWhatsappItem[]) => lista.filter((i) => (registros[i.place_id]?.r ?? "") !== "").length
  const doNobre = gruposNobre.flatMap((g) => g.lista)

  const aba = (o: "fb" | "nobre", rotulo: string, lista: FilaWhatsappItem[]) => (
    <button
      type="button"
      onClick={() => trocar(o)}
      className={cn(
        "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        operador === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
    >
      {rotulo}
      <span className={cn("ml-2 text-xs", operador === o ? "text-primary-foreground/80" : "")}>
        {feitos(lista)}/{lista.length}
      </span>
    </button>
  )

  const descOrdem =
    fonte === "premium"
      ? "Empresas EPP ou maiores, 50+ avaliações e nota 4,3+ no Google. Maior movimento primeiro."
      : "Quem abriu o email vem primeiro; fixo (só voz) na frente do celular."

  const cards = (lista: FilaWhatsappItem[]) =>
    lista.map((i) => (
      <Card key={i.place_id} item={i} sender={SENDER[operador]} registro={registros[i.place_id]} onRegistro={registrar(i.place_id)} />
    ))

  const abaFonte = (f: "premium" | "email", rotulo: string, n: number) => (
    <button
      type="button"
      onClick={() => trocarFonte(f)}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        fonte === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
    >
      {f === "premium" && <Gem className="size-3.5" />}
      {rotulo}
      <span className={cn("text-xs", fonte === f ? "text-primary-foreground/80" : "")}>{n}</span>
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {abaFonte("premium", "Premium (a frio)", premium.length)}
        {abaFonte("email", "Fila do email", itens.length)}
      </div>
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {aba("nobre", "Nobre · fora do 31", doNobre)}
        {aba("fb", "FB · DDD 31", deFb)}
      </div>
      {operador === "fb" ? (
        <Panel
          icon={Phone}
          title={`DDD 31 · BH e região (${feitos(deFb)}/${deFb.length})`}
          description={descOrdem}
          bodyClassName="space-y-3"
        >
          {deFb.length === 0 ? <p className="text-sm text-muted-foreground">Ninguém na fila do DDD 31.</p> : cards(deFb)}
        </Panel>
      ) : gruposNobre.length === 0 ? (
        <Panel icon={Phone} title="Fora do DDD 31" bodyClassName="space-y-3">
          <p className="text-sm text-muted-foreground">Ninguém na fila fora do DDD 31.</p>
        </Panel>
      ) : (
        gruposNobre.map((g) => (
          <Panel
            key={g.ddd}
            icon={Phone}
            title={`DDD ${g.ddd} · ${g.cidades.join(", ")} (${feitos(g.lista)}/${g.lista.length})`}
            description={descOrdem}
            bodyClassName="space-y-3"
          >
            {cards(g.lista)}
          </Panel>
        ))
      )}
    </div>
  )
}
