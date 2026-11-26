"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/account";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccount({ username }: { username: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await deleteAccount(confirmation);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await createClient().auth.signOut({ scope: "local" });
      router.push("/");
      router.refresh();
    });
  };

  return (
    <section className="bg-[#F3EFE6] border border-[#A9574D]/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[#343A35]">Excluir conta</h2>
        <p className="text-sm text-[#343A35]/80">
          Apaga seu perfil, biblioteca, sessões, resenhas, comentários, curtidas e seguidores.
          Isso não pode ser desfeito. Cópias de segurança são removidas em ciclo regular, conforme a
          Política de Privacidade.
        </p>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#A9574D] border border-[#A9574D]/40 hover:bg-[#A9574D]/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Excluir minha conta
        </button>
      ) : (
        <form onSubmit={handleDelete} className="space-y-3 animate-fadeIn">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#343A35]">
              Para confirmar, digite seu @: <strong>{username}</strong>
            </span>
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              placeholder={username}
              className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/40 focus:border-[#A9574D]/60 outline-none"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-[#A9574D] font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending || confirmation.trim() !== username}
              className="bg-[#A9574D] hover:bg-[#8a463e] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              {pending ? "Excluindo..." : "Excluir definitivamente"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmation("");
                setError(null);
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}