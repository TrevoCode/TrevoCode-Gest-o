import { UserPlus } from "lucide-react"
import { promoverLead } from "@/lib/actions"
import { SubmitButton } from "@/components/internal/SubmitButton"

// Cria um cliente a partir do lead e marca o lead como convertido.
export function PromoverLeadButton({ leadId }: { leadId: string }) {
  return (
    <form action={promoverLead}>
      <input type="hidden" name="lead_id" value={leadId} />
      <SubmitButton className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
        <UserPlus className="size-4" /> Promover a cliente
      </SubmitButton>
    </form>
  )
}
