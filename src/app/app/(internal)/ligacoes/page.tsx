import { MailOpen, Phone, PhoneCall, Users } from "lucide-react"
import { obterFilaWhatsapp } from "@/lib/prospeccao"
import { foneWa } from "@/lib/whatsapp-copy"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { Panel } from "@/components/internal/Panel"
import { LigacoesCockpit } from "@/components/internal/LigacoesCockpit"

export const metadata = { title: "Ligações" }

// A fila muda com os eventos de email do dia — nada de cache estático.
export const dynamic = "force-dynamic"

export default async function LigacoesPage() {
  const fila = (await obterFilaWhatsapp()).filter((i) => foneWa(i.phone))
  const abertos = fila.filter((i) => i.abriu).length
  const fixos = fila.filter((i) => foneWa(i.phone)?.fixo).length

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={PhoneCall}
        title="Cockpit de ligações"
        description="Tudo de cada lead numa tela só: com quem falar, endereço, site, nota no Google e a abertura pronta. Divisão pelo DDD do telefone: 31 com o Fabrício, o resto com o Nobre. Melhor janela: 10h às 12h e 14h às 17h, terça a quinta."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Na fila" value={String(fila.length)} hint="tocados por email, sem resposta" />
        <StatCard icon={MailOpen} label="Abriram o email" value={String(abertos)} hint="mais quentes, topo da fila" tone="success" />
        <StatCard icon={Phone} label="Telefone fixo" value={String(fixos)} hint="sem WhatsApp: ligação é o único canal" />
      </div>
      <LigacoesCockpit itens={fila} />
      <div className="mt-6">
        <Panel
          icon={PhoneCall}
          title="Regras da ligação"
          description="O objetivo NÃO é vender no telefone: é validar a dor e sair com o sim pra prévia grátis (ou uma call marcada)."
          bodyClassName="space-y-2 text-sm"
        >
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Abertura do card em 10 segundos, sempre com identificação. Depois a dor com prova: o card diz o caso (sem site ou só Instagram).</li>
            <li>Oferta de risco zero: prévia do site sem custo, mandada no WhatsApp. Perguntar se o número tem WhatsApp.</li>
            <li>Pediu preço, recebe preço: faixa real na hora, e volta pra prévia.</li>
            <li>Esquentou: oferecer 2 horários concretos nas próximas 48h pra call de 30 minutos.</li>
            <li>Deu sim pra prévia ou marcou call: avisar no grupo NA HORA — o mockup sai no mesmo dia.</li>
            <li>Registrar o resultado no card ao desligar; a anotação fica salva neste navegador.</li>
          </ul>
        </Panel>
      </div>
    </div>
  )
}
