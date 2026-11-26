"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { brToIso, isOldEnough, maskDate, MIN_AGE } from "@/lib/age";
import Link from "next/link";

type Mode = "entrar" | "criar";

function translateError(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("already registered")) return "Esse e-mail já tem uma conta.";
  if (message.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (message.includes("Database error")) return "Não foi possível criar a conta. Confira os dados e tente de novo.";
  return "Algo deu errado. Tente de novo.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("entrar");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [info, setInfo] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Não foi possível entrar com o Google.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        router.push("/");
        router.refresh();
      }
      setLoading(false);
      return;
    }

    // Criar conta: valida o @, a idade e confere se o @ está livre
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("O @ precisa ter de 3 a 20 caracteres: letras minúsculas, números ou _.");
      setLoading(false);
      return;
    }

    const birthIso = brToIso(birthDate);
    if (!birthIso || birthIso > new Date().toLocaleDateString("sv-SE")) {
      setError("Data de nascimento inválida. Use dia/mês/ano, por exemplo 15/11/2000.");
      setLoading(false);
      return;
    }
    if (!isOldEnough(birthIso)) {
      setError(`O Gameda é para maiores de ${MIN_AGE} anos.`);
      setLoading(false);
      return;
    }

    if (!accepted) {
      setError("Aceite os Termos de Uso e a Política de Privacidade para continuar.");
      setLoading(false);
      return;
    }

    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (taken) {
      setError("Esse @ já está em uso. Escolha outro.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username, birth_date: birthIso },
      },
    });

    if (error) {
      setError(translateError(error.message));
    } else if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setInfo("Conta criada! Confira seu e-mail para confirmar o cadastro.");
    }

    setLoading(false);
  };

  const inputClass =
    "w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none transition-colors";

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">
            {mode === "entrar" ? "Entrar no Gameda" : "Criar sua conta"}
          </h1>
          <p className="text-sm text-[#343A35]/70">
            {mode === "entrar"
              ? "Acesse sua biblioteca e suas sessões."
              : "Comece a registrar suas jogatinas."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "criar" && (
            <>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[#343A35]">Nome de usuário</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#343A35]/50">
                    @
                  </span>
                  <input
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    }
                    maxLength={20}
                    placeholder="seunome"
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <span className="block text-xs text-[#343A35]/60">
                  3 a 20 caracteres: letras minúsculas, números ou _.
                </span>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[#343A35]">Data de nascimento</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  autoComplete="bday"
                  value={birthDate}
                  onChange={(e) => setBirthDate(maskDate(e.target.value))}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className={inputClass}
                />
                <span className="block text-xs text-[#343A35]/60">
                  O Gameda é para maiores de {MIN_AGE} anos. A data não aparece no seu perfil.
                </span>
              </label>
            </>
          )}

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

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#343A35]">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "entrar" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className={inputClass}
            />
          </label>

          {mode === "entrar" && (
            <div className="-mt-2 text-right">
              <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-[#66836A] hover:text-[#263A30]"
              >
                Esqueci minha senha
              </Link>
            </div>
          )}

          {mode === "criar" && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#66836A] cursor-pointer"
              />
              <span className="text-xs text-[#343A35]/80">
                Tenho {MIN_AGE} anos ou mais e aceito os{" "}
                <a href="/termos" target="_blank" className="font-semibold text-[#66836A] hover:text-[#263A30]">
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="/privacidade" target="_blank" className="font-semibold text-[#66836A] hover:text-[#263A30]">
                  Política de Privacidade
                </a>
                .
              </span>
            </label>
          )}

          {error && (
            <p role="alert" className="text-sm text-[#A9574D] font-medium">
              {error}
            </p>
          )}
          {info && <p className="text-sm text-[#66836A] font-medium">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#66836A] hover:bg-[#263A30] active:scale-95 disabled:opacity-60 disabled:active:scale-100 text-white py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
          >
            {loading ? "Aguarde..." : mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-[#343A35]/50">
          <span className="h-px flex-1 bg-[#343A35]/10" />
          ou
          <span className="h-px flex-1 bg-[#343A35]/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-[#E9E3D5] hover:bg-[#343A35]/10 border border-[#343A35]/10 text-[#343A35] py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continuar com o Google
        </button>
        <p className="text-xs text-[#343A35]/60 text-center -mt-3">
          Ao continuar com o Google, você precisará informar sua data de nascimento (maiores de {MIN_AGE} anos).
        </p>

        <p className="text-sm text-[#343A35]/70 text-center">
          {mode === "entrar" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "entrar" ? "criar" : "entrar");
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-[#66836A] hover:text-[#263A30] cursor-pointer"
          >
            {mode === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}