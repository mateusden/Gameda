import { Suspense } from "react";
import Link from "next/link";
import { Clock, Gamepad2, Lock, MessageSquare, Settings, Shield, Star } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProfileLibrary from "@/components/profile/profile-library";
import FollowButton from "@/components/profile/follow-button";
import LikeButton from "@/components/social/like-button";
import Comments from "@/components/social/comments";
import { createClient } from "@/lib/supabase/server";
import { formatHours, statusLabel, type LibraryGame } from "@/lib/library";
import { loadSocial } from "@/lib/social";
import Avatar from "@/components/ui/avatar";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ resenhas?: string; sessoes?: string }>;
}

const REVIEWS_STEP = 10;
const SESSIONS_STEP = 5;
const MAX_PAGES = 10;

const toPage = (value?: string) =>
  Math.min(Math.max(parseInt(value ?? "1", 10) || 1, 1), MAX_PAGES);

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

interface ReviewRow {
  id: number;
  rating: number;
  body: string;
  minutes_at_review: number;
  created_at: string;
  games: { slug: string; title: string } | null;
}

function LockedBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 flex items-center justify-center gap-2 text-sm text-[#343A35]/70">
      <Lock className="w-4 h-4" />
      {children}
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20">
      <p className="text-sm text-[#343A35]/70">{children}</p>
    </div>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <div className="text-center">
      <Link
        href={href}
        scroll={false}
        className="inline-block bg-[#F3EFE6] hover:bg-[#343A35]/10 border border-[#343A35]/10 text-[#343A35] px-5 py-2 rounded-xl font-medium text-sm transition-colors"
      >
        Ver mais
      </Link>
    </div>
  );
}

async function ProfileContent({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const query = await searchParams;
  const reviewsPage = toPage(query.resenhas);
  const sessionsPage = toPage(query.sessoes);
  const reviewsLimit = REVIEWS_STEP * reviewsPage;
  const sessionsLimit = SESSIONS_STEP * sessionsPage;

  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const viewerId = (claimsData?.claims?.sub as string | undefined) ?? null;

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
  const canSeeSessions = isOwn || (!profile.is_private && profile.show_sessions);
  const canSeeReviews = isOwn || (!profile.is_private && profile.show_reviews);
  const profilePath = `/profile/${profile.username}`;

  // Monta o link de "Ver mais" preservando o outro parâmetro
  const moreHref = (next: { resenhas?: number; sessoes?: number }) => {
    const qs = new URLSearchParams();
    const r = next.resenhas ?? reviewsPage;
    const s = next.sessoes ?? sessionsPage;
    if (r > 1) qs.set("resenhas", String(r));
    if (s > 1) qs.set("sessoes", String(s));
    const text = qs.toString();
    return text ? `${profilePath}?${text}` : profilePath;
  };

  // Pede um item a mais só para saber se existe próxima página
  const [followersRes, followingRes, entriesRes, sessionsRes, reviewsRes, followRes] =
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
            .order("id", { ascending: false })
            .limit(sessionsLimit + 1)
        : Promise.resolve({ data: [] }),
      canSeeReviews
        ? supabase
            .from("reviews")
            .select("id, rating, body, minutes_at_review, created_at, games(slug, title)")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(reviewsLimit + 1)
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

  const sessionRows = (sessionsRes.data ?? []) as unknown as SessionRow[];
  const hasMoreSessions = sessionRows.length > sessionsLimit;
  const sessions = sessionRows.slice(0, sessionsLimit);

  const reviewRows = (reviewsRes.data ?? []) as unknown as ReviewRow[];
  const hasMoreReviews = reviewRows.length > reviewsLimit;
  const reviews = reviewRows.slice(0, reviewsLimit).filter((r) => r.games);

  const [sessionSocial, reviewSocial] = await Promise.all([
    loadSocial(supabase, "session", sessions.map((s) => s.id), viewerId),
    loadSocial(supabase, "review", reviews.map((r) => r.id), viewerId),
  ]);

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
              <LockedBox>{profile.display_name} não compartilha a biblioteca.</LockedBox>
            )}
          </section>

          {/* Resenhas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#66836A]" />
              Resenhas
            </h2>

            {!canSeeReviews ? (
              <LockedBox>{profile.display_name} não compartilha as resenhas.</LockedBox>
            ) : reviews.length === 0 ? (
              <EmptyBox>Nenhuma resenha publicada ainda.</EmptyBox>
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const social = reviewSocial.get(review.id);
                    return (
                      <div
                        key={review.id}
                        className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Link
                            href={`/game/${review.games!.slug}`}
                            className="font-bold text-[#343A35] hover:text-[#66836A] transition-colors truncate"
                          >
                            {review.games!.title}
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-amber-700 font-medium shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                            {review.rating}.0
                          </div>
                        </div>
                        <div className="text-xs text-[#343A35]/70">
                          {new Date(review.created_at).toLocaleDateString("pt-BR")} •{" "}
                          {formatHours(review.minutes_at_review)} jogadas
                        </div>
                        <p className="text-sm text-[#343A35]/90 leading-relaxed whitespace-pre-line break-words">
                          {review.body}
                        </p>
                        <div className="pt-3 border-t border-[#343A35]/10 space-y-3">
                          <LikeButton
                            target={{ kind: "review", id: review.id }}
                            path={profilePath}
                            initialCount={social?.likeCount ?? 0}
                            initialLiked={social?.liked ?? false}
                            viewerId={viewerId}
                          />
                          <Comments
                            target={{ kind: "review", id: review.id }}
                            path={profilePath}
                            comments={social?.comments ?? []}
                            viewerId={viewerId}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasMoreReviews && reviewsPage < MAX_PAGES && (
                  <MoreLink href={moreHref({ resenhas: reviewsPage + 1 })} />
                )}
              </>
            )}
          </section>

          {/* Atividades recentes */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#66836A]" />
              Atividades Recentes
            </h2>

            {!canSeeSessions ? (
              <LockedBox>{profile.display_name} não compartilha as sessões.</LockedBox>
            ) : sessions.length === 0 ? (
              <EmptyBox>Nenhuma sessão registrada ainda.</EmptyBox>
            ) : (
              <>
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const game = session.library_platforms?.library_entries?.games;
                    const social = sessionSocial.get(session.id);
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
                            {new Date(`${session.played_on}T00:00:00`).toLocaleDateString("pt-BR")}
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
                          <p className="text-sm text-[#343A35]/90 italic break-words">
                            &quot;{session.comment}&quot;
                          </p>
                        )}
                        <div className="pt-3 border-t border-[#343A35]/10 space-y-3">
                          <LikeButton
                            target={{ kind: "session", id: session.id }}
                            path={profilePath}
                            initialCount={social?.likeCount ?? 0}
                            initialLiked={social?.liked ?? false}
                            viewerId={viewerId}
                          />
                          <Comments
                            target={{ kind: "session", id: session.id }}
                            path={profilePath}
                            comments={social?.comments ?? []}
                            viewerId={viewerId}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasMoreSessions && sessionsPage < MAX_PAGES && (
                  <MoreLink href={moreHref({ sessoes: sessionsPage + 1 })} />
                )}
              </>
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

export default function ProfilePage({ params, searchParams }: ProfilePageProps) {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando perfil..." />}>
      <ProfileContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}