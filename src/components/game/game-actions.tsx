"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  addToLibrary,
  logSession,
  removeFromLibrary,
  updateStatus,
  type ActionResult,
} from "@/app/actions/library";

export type StatusKey = "quero_jogar" | "jogando" | "zerado" | "pausado";

const statusOptions: { value: StatusKey; label: string }[] = [
  { value: "quero_jogar", label: "Quero jogar" },
  { value: "jogando", label: "Jogando" },
  { value: "zerado", label: "Zerado" },
  { value: "pausado", label: "Pausado" },
];

const todayBr = () =>
  new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4)
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// Converte dd/mm/aaaa para aaaa-mm-dd (formato do banco); devolve null se a data não existir
function brToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

interface GameActionsProps {
  slug: string;
  platforms: string[]; // plataformas do jogo, vindas da IGDB
  viewerId: string | null;
  entry: { status: StatusKey; platforms: string[] } | null;
}

const selectClass =
  "bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2 text-sm text-[#343A35] outline-none focus:border-[#66836A]/60 cursor-pointer";
const inputClass =
  "bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2 text-sm text-[#343A35] placeholder:text-[#343A35]/50 outline-none focus:border-[#66836A]/60";

export default function GameActions({
  slug,
  platforms,
  viewerId,
  entry,
}: GameActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<StatusKey>(
    entry?.status ?? "quero_jogar",
  );
  const [platform, setPlatform] = useState(platforms[0] ?? "");

  const [showSession, setShowSession] = useState(false);
  const sessionPlatforms = Array.from(
    new Set([...(entry?.platforms ?? []), ...platforms]),
  );
  const [sPlatform, setSPlatform] = useState(
    entry?.platforms[0] ?? platforms[0] ?? "",
  );
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("1");
  const [mins, setMins] = useState("0");
  const [comment, setComment] = useState("");

  const run = (action: () => Promise<ActionResult>, onDone?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone?.();
      router.refresh();
    });
  };

  if (!viewerId) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
      >
        <PlusCircle className="w-5 h-5" />
        Entrar para adicionar à biblioteca
      </Link>
    );
  }

  // Ainda não está na biblioteca
  if (!entry) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusKey)}
            aria-label="Status"
            className={selectClass}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {platforms.length > 0 ? (
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              aria-label="Plataforma"
              className={selectClass}
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Plataforma"
              aria-label="Plataforma"
              className={inputClass}
            />
          )}

          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => addToLibrary(slug, status, platform))}
            className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            {pending ? "Adicionando..." : "Adicionar à biblioteca"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-[#A9574D] font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Já está na biblioteca
  const handleSession = (event: React.FormEvent) => {
    event.preventDefault();

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
    run(
      () =>
        logSession({
          slug,
          platform: sPlatform,
          playedOn: iso,
          minutes: total,
          comment,
        }),
      () => {
        setShowSession(false);
        setComment("");
        setHours("1");
        setMins("0");
      },
    );
  };
  const handleRemove = () => {
    if (
      !window.confirm(
        "Remover este jogo da biblioteca? As sessões que você registrou dele serão apagadas. Suas resenhas continuam publicadas.",
      )
    ) {
      return;
    }
    run(() => removeFromLibrary(slug));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 bg-[#E9E3D5] px-3 py-1.5 rounded-xl border border-[#343A35]/10">
          <span className="text-xs text-[#343A35]/70">Status:</span>
          <select
            value={status}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.value as StatusKey;
              setStatus(next);
              run(() => updateStatus(slug, next));
            }}
            className="bg-transparent text-sm font-bold text-[#66836A] outline-none cursor-pointer"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            if (!showSession) setDate(todayBr);
            setShowSession(!showSession);
          }}
          className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Registrar Sessão
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 disabled:opacity-60 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-[#A9574D]" />
          Remover da biblioteca
        </button>
      </div>

      {showSession && (
        <form
          onSubmit={handleSession}
          className="bg-[#E9E3D5] border border-[#343A35]/10 rounded-xl p-4 space-y-3 animate-fadeIn"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-[#343A35]/80">
                Plataforma
              </span>
              {sessionPlatforms.length > 0 ? (
                <select
                  value={sPlatform}
                  onChange={(e) => setSPlatform(e.target.value)}
                  className={`${selectClass} w-full bg-[#F3EFE6]`}
                >
                  {sessionPlatforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={sPlatform}
                  onChange={(e) => setSPlatform(e.target.value)}
                  className={`${inputClass} w-full bg-[#F3EFE6]`}
                />
              )}
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium text-[#343A35]/80">
                Data
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={date}
                onChange={(e) => setDate(maskDate(e.target.value))}
                placeholder="dd/mm/aaaa"
                maxLength={10}
                className={`${inputClass} w-full bg-[#F3EFE6]`}
              />
            </label>

            <div className="space-y-1">
              <span className="text-xs font-medium text-[#343A35]/80">
                Duração
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  aria-label="Horas"
                  className={`${inputClass} w-full bg-[#F3EFE6]`}
                />
                <span className="text-sm text-[#343A35]/70">h</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={mins}
                  onChange={(e) => setMins(e.target.value)}
                  aria-label="Minutos"
                  className={`${inputClass} w-full bg-[#F3EFE6]`}
                />
                <span className="text-sm text-[#343A35]/70">min</span>
              </div>
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#343A35]/80">
              Comentário (opcional)
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Como foi essa sessão?"
              className={`${inputClass} w-full bg-[#F3EFE6] resize-none`}
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowSession(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              {pending ? "Salvando..." : "Salvar sessão"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm text-[#A9574D] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
