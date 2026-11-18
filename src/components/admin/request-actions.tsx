"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveRequest, rejectRequest } from "@/app/actions/admin";

const inputClass =
  "w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2 text-sm text-[#343A35] placeholder:text-[#343A35]/50 outline-none focus:border-[#66836A]/60";

export default function RequestActions({ requestId }: { requestId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[#343A35]/80">
            Slug da IGDB (obrigatório para aprovar)
          </span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ex.: hollow-knight-silksong"
            maxLength={100}
            className={inputClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[#343A35]/80">Observação (opcional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#A9574D] font-medium">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => rejectRequest(requestId, note))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 disabled:opacity-60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-[#A9574D]" />
          Recusar
        </button>
        <button
          type="button"
          disabled={pending || !slug.trim()}
          onClick={() => run(() => approveRequest(requestId, slug, note))}
          className="flex items-center gap-1.5 bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Aprovar
        </button>
      </div>
    </div>
  );
}