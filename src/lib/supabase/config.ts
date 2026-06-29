// Verdadeiro só quando o Supabase está configurado (URL + anon key).
// Usado para degradar com elegância — fail-closed — quando o .env.local
// ainda não foi preenchido, em vez de estourar 500 ao instanciar o client.
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Modo demonstração (libera /app sem login) só é permitido FORA de produção.
// Em produção, Supabase ausente = fail-CLOSED: nunca abrir a área interna sem
// autenticação — evita que um deploy com env faltando vaze tudo publicamente.
export function isDemoMode(): boolean {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production"
}
