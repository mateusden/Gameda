import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/library", "/settings"];
// Rotas que não exigem a data de nascimento
const AGE_EXEMPT_PREFIXES = ["/onboarding", "/login", "/auth", "/api", "/termos", "/privacidade"];
const AGE_COOKIE = "gameda_age_ok";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers?: Record<string, string>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // Evita que CDNs guardem dados de sessão em cache
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Não coloque código entre a criação do cliente e esta chamada
  const { data } = await supabase.auth.getClaims();
  const userId = (data?.claims?.sub as string | undefined) ?? null;
  const isLoggedIn = Boolean(userId);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    // Mantém os cookies que o Supabase possa ter renovado
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isLoggedIn && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirectTo(url);
  }

  // Quem está logado precisa ter informado a data de nascimento
  if (
    userId &&
    !AGE_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    request.cookies.get(AGE_COOKIE)?.value !== userId
  ) {
    const { data: row, error } = await supabase
      .from("profile_private")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    // Se o banco falhar, não trava o site (segue sem bloquear)
    if (!error) {
      if (row) {
        supabaseResponse.cookies.set(AGE_COOKIE, userId, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      } else {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding/idade";
        url.search = "";
        url.searchParams.set("next", pathname + request.nextUrl.search);
        return redirectTo(url);
      }
    }
  }

  return supabaseResponse;
}