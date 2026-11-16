"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface EditableProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  is_private: boolean;
  show_library: boolean;
  show_sessions: boolean;
  show_reviews: boolean;
}

export default function EditProfileForm({ profile }: { profile: EditableProfile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isPrivate, setIsPrivate] = useState(profile.is_private);
  const [showLibrary, setShowLibrary] = useState(profile.show_library);
  const [showSessions, setShowSessions] = useState(profile.show_sessions);
  const [showReviews, setShowReviews] = useState(profile.show_reviews);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("O @ precisa ter de 3 a 20 caracteres: letras minúsculas, números ou _.");
      return;
    }
    if (!displayName.trim()) {
      setError("O nome não pode ficar vazio.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        username,
        bio: bio.trim() || null,
        is_private: isPrivate,
        show_library: showLibrary,
        show_sessions: showSessions,
        show_reviews: showReviews,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "Esse @ já está em uso. Escolha outro."
          : "Não foi possível salvar. Tente de novo."
      );
      setSaving(false);
      return;
    }

    // Avisa o cabeçalho para atualizar o nome
    window.dispatchEvent(new Event("profile-updated"));
    router.push(`/profile/${username}`);
    router.refresh();
  };

  const inputClass =
    "w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none transition-colors";

  const toggles = [
    { label: "Perfil privado", hint: "Só você vê suas informações.", value: isPrivate, set: setIsPrivate },
    { label: "Mostrar biblioteca", hint: "Seus jogos e status.", value: showLibrary, set: setShowLibrary },
    { label: "Mostrar sessões", hint: "Seu histórico de jogatinas.", value: showSessions, set: setShowSessions },
    { label: "Mostrar resenhas", hint: "Suas avaliações dos jogos.", value: showReviews, set: setShowReviews },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#343A35]">Nome</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#343A35]">Nome de usuário</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#343A35]/50">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              maxLength={20}
              className={`${inputClass} pl-7`}
            />
          </div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[#343A35]">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Conte um pouco sobre o que você joga..."
          className={`${inputClass} resize-none`}
        />
        <span className="block text-xs text-[#343A35]/60 text-right">{bio.length}/280</span>
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[#343A35] mb-1">Privacidade</legend>
        {toggles.map((item) => (
          <label
            key={item.label}
            className="flex items-center justify-between gap-4 bg-[#E9E3D5] rounded-xl px-4 py-3 cursor-pointer"
          >
            <span>
              <span className="block text-sm font-medium text-[#343A35]">{item.label}</span>
              <span className="block text-xs text-[#343A35]/70">{item.hint}</span>
            </span>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(e) => item.set(e.target.checked)}
              className="h-5 w-5 accent-[#66836A] cursor-pointer"
            />
          </label>
        ))}
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-[#A9574D] font-medium">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#66836A] hover:bg-[#263A30] active:scale-95 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}