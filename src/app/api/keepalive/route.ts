import { NextResponse } from "next/server";

// Keep-alive do Supabase (free tier pausa projeto sem atividade — em 15/07/2026 o banco
// foi pausado/removido e derrubou o login de todo o time). O cron diário da Vercel
// (vercel.json) bate aqui; qualquer request à API do Supabase conta como atividade.
// A rota não expõe dado: o select roda como anon e a RLS nega — o que importa é o hit.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ ok: false, motivo: "sem env" }, { status: 500 });

  const res = await fetch(`${url}/rest/v1/config_empresa?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    cache: "no-store",
  });
  // 200 (vazio pela RLS) ou 401/406 — tanto faz: o projeto registrou atividade
  return NextResponse.json({ ok: true, supabase_status: res.status });
}
