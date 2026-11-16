import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EditProfileForm from "@/components/profile/edit-profile-form";
import AvatarUploader from "@/components/profile/avatar-uploader";
import { createClient } from "@/lib/supabase/server";

async function EditProfileContent() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, is_private, show_library, show_sessions, show_reviews")
    .eq("id", userId)
    .single();

  if (!profile) redirect("/");

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">Editar perfil</h1>
        <p className="text-sm text-[#343A35]/70 mt-1">Escolha como você aparece no Gameda.</p>
      </div>

      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm">
        <AvatarUploader
          userId={profile.id}
          username={profile.username}
          avatarUrl={profile.avatar_url}
        />
      </div>

      <EditProfileForm profile={profile} />
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando..." />}>
      <EditProfileContent />
    </Suspense>
  );
}