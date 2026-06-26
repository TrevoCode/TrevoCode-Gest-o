import { Users } from "lucide-react"
import { PlaceholderModulo } from "@/components/internal/PlaceholderModulo"

export const metadata = { title: "Clientes" }

export default function ClientesPage() {
  return (
    <PlaceholderModulo
      icon={Users}
      titulo="Clientes / CRM"
      descricao="Inbox de leads do site, pipeline comercial e contatos."
      fase="Próximo a construir — Fase 1.1"
    />
  )
}
