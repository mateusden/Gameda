"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ready" | "nosession";

function translateError(message: string) {
  if (message.includes("should be different")) return "A nova senha precisa ser diferente da atual.";
  if (message.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  return "Não foi possível atualizar a senha. Tente de novo.";
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setStatus(data.user ? "ready" : "nosession"));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não são iguais.");
      return;
    }

    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });

    if (error) {
      setError(translateError(error.message));
      setSaving(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  const inputClass =
    "w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none transition-colors";

  if (status === "loading") return null;

  if (status === "nosession") {
    return (
      <div className="mx-auto max-w-md py-8 sm:py-12">
        <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">Link expirado</h1>
          <p className="text-sm text-[#343A35]/70">
            Não encontramos uma sessão de recuperação. Peça um novo link.
          </p>
          <Link
            href="/recuperar-senha"
            className="inline-block bg-[#66836A] hover:bg-[#263A30] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            Pedir novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">Nova senha</h1>
          <p className="text-sm text-[#343A35]/70">Escolha a nova senha da sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#343A35]">Nova senha</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className={inputClass}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#343A35]">Repita a nova senha</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            disabled={saving}
            className="w-full bg-[#66836A] hover:bg-[#263A30] active:scale-95 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
          >
            {saving ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}