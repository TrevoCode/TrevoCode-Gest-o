import { MessageCircle, MailOpen, Users, Phone } from "lucide-react"
import { obterFilaWhatsapp } from "@/lib/prospeccao"
import { foneWa } from "@/lib/whatsapp-copy"
import { PageHeader } from "@/components/internal/PageHeader"
import { StatCard } from "@/components/internal/StatCard"
import { SectionTabs, TABS_PROSPECCAO } from "@/components/internal/SectionTabs"
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
    </div>
  )
}
