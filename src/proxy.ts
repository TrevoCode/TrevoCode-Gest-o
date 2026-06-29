import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isAllowed } from "@/lib/auth/allowlist"
import { isSupabaseConfigured, isDemoMode } from "@/lib/supabase/config"

// Gateia a área interna /app/* (Proxy do Next 16, ex-middleware).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginRoute = pathname === "/app/login"
  const isInternal = pathname === "/app" || pathname.startsWith("/app/")

  if (!isSupabaseConfigured()) {
    // DEV sem Supabase: MODO DEMONSTRAÇÃO — libera o painel com dados de exemplo.
    if (isDemoMode()) return NextResponse.next({ request })
    // PRODUÇÃO sem Supabase: fail-CLOSED — nunca libera a área interna sem auth.
    if (isInternal && !isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/app/login"
      url.search = ""
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: não rode código entre createServerClient e getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Não autenticado (ou fora da allowlist) tentando acessar área interna → login.
  if (isInternal && !isLoginRoute && !isAllowed(user?.email)) {
    const url = request.nextUrl.clone()
    url.pathname = "/app/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Já autorizado abrindo a tela de login → manda pro dashboard.
  if (isLoginRoute && isAllowed(user?.email)) {
    const url = request.nextUrl.clone()
    url.pathname = "/app"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Roda só na área interna (e ignora estáticos).
  matcher: ["/app/:path*"],
}
