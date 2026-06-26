// Tom de cor para os "chips" de ícone (KPIs, seções, cabeçalhos).
// Usa os tokens semânticos — funciona em claro e escuro.
export type IconTone = "primary" | "success" | "warning" | "danger" | "info"

export const ICON_TONE: Record<IconTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-muted text-success-muted-foreground",
  warning: "bg-warning-muted text-warning-muted-foreground",
  danger: "bg-danger-muted text-danger-muted-foreground",
  info: "bg-info-muted text-info-muted-foreground",
}
