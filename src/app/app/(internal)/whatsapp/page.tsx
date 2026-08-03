import { MessageCircle, MailOpen, Users, Phone, PhoneCall } from "lucide-react"
import { obterFilaWhatsapp } from "@/lib/prospeccao"
import { foneWa } from "@/lib/whatsapp-copy"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
import { Panel } from "@/components/internal/Panel"
import { WhatsappFila } from "@/components/internal/WhatsappFila"

export const metadata = { title: "WhatsApp" }

// A fila muda com os eventos de email do dia — nada de cache estático.
export const dynamic = "force-dynamic"

export default async function WhatsappPage() {
  const fila = (await obterFilaWhatsapp()).filter((i) => foneWa(i.phone))
  const abertos = fila.filter((i) => i.abriu).length
  const chip11 = fila.filter((i) => i.chip === "11").length

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={MessageCircle}
        title="Follow-up de WhatsApp"
        description="Leads que já receberam o email frio e não responderam, com a mensagem pronta pra enviar. Quem ABRIU o email vem no topo. Envio sempre pelo app no celular do chip (nunca WhatsApp Web), 5 a 8 por dia."
      />
      <SectionTabs tabs={TABS_PROSPECCAO} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Na fila" value={String(fila.length)} hint="tocados por email, sem resposta" />
        <StatCard icon={MailOpen} label="Abriram o email" value={String(abertos)} hint="segmento mais quente, topo da fila" tone="success" />
        <StatCard icon={Phone} label="Chip 11 (Nobre)" value={String(chip11)} hint="SP e demais cidades" />
      </div>
      <WhatsappFila itens={fila} />
      <div className="mt-6">
        <Panel
          icon={PhoneCall}
          title="Roteiro de ligação"
          description="Objetivo da ligação NÃO é vender o site no telefone: é validar a dor e sair com o sim pra prévia (ou uma call marcada). Melhor janela: 10h às 12h e 14h às 17h, terça a quinta."
          bodyClassName="space-y-2 text-sm"
        >
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Abertura (10 segundos, sempre com identificação):</strong> &quot;Oi, tudo bem? Sou o [seu nome], da Trevo Code. Te ligo por um motivo só: pesquisei [nicho] aqui em [cidade] no Google e quem aparece é concorrente, a [empresa] não. Consegue falar 1 minuto?&quot;
            </li>
            <li>
              <strong>Dor com prova, sem vender ainda:</strong> o card do lead diz o caso dele (sem site ou só Instagram). &quot;Todo dia tem gente digitando [nicho] perto de mim e caindo no concorrente.&quot;
            </li>
            <li>
              <strong>Oferta de risco zero:</strong> &quot;Monto uma prévia do site de vocês sem custo nenhum e te mando no WhatsApp. Você olha pronta e decide. Esse número tem WhatsApp?&quot;
            </li>
            <li>
              <strong>Pediu preço, recebe preço:</strong> fala a faixa real na hora, sem enrolar, e volta pra prévia: &quot;te mando a prévia antes, pra você ver exatamente o que está avaliando&quot;.
            </li>
            <li>
              <strong>Esquentou:</strong> oferece 2 horários concretos nas próximas 48h (&quot;amanhã 14h ou quinta 10h?&quot;) pra uma call de 30 minutos mostrando a prévia.
            </li>
            <li>
              <strong>Objeções:</strong> &quot;já tenho Instagram&quot; = Instagram atende quem já conhece vocês, o site pega quem procura e ainda não conhece · &quot;sem tempo&quot; = a prévia chega pronta, 1 minuto pra olhar · &quot;manda por email&quot; = manda na hora e combina quando retorna.
            </li>
            <li>
              <strong>Deu sim pra prévia ou marcou call:</strong> avisar no grupo NA HORA — o mockup sai no mesmo dia.
            </li>
          </ol>
        </Panel>
      </div>
    </div>
  )
}
