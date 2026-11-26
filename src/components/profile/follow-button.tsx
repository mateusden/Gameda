"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FollowButtonProps {
  profileId: string;
  viewerId: string | null;
  initialFollowing: boolean;
}

export default function FollowButton({ profileId, viewerId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!viewerId) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
      >
        <UserPlus className="w-4 h-4" />
        Seguir
      </Link>
    );
  }

  const toggle = async () => {
    setPending(true);
    setError(null);
    const supabase = createClient();

    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", viewerId)
        .eq("following_id", profileId);
      if (error) setError("Não foi possível deixar de seguir.");
      else setFollowing(false);
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: viewerId, following_id: profileId });
      if (error) setError("Não foi possível seguir este perfil.");
      else setFollowing(true);
    }

    setPending(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm cursor-pointer disabled:opacity-60 active:scale-95 ${
          following
            ? "bg-[#E9E3D5] hover:bg-[#343A35]/10 text-[#343A35] border border-[#343A35]/10"
            : "bg-[#66836A] hover:bg-[#263A30] text-white shadow-sm"
        }`}
      >
        {following ? <UserCheck className="w-4 h-4 text-[#66836A]" /> : <UserPlus className="w-4 h-4" />}
        {following ? "Seguindo" : "Seguir"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-[#A9574D] font-medium">
          {error}
        </span>
      )}
    </div>
  );
}