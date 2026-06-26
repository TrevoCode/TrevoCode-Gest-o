// Plataforma INTERNA: só e-mails desta lista podem acessar /app.
// Definida via env (INTERNAL_ALLOWED_EMAILS), separada por vírgula.
// Ex.: INTERNAL_ALLOWED_EMAILS="fabricio@trevocode.com,yuri@trevocode.com"
const RAW = process.env.INTERNAL_ALLOWED_EMAILS ?? ""

export const ALLOWED_EMAILS = RAW.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  return ALLOWED_EMAILS.includes(email.toLowerCase())
}
