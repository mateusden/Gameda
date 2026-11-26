"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function translateError(message: string) {
  if (message.toLowerCase().includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  }
  return "Não foi possível enviar o e-mail. Tente de novo.";
}

function RecoverForm() {
  const params = useSearchParams();
  const linkInvalid = params.get("erro") === "link";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/atualizar-senha`,
    });

    if (error) {
      setError(translateError(error.message));
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const inputClass =
    "w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none transition-colors";

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">Recuperar senha</h1>
          <p className="text-sm text-[#343A35]/70">
            Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
          </p>
        </div>

        {linkInvalid && !sent && (
          <p role="alert" className="text-sm text-[#A9574D] font-medium">
            Esse link é inválido ou expirou. Peça um novo abaixo. Abra o link no mesmo navegador
            em que fez o pedido.
          </p>
        )}

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-[#66836A] font-medium">
              Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.
              Confira também a caixa de spam. Abra o link no mesmo navegador em que fez o pedido.
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold text-[#66836A] hover:text-[#263A30]"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#343A35]">E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className={inputClass}
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-[#A9574D] font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#66836A] hover:bg-[#263A30] active:scale-95 disabled:opacity-60 disabled:active:scale-100 text-white py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-[#343A35]/70 hover:text-[#66836A] transition-colors"
            >
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RecoverPasswordPage() {
  return (
    <Suspense fallback={null}>
      <RecoverForm />
    </Suspense>
  );
}