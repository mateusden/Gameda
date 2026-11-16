"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "entrar" | "criar";

function translateError(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("already registered")) return "Esse e-mail já tem uma conta.";
  if (message.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (message.includes("Database error")) return "Não foi possível criar a conta. Tente outro @.";
  return "Algo deu errado. Tente de novo.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("entrar");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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

    // Criar conta: valida e confere se o @ está livre
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("O @ precisa ter de 3 a 20 caracteres: letras minúsculas, números ou _.");
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
        data: { username },
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