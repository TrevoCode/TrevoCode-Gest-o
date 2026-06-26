import { CalendarDays } from "lucide-react"
import { PlaceholderModulo } from "@/components/internal/PlaceholderModulo"

export const metadata = { title: "Reuniões" }

export default function ReunioesPage() {
  return (
    <PlaceholderModulo
      icon={CalendarDays}
      titulo="Reuniões"
      descricao="Agenda, notas de reunião e follow-ups, vinculados ao cliente."
      fase="Fase 1.2"
    />
  )
}
