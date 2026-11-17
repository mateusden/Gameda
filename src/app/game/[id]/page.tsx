import { Suspense } from "react";
import Link from "next/link";
import {
  Clock,
  Star,
  Calendar,
  Building2,
  Tag,
  MessageSquare,
} from "lucide-react";
import GameCover from "@/components/ui/game-cover";
import LoadingSpinner from "@/components/ui/loading-spinner";
import GameActions, { type StatusKey } from "@/components/game/game-actions";
import ReviewForm, { DeleteReviewButton } from "@/components/game/review-form";
import { getGameBySlug } from "@/lib/igdb";
import { formatHours } from "@/lib/library";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/ui/avatar";
import LikeButton from "@/components/social/like-button";
import Comments, { type CommentItem } from "@/components/social/comments";

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

interface EntryRow {
  id: number;
  status: StatusKey;
  library_platforms:
    | {
        platform: string;
        sessions:
          | {
              id: number;
              played_on: string;
              duration_minutes: number;
              comment: string | null;
            }[]
          | null;
      }[]
    | null;
}

interface ReviewRow {
  id: number;
  user_id: string;
  rating: number;
  body: string;
  minutes_at_review: number;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

async function GameContent({ params }: GameDetailPageProps) {
  const { id } = await params;
  const igdbGame = await getGameBySlug(id);

  if (!igdbGame) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="py-12 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 space-y-2">
          <p className="font-semibold text-[#343A35]">Jogo não encontrado</p>
          <p className="text-sm text-[#343A35]/70">
            Não achamos nenhum jogo com o endereço &quot;{id}&quot;.
          </p>
        </div>
      </div>
    );
  }

  const info = {
    title: igdbGame.name,
    developer: igdbGame.developers.join(", ") || "Desconhecida",
    genre: igdbGame.genres.join(" / ") || "—",
    platforms: igdbGame.platforms,
    releaseYear: igdbGame.releaseYear ?? "—",
    description: igdbGame.summary ?? "Sem descrição disponível.",
    coverUrl: igdbGame.coverUrl,
  };

  // Dados do banco (a linha em "games" só existe depois que alguém adiciona o jogo)
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const viewerId = (claimsData?.claims?.sub as string | undefined) ?? null;

  const { data: gameRow } = await supabase
    .from("games")
    .select("id")
    .eq("slug", id)
    .maybeSingle();

  let entry: EntryRow | null = null;
  let reviews: ReviewRow[] = [];
  let likeRows: { review_id: number; user_id: string }[] = [];
  let commentRows: (CommentItem & { review_id: number })[] = [];

  if (gameRow) {
    const [entryRes, reviewsRes] = await Promise.all([
      viewerId
        ? supabase
            .from("library_entries")
            .select(
              "id, status, library_platforms(platform, sessions(id, played_on, duration_minutes, comment))",
            )
            .eq("user_id", viewerId)
            .eq("game_id", gameRow.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("reviews")
        .select(
          "id, user_id, rating, body, minutes_at_review, created_at, profiles(display_name, username, avatar_url)",
        )
        .eq("game_id", gameRow.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    entry = (entryRes.data as unknown as EntryRow | null) ?? null;
    reviews = (reviewsRes.data ?? []) as unknown as ReviewRow[];

    if (reviews.length > 0) {
      const { data: likesData } = await supabase
        .from("likes")
        .select("review_id, user_id")
        .in(
          "review_id",
          reviews.map((r) => r.id),
        );
      likeRows = likesData ?? [];

      const { data: commentsData } = await supabase
        .from("comments")
        .select(
          "id, user_id, review_id, parent_id, body, created_at, profiles(username, avatar_url)",
        )
        .in(
          "review_id",
          reviews.map((r) => r.id),
        )
        .order("created_at", { ascending: true });
      commentRows = (commentsData ?? []) as unknown as (CommentItem & {
        review_id: number;
      })[];
    }
  }

  const mySessions = (entry?.library_platforms ?? [])
    .flatMap((p) =>
      (p.sessions ?? []).map((s) => ({ ...s, platform: p.platform })),
    )
    .sort((a, b) => b.played_on.localeCompare(a.played_on) || b.id - a.id);
  const totalMinutes = mySessions.reduce(
    (sum, s) => sum + s.duration_minutes,
    0,
  );

  const canReview = Boolean(viewerId && entry && totalMinutes > 0);
  const needsSession = Boolean(viewerId && entry && totalMinutes === 0);

  const likeCount = new Map<number, number>();
  const likedByMe = new Set<number>();
  for (const like of likeRows) {
    likeCount.set(like.review_id, (likeCount.get(like.review_id) ?? 0) + 1);
    if (like.user_id === viewerId) likedByMe.add(like.review_id);
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Informações gerais do jogo */}
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <GameCover
          title={info.title}
          coverUrl={info.coverUrl}
          className="w-full md:w-56 h-72 text-5xl"
        />

        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {info.platforms.map((platform) => (
                <span
                  key={platform}
                  className="text-xs font-semibold bg-[#66836A]/10 text-[#66836A] px-2.5 py-0.5 rounded-md"
                >
                  {platform}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#343A35] pt-1">
              {info.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#343A35]/80">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#66836A] shrink-0" />
              <span>
                <strong>Desenvolvedora:</strong> {info.developer}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#66836A] shrink-0" />
              <span>
                <strong>Gênero:</strong> {info.genre}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#66836A] shrink-0" />
              <span>
                <strong>Lançamento:</strong> {info.releaseYear}
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#343A35]/90 leading-relaxed pt-2">
            {info.description}
          </p>

          <div className="pt-4 border-t border-[#343A35]/10">
            <GameActions
              slug={igdbGame.slug}
              platforms={info.platforms}
              viewerId={viewerId}
              entry={
                entry
                  ? {
                      status: entry.status,
                      platforms: (entry.library_platforms ?? []).map(
                        (p) => p.platform,
                      ),
                    }
                  : null
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Minhas sessões */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#66836A]" />
            Meu Histórico de Sessões
            {entry && (
              <span className="text-base font-medium text-[#343A35]/70">
                ({formatHours(totalMinutes)} totais)
              </span>
            )}
          </h2>

          {!viewerId ? (
            <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 text-sm text-[#343A35]/70">
              <Link
                href="/login"
                className="font-semibold text-[#66836A] hover:text-[#263A30]"
              >
                Entre
              </Link>{" "}
              para registrar suas sessões.
            </div>
          ) : !entry ? (
            <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 text-sm text-[#343A35]/70">
              Adicione o jogo à biblioteca para registrar sessões.
            </div>
          ) : mySessions.length === 0 ? (
            <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 text-sm text-[#343A35]/70">
              Nenhuma sessão registrada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {mySessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-4 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-[#343A35]/70">
                    <span className="font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded">
                      {session.platform}
                    </span>
                    <span>
                      {new Date(
                        `${session.played_on}T00:00:00`,
                      ).toLocaleDateString("pt-BR")}{" "}
                      • Duração:{" "}
                      <strong>{formatHours(session.duration_minutes)}</strong>
                    </span>
                  </div>
                  {session.comment && (
                    <p className="text-sm text-[#343A35]/90 italic">
                      &quot;{session.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resenhas */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#343A35] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#66836A]" />
            Resenhas
          </h2>

          {canReview && (
            <ReviewForm
              slug={igdbGame.slug}
              playedLabel={formatHours(totalMinutes)}
            />
          )}
          {needsSession && (
            <p className="text-xs text-[#343A35]/70 bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl px-4 py-3">
              Registre pelo menos uma sessão para poder escrever uma resenha.
            </p>
          )}

          {reviews.length === 0 ? (
            <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 text-sm text-[#343A35]/70">
              Ainda não há resenhas deste jogo.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    {review.profiles ? (
                      <Link
                        href={`/profile/${review.profiles.username}`}
                        className="flex items-center gap-2 font-semibold text-[#343A35] text-sm hover:text-[#66836A] transition-colors"
                      >
                        <Avatar
                          src={review.profiles.avatar_url}
                          name={review.profiles.username}
                          className="w-7 h-7 text-xs"
                        />
                        @{review.profiles.username}
                      </Link>
                    ) : (
                      <span className="font-semibold text-[#343A35] text-sm">
                        Usuário
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                        {review.rating}.0
                      </div>
                      {review.user_id === viewerId && (
                        <DeleteReviewButton
                          reviewId={review.id}
                          slug={igdbGame.slug}
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-[#343A35]/70">
                    {new Date(review.created_at).toLocaleDateString("pt-BR")} •{" "}
                    {formatHours(review.minutes_at_review)} jogadas
                  </div>
                  <p className="text-sm text-[#343A35]/90 leading-relaxed">
                    {review.body}
                  </p>
                  <div className="pt-3 border-t border-[#343A35]/10 flex-row flex gap-5">
                    <div className="flex items-center gap-5">
                      <LikeButton
                        target={{ kind: "review", id: review.id }}
                        path={`/game/${igdbGame.slug}`}
                        initialCount={likeCount.get(review.id) ?? 0}
                        initialLiked={likedByMe.has(review.id)}
                        viewerId={viewerId}
                      />
                    </div>
                    <Comments
                      target={{ kind: "review", id: review.id }}
                      path={`/game/${igdbGame.slug}`}
                      comments={commentRows.filter(
                        (c) => c.review_id === review.id,
                      )}
                      viewerId={viewerId}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando jogo..." />}>
      <GameContent params={params} />
    </Suspense>
  );
}
