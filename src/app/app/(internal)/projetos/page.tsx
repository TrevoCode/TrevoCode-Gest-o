import { FolderKanban } from "lucide-react"
import { PlaceholderModulo } from "@/components/internal/PlaceholderModulo"

export const metadata = { title: "Projetos" }

export default function ProjetosPage() {
  return (
    <PlaceholderModulo
      icon={FolderKanban}
      titulo="Projetos"
      descricao="Projetos por cliente: status, prazos, contrato (avulso ou recorrente)."
      fase="Fase 1.3"
    />
  )
}
