import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Só aceita caminhos do próprio site
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const isRecovery = safeNext === "/atualizar-senha";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Recuperação de senha: vai direto para a tela da nova senha
      if (isRecovery) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }

      // Conta nova com @ automático: leva para escolher o @
      const { data: claims } = await supabase.auth.getClaims();
      const userId = claims?.claims?.sub;

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .maybeSingle();

        if (profile && /^user_[0-9a-f]{10}$/.test(profile.username)) {
          return NextResponse.redirect(`${origin}/settings/profile?novo=1`);
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(
    isRecovery ? `${origin}/recuperar-senha?erro=link` : `${origin}/login?erro=callback`
  );
}