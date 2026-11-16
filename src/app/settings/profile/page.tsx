import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EditProfileForm from "@/components/profile/edit-profile-form";
import AvatarUploader from "@/components/profile/avatar-uploader";
import { createClient } from "@/lib/supabase/server";

interface EditProfilePageProps {
  searchParams: Promise<{ novo?: string }>;
}

async function EditProfileContent({ searchParams }: EditProfilePageProps) {
  const { novo } = await searchParams;

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

      {novo && (
        <div className="bg-[#66836A]/10 border border-[#66836A]/30 rounded-xl px-4 py-3 text-sm text-[#343A35]">
          <strong className="text-[#66836A]">Bem-vindo ao Gameda!</strong> Escolha o seu @ abaixo.
          Seu nome e sua foto vieram do Google, e você pode trocar os dois aqui.
        </div>
      )}

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

export default function EditProfilePage({ searchParams }: EditProfilePageProps) {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando..." />}>
      <EditProfileContent searchParams={searchParams} />
    </Suspense>
  );
}