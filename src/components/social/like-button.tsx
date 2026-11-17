"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toggleLike, type Target } from "@/app/actions/social";

interface LikeButtonProps {
  target: Target;
  path: string; // página a atualizar, ex.: /game/elden-ring
  initialCount: number;
  initialLiked: boolean;
  viewerId: string | null;
}

export default function LikeButton({
  target,
  path,
  initialCount,
  initialLiked,
  viewerId,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!viewerId) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm font-medium text-[#343A35]/70 hover:text-[#A9574D] transition-colors"
      >
        <Heart className="w-4 h-4" />
        {count}
      </Link>
    );
  }

  const handleClick = () => {
    const wasLiked = liked;
    const wasCount = count;

    // Atualiza na hora; desfaz se o servidor recusar
    setError(null);
    setLiked(!wasLiked);
    setCount(wasCount + (wasLiked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleLike(target, path);
      if (!result.ok) {
        setLiked(wasLiked);
        setCount(wasCount);
        setError(result.error);
        return;
      }
      // Se o servidor discordou (ex.: duplo clique), alinha com ele
      if (result.liked !== !wasLiked) {
        setLiked(result.liked);
        setCount(wasCount + (result.liked ? 1 : 0) - (wasLiked ? 1 : 0));
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Remover curtida" : "Curtir"}
        className={`flex items-center gap-1.5 text-sm font-medium transition-all cursor-pointer active:scale-95 disabled:opacity-60 ${
          liked ? "text-[#A9574D]" : "text-[#343A35]/70 hover:text-[#A9574D]"
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-[#A9574D]" : ""}`} />
        {count}
      </button>
      {error && (
        <span role="alert" className="text-xs text-[#A9574D]">
          {error}
        </span>
      )}
    </div>
  );
}