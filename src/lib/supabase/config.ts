// Verdadeiro só quando o Supabase está configurado (URL + anon key).
// Usado para degradar com elegância — fail-closed — quando o .env.local
// ainda não foi preenchido, em vez de estourar 500 ao instanciar o client.
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
