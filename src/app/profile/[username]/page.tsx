import { Suspense } from "react";
import Link from "next/link";
import { Clock, Gamepad2, Lock, Settings, Shield } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProfileLibrary from "@/components/profile/profile-library";
import FollowButton from "@/components/profile/follow-button";
import { createClient } from "@/lib/supabase/server";
import type { GameStatus, LibraryGame } from "@/lib/mock-games";
import Avatar from "@/components/ui/avatar";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

const statusLabel: Record<string, GameStatus> = {
  quero_jogar: "Quero jogar",
  jogando: "Jogando",
  zerado: "Zerado",
  pausado: "Pausado",
};

interface EntryRow {
  id: number;
  status: string;
  games: { slug: string; title: string } | null;
  library_platforms:
    | { platform: string; sessions: { duration_minutes: number }[] | null }[]
    | null;
}

interface SessionRow {
  id: number;
  played_on: string;
  duration_minutes: number;
  comment: string | null;
  library_platforms: {
    platform: string;
    library_entries: { games: { slug: string; title: string } | null } | null;
  } | null;
}

function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0 && m === 0) return "0h";
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

async function ProfileContent({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const viewerId = claimsData?.claims?.sub ?? null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="py-12 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 space-y-2">
          <p className="font-semibold text-[#343A35]">Perfil não encontrado</p>
          <p className="text-sm text-[#343A35]/70">
            Não existe ninguém com o @{username}.
          </p>
        </div>
      </div>
    );
  }

  const isOwn = viewerId === profile.id;
  const canSeeLibrary = isOwn || (!profile.is_private && profile.show_library);
  const canSeeSessions =
    isOwn || (!profile.is_private && profile.show_sessions);

  const [followersRes, followingRes, entriesRes, sessionsRes, followRes] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      canSeeLibrary
        ? supabase
            .from("library_entries")
            .select(
              "id, status, games(slug, title), library_platforms(platform, sessions(duration_minutes))",
            )
            .eq("user_id", profile.id)
        : Promise.resolve({ data: [] }),
      canSeeSessions
        ? supabase
            .from("sessions")
            .select(
              "id, played_on, duration_minutes, comment, library_platforms(platform, library_entries(games(slug, title)))",
            )
            .eq("user_id", profile.id)
            .order("played_on", { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] }),
      viewerId && !isOwn
        ? supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", viewerId)
            .eq("following_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const entries = ((entriesRes.data ?? []) as unknown as EntryRow[]).filter(
    (e) => e.games,
  );
  const sessions = (sessionsRes.data ?? []) as unknown as SessionRow[];

  let totalMinutes = 0;
  const games: LibraryGame[] = entries.map((entry) => {
    const platforms = entry.library_platforms ?? [];
    const minutes = platforms.reduce(
      (sum, p) =>
        sum + (p.sessions ?? []).reduce((s, x) => s + x.duration_minutes, 0),
      0,
    );
    totalMinutes += minutes;
    return {
      id: entry.id,
      slug: entry.games!.slug,
      title: entry.games!.title,
      platform: platforms.map((p) => p.platform).join(", ") || "—",
      hours: formatHours(minutes),
      status: statusLabel[entry.status] ?? "Quero jogar",
    };
  });

  const stats = [
    {
      value: canSeeLibrary
        ? games.filter((g) => g.status === "Zerado").length
        : "—",
      label: "Jogos Zerados",
    },
    {
      value: canSeeLibrary ? formatHours(totalMinutes) : "—",
      label: "Horas Registradas",
    },
    { value: followingRes.count ?? 0, label: "Seguindo" },
    { value: followersRes.count ?? 0, label: "Seguidores" },
  ];

  const memberSince = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Cabeçalho do perfil */}
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              src={profile.avatar_url}
              name={profile.username}
              className="w-24 h-24 sm:w-30 sm:h-30 text-3xl border-3 border-[#66836A]/70"
            />
            <div className="space-y-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#343A35] truncate">
                @{profile.username}
              </h1>
              <p className="text-sm font-medium text-[#66836A]">
                {profile.display_name}
              </p>
              <p className="text-xs text-[#343A35]/70 pt-1">
                Membro desde {memberSince}
              </p>
            </div>
          </div>

          {isOwn ? (
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 bg-[#E9E3D5] hover:bg-[#343A35]/10 text-[#343A35] px-4 py-2.5 rounded-xl font-medium transition-colors border border-[#343A35]/10 text-sm"
            >
              <Settings className="w-4 h-4 text-[#66836A]" />
              Editar Perfil
            </Link>
          ) : (
            !profile.is_private && (
              <FollowButton
                profileId={profile.id}
                viewerId={viewerId}
                initialFollowing={Boolean(followRes.data)}
              />
            )
          )}
        </div>

        {profile.bio && (
          <p className="text-sm sm:text-base text-[#343A35]/90 max-w-2xl">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#343A35]/10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#E9E3D5] p-3.5 rounded-xl text-center border border-[#343A35]/5"
            >
              <span className="text-xl font-bold text-[#343A35] block">
                {stat.value}
              </span>
              <span className="text-xs text-[#343A35]/70 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Biblioteca */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#66836A]" />
              Biblioteca
            </h2>
            {canSeeLibrary ? (
              <ProfileLibrary games={games} />
            ) : (
              <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 flex items-center justify-center gap-2 text-sm text-[#343A35]/70">
                <Lock className="w-4 h-4" />
                {profile.display_name} não compartilha a biblioteca.
              </div>
            )}
          </section>

          {/* Atividades recentes */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#66836A]" />
              Atividades Recentes
            </h2>

            {!canSeeSessions ? (
              <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 flex items-center justify-center gap-2 text-sm text-[#343A35]/70">
                <Lock className="w-4 h-4" />
                {profile.display_name} não compartilha as sessões.
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20">
                <p className="text-sm text-[#343A35]/70">
                  Nenhuma sessão registrada ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const game =
                    session.library_platforms?.library_entries?.games;
                  return (
                    <div
                      key={session.id}
                      className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-[#343A35]/70">
                        <span className="font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded">
                          {session.library_platforms?.platform ?? "—"}
                        </span>
                        <span>
                          {new Date(
                            `${session.played_on}T00:00:00`,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#343A35] text-base">
                        {game ? (
                          <Link
                            href={`/game/${game.slug}`}
                            className="hover:text-[#66836A] transition-colors"
                          >
                            {game.title}
                          </Link>
                        ) : (
                          "Jogo"
                        )}{" "}
                        <span className="font-normal text-sm text-[#343A35]/80">
                          — sessão de {formatHours(session.duration_minutes)}
                        </span>
                      </h3>
                      {session.comment && (
                        <p className="text-sm text-[#343A35]/90 italic">
                          &quot;{session.comment}&quot;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Privacidade */}
        <aside className="space-y-6">
          <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#343A35] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#66836A]" />
              Privacidade e status
            </h2>
            <p className="text-xs text-[#343A35]/80 leading-relaxed">
              O perfil de{" "}
              <strong className="text-[#66836A]">{profile.display_name}</strong>{" "}
              é{" "}
              <strong className="text-[#66836A]">
                {profile.is_private ? "Privado" : "Público"}
              </strong>
              {profile.is_private
                ? ": só a própria pessoa vê as informações."
                : ", permitindo que outros usuários vejam o que ela escolheu compartilhar."}
            </p>
            {isOwn && (
              <Link
                href="/library"
                className="block w-full text-center bg-[#66836A] hover:bg-[#263A30] text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                Gerenciar minha biblioteca
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando perfil..." />}>
      <ProfileContent params={params} />
    </Suspense>
  );
}
