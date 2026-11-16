"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Star, Trash2 } from "lucide-react";
import { createReview, deleteReview } from "@/app/actions/library";

interface ReviewFormProps {
  slug: string;
  playedLabel: string; // ex.: "35h 30m"
}

export default function ReviewForm({ slug, playedLabel }: ReviewFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createReview(slug, rating, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setRating(0);
      setBody("");
      router.refresh();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer"
      >
        <PenLine className="w-4 h-4" />
        Escrever resenha
      </button>
    );
  }

  const shown = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm animate-fadeIn"
    >
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-[#343A35]">Sua nota</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              className="cursor-pointer p-0.5"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  value <= shown
                    ? "fill-amber-600 text-amber-600"
                    : "text-[#343A35]/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[#343A35]">Resenha</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="O que você achou do jogo?"
          className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none resize-none"
        />
        <span className="block text-xs text-[#343A35]/60 text-right">{body.length}/2000</span>
      </label>

      <p className="text-xs text-[#343A35]/70">
        O tempo jogado até agora ({playedLabel}) será registrado junto com a resenha.
      </p>

      {error && (
        <p role="alert" className="text-sm text-[#A9574D] font-medium">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          {pending ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}

export function DeleteReviewButton({ reviewId, slug }: { reviewId: number; slug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm("Apagar esta resenha? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const result = await deleteReview(reviewId, slug);
      if (result.ok) router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Apagar resenha"
      className="text-[#343A35]/50 hover:text-[#A9574D] transition-colors cursor-pointer disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}