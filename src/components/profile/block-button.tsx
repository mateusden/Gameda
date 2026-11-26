"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { blockUser, unblockUser } from "@/app/actions/blocks";

interface BlockButtonProps {
  profileId: string;
  username: string;
  viewerId: string | null;
  initialBlocked: boolean;
}

export default function BlockButton({
  profileId,
  username,
  viewerId,
  initialBlocked,
}: BlockButtonProps) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!viewerId) return null;

  const handleClick = () => {
    setError(null);

    if (!blocked) {
      const ok = window.confirm(
        `Bloquear @${username}? Vocês deixarão de se seguir e não verão o conteúdo um do outro.`
      );
      if (!ok) return;
    }

    startTransition(async () => {
      const result = blocked ? await unblockUser(profileId) : await blockUser(profileId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBlocked(!blocked);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        title={blocked ? "Desbloquear" : "Bloquear"}
        className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
          blocked
            ? "text-[#A9574D] font-semibold"
            : "text-[#343A35]/50 hover:text-[#A9574D]"
        }`}
      >
        <Ban className="w-4 h-4" />
        <span className="text-sm font-medium">{blocked ? "Desbloquear" : "Bloquear"}</span>
      </button>
      {error && (
        <span role="alert" className="text-xs text-[#A9574D]">
          {error}
        </span>
      )}
    </div>
  );
}