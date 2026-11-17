"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { requestGame } from "@/app/actions/requests";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2 text-sm text-[#343A35] placeholder:text-[#343A35]/50 outline-none focus:border-[#66836A]/60";

export default function RequestGame({ initialTitle }: { initialTitle: string }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setLoggedIn(Boolean(data.user)));
  }, []);

  if (sent) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-[#66836A]">
        <CheckCircle2 className="w-5 h-5" />
        Pedido enviado! Vamos analisar e adicionar ao catálogo.
      </p>
    );
  }

  if (loggedIn === false) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
      >
        <PlusCircle className="w-5 h-5" />
        Entre para solicitar inclusão
      </Link>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setTitle(initialTitle);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
      >
        <PlusCircle className="w-5 h-5" />
        Solicitar inclusão
      </button>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestGame(title, platform, notes);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md text-left space-y-3 bg-[#E9E3D5] border border-[#343A35]/10 rounded-xl p-4 animate-fadeIn"
    >
      <label className="block space-y-1">
        <span className="text-xs font-medium text-[#343A35]/80">Nome do jogo</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className={`${inputClass} bg-[#F3EFE6]`}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-[#343A35]/80">Plataforma (opcional)</span>
        <input
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          maxLength={60}
          placeholder="Ex.: PC, Switch"
          className={`${inputClass} bg-[#F3EFE6]`}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-[#343A35]/80">Observação ou link (opcional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
          className={`${inputClass} bg-[#F3EFE6] resize-none`}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-[#A9574D] font-medium">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 rounded-lg text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          {pending ? "Enviando..." : "Enviar pedido"}
        </button>
      </div>
    </form>
  );
}