import { Settings } from "lucide-react"
import { PlaceholderModulo } from "@/components/internal/PlaceholderModulo"

export const metadata = { title: "Configurações" }

export default function ConfigPage() {
  return (
    <PlaceholderModulo
      icon={Settings}
      titulo="Configurações"
      descricao="Equipe (allowlist), integrações e preferências da plataforma."
      fase="Fase 4"
    />
  )
}
