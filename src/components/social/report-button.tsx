"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Flag, X } from "lucide-react";
import { reportContent, type ReportTarget } from "@/app/actions/reports";

const REASONS = [
  { value: "spam", label: "Spam ou propaganda" },
  { value: "assedio", label: "Assédio, ódio ou ameaça" },
  { value: "menor", label: "Conteúdo envolvendo menores" },
  { value: "idade", label: "Conta de menor de 16 anos" },
  { value: "ilegal", label: "Conteúdo ilegal" },
  { value: "direitos", label: "Violação de direitos autorais" },
  { value: "outro", label: "Outro motivo" },
];

interface ReportButtonProps {
  target: ReportTarget;
  viewerId: string | null;
  label?: string;
}

export default function ReportButton({ target, viewerId, label }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!viewerId) return null;

  const reasons = REASONS.filter((r) => r.value !== "idade" || target.kind === "profile");

  const close = () => {
    setOpen(false);
    setReason("");
    setDetails("");
    setError(null);
    setDone(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await reportContent(target, reason, details);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#263A30]/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Denunciar"
        className="w-full max-w-md bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 shadow-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#343A35]">Denunciar</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="text-[#343A35]/60 hover:text-[#343A35] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-sm text-[#66836A] font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Denúncia enviada. Obrigado por ajudar a manter o Gameda seguro.
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full bg-[#66836A] hover:bg-[#263A30] text-white py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#343A35]">Motivo</span>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] outline-none focus:border-[#66836A]/60 cursor-pointer"
              >
                <option value="" disabled>
                  Escolha um motivo
                </option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#343A35]">Detalhes (opcional)</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] outline-none focus:border-[#66836A]/60 resize-none"
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
                onClick={close}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || !reason}
                className="bg-[#A9574D] hover:bg-[#8a463e] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                {pending ? "Enviando..." : "Enviar denúncia"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Denunciar"
        title="Denunciar"
        className="inline-flex items-center gap-1.5 text-[#343A35]/50 hover:text-[#A9574D] transition-colors cursor-pointer"
      >
        <Flag className={label ? "w-4 h-4" : "w-3.5 h-3.5"} />
        {label && <span className="text-sm font-medium">{label}</span>}
      </button>
      {open && createPortal(modal, document.body)}
    </>
  );
}