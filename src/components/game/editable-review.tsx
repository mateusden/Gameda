"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { updateReview } from "@/app/actions/library";

interface EditableReviewProps {
  reviewId: number;
  slug: string;
  rating: number;
  body: string;
  canEdit: boolean;
}

export default function EditableReview({ reviewId, slug, rating, body, canEdit }: EditableReviewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [newRating, setNewRating] = useState(rating);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(body);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setNewRating(rating);
    setText(body);
    setError(null);
    setEditing(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateReview(reviewId, slug, newRating, text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[#343A35]/90 leading-relaxed whitespace-pre-line break-words">
          {body}
        </p>
        {canEdit && (
          <button
            type="button"
            onClick={startEdit}
            className="text-xs font-medium text-[#343A35]/70 hover:text-[#66836A] transition-colors cursor-pointer"
          >
            Editar resenha
          </button>
        )}
      </div>
    );
  }

  const shown = hover || newRating;

  return (
    <form onSubmit={handleSave} className="space-y-3 animate-fadeIn">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
            aria-pressed={newRating === value}
            onClick={() => setNewRating(value)}
            onMouseEnter={() => setHover(value)}
            className="cursor-pointer p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                value <= shown ? "fill-amber-600 text-amber-600" : "text-[#343A35]/30"
              }`}
            />
          </button>
        ))}
      </div>

      <label className="block space-y-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          rows={5}
          aria-label="Resenha"
          className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] focus:border-[#66836A]/60 outline-none resize-none"
        />
        <span className="block text-xs text-[#343A35]/60 text-right">{text.length}/2000</span>
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