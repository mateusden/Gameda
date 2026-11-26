"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteSession, updateSession } from "@/app/actions/library";
import { brToIso, maskDate } from "@/lib/age";
import { formatHours } from "@/lib/library";

interface SessionCardProps {
  id: number;
  slug: string;
  platform: string;
  playedOn: string; // AAAA-MM-DD
  minutes: number;
  comment: string | null;
  platforms: string[]; // opções de plataforma
}

const inputClass =
  "bg-[#F3EFE6] border border-[#343A35]/10 rounded-lg px-3 py-2 text-sm text-[#343A35] placeholder:text-[#343A35]/50 outline-none focus:border-[#66836A]/60 w-full";

function isoToBr(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function SessionCard({
  id,
  slug,
  platform,
  playedOn,
  minutes,
  comment,
  platforms,
}: SessionCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ePlatform, setEPlatform] = useState(platform);
  const [date, setDate] = useState(isoToBr(playedOn));
  const [hours, setHours] = useState(String(Math.floor(minutes / 60)));
  const [mins, setMins] = useState(String(minutes % 60));
  const [text, setText] = useState(comment ?? "");

  const options = Array.from(new Set([platform, ...platforms]));

  const startEdit = () => {
    setEPlatform(platform);
    setDate(isoToBr(playedOn));
    setHours(String(Math.floor(minutes / 60)));
    setMins(String(minutes % 60));
    setText(comment ?? "");
    setError(null);
    setEditing(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const iso = brToIso(date);
    if (!iso) {
      setError("Data inválida. Use dia/mês/ano, por exemplo 15/11/2026.");
      return;
    }
    if (iso > new Date().toLocaleDateString("sv-SE")) {
      setError("A data não pode estar no futuro.");
      return;
    }

    const total = Number(hours || 0) * 60 + Number(mins || 0);

    startTransition(async () => {
      const result = await updateSession({
        sessionId: id,
        slug,
        platform: ePlatform,
        playedOn: iso,
        minutes: total,
        comment: text,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Apagar esta sessão? Essa ação não pode ser desfeita.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSession(id, slug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-[#E9E3D5] border border-[#343A35]/10 rounded-xl p-4 space-y-3 animate-fadeIn"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#343A35]/80">Plataforma</span>
            <select
              value={ePlatform}
              onChange={(e) => setEPlatform(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {options.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-[#343A35]/80">Data</span>
            <input
              type="text"
              inputMode="numeric"
              required
              value={date}
              onChange={(e) => setDate(maskDate(e.target.value))}
              placeholder="dd/mm/aaaa"
              maxLength={10}
              className={inputClass}
            />
          </label>

          <div className="space-y-1">
            <span className="text-xs font-medium text-[#343A35]/80">Duração</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={24}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                aria-label="Horas"
                className={inputClass}
              />
              <span className="text-sm text-[#343A35]/70">h</span>
              <input
                type="number"
                min={0}
                max={59}
                value={mins}
                onChange={(e) => setMins(e.target.value)}
                aria-label="Minutos"
                className={inputClass}
              />
              <span className="text-sm text-[#343A35]/70">min</span>
            </div>
          </div>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-[#343A35]/80">Comentário (opcional)</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-[#A9574D] font-medium">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-4 space-y-2 shadow-sm">
      <div className="flex items-center justify-between gap-3 text-xs text-[#343A35]/70">
        <span className="font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded">
          {platform}
        </span>
        <div className="flex items-center gap-3">
          <span>
            {new Date(`${playedOn}T00:00:00`).toLocaleDateString("pt-BR")} • Duração:{" "}
            <strong>{formatHours(minutes)}</strong>
          </span>
          <button
            type="button"
            onClick={startEdit}
            disabled={pending}
            aria-label="Editar sessão"
            className="text-[#343A35]/50 hover:text-[#66836A] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            aria-label="Apagar sessão"
            className="text-[#343A35]/50 hover:text-[#A9574D] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {comment && (
        <p className="text-sm text-[#343A35]/90 italic break-words">&quot;{comment}&quot;</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-[#A9574D] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}