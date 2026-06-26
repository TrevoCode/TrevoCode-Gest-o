import { Wallet } from "lucide-react"
import { PlaceholderModulo } from "@/components/internal/PlaceholderModulo"

export const metadata = { title: "Financeiro" }

export default function FinanceiroPage() {
  return (
    <PlaceholderModulo
      icon={Wallet}
      titulo="Financeiro"
      descricao="Faturamento, gastos, fluxo de caixa e margem por projeto/cliente."
      fase="Fase 2"
    />
  )
}
