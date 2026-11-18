import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle, Gamepad2, Users, Star, Clock, Trophy } from "lucide-react";
import SlugCover from "@/components/ui/slug-cover";
import Avatar from "@/components/ui/avatar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import LikeButton from "@/components/social/like-button";
import Comments from "@/components/social/comments";
import { createClient } from "@/lib/supabase/server";
import { formatHours } from "@/lib/library";
import {
  loadFeed,
  FEED_PAGE_SIZE,
  type FeedItem,
  type FeedKind,
} from "@/lib/feed";
import { loadRecommendations } from "@/lib/recommendations";

const MAX_FEED_PAGES = 10;

const kindLabel: Record<FeedKind, string> = {
  session: "registrou uma sessão",
  review: "publicou uma resenha",
  completed: "zerou um jogo",
};

type HomeSearchParams = Promise<{ feed?: string }>;

async function Recommendations() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const viewerId = (data?.claims?.sub as string | undefined) ?? null;
  const items = await loadRecommendations(supabase, viewerId);

  if (items.length === 0) {
    return (
      <p className="text-sm text-[#343A35]/70">
        Sem recomendações por enquanto.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((jogo) => (
        <Link
          key={jogo.slug}
          href={`/game/${jogo.slug}`}
          className="flex items-center gap-3 p-2 hover:bg-[#E9E3D5]/60 rounded-lg transition-colors group"
        >
          <SlugCover
            slug={jogo.slug}
            title={jogo.title}
            className="w-10 h-14 text-sm"
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-[#343A35] text-sm block group-hover:text-[#66836A] transition-colors truncate">
              {jogo.title}
            </span>
            <span className="text-xs text-[#343A35]/60 block truncate">
              {jogo.fromGameda > 0
                ? `Em ${jogo.fromGameda} ${jogo.fromGameda === 1 ? "biblioteca" : "bibliotecas"}`
                : jogo.genre || "Popular"}
            </span>
          </div>
          <span className="text-xs text-[#66836A] font-semibold bg-[#66836A]/10 px-2 py-1 rounded-md">
            Ver
          </span>
        </Link>
      ))}
    </div>
  );
}

function formatWhen(item: FeedItem) {
  if (item.dateOnly) {
    return `em ${new Date(item.at).toLocaleDateString("pt-BR")}`;
  }
  const minutes = Math.floor(
    (Date.now() - new Date(item.at).getTime()) / 60000,
  );
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  return `em ${new Date(item.at).toLocaleDateString("pt-BR")}`;
}

function EmptyBox({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-12 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 space-y-2">
      <p className="font-semibold text-[#343A35]">{title}</p>
      {children && <p className="text-sm text-[#343A35]/70">{children}</p>}
    </div>
  );
}

async function Feed({ searchParams }: { searchParams: HomeSearchParams }) {
  const { feed } = await searchParams;
  const page = Math.min(
    Math.max(parseInt(feed ?? "1", 10) || 1, 1),
    MAX_FEED_PAGES,
  );

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const viewerId = (data?.claims?.sub as string | undefined) ?? null;

  if (!viewerId) {
    return (
      <EmptyBox title="Entre para ver o que seus amigos estão jogando">
        <Link
          href="/login"
          className="font-semibold text-[#66836A] hover:text-[#263A30]"
        >
          Entrar ou criar conta
        </Link>
      </EmptyBox>
    );
  }

  const { items, followingCount, hasMore } = await loadFeed(
    supabase,
    viewerId,
    FEED_PAGE_SIZE * page,
  );

  if (followingCount === 0) {
    return (
      <EmptyBox title="Seu feed está vazio por enquanto">
        Siga outros jogadores para ver o que eles estão jogando. Comece por{" "}
        <Link
          href="/explore"
          className="font-semibold text-[#66836A] hover:text-[#263A30]"
        >
          Explorar
        </Link>
        .
      </EmptyBox>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyBox title="Ainda não há atividades">
        Quem você segue ainda não registrou sessões, resenhas nem zerou jogos
        (ou não compartilha).
      </EmptyBox>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.key}
          className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm animate-fadeIn"
        >
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                src={item.user.avatarUrl}
                name={item.user.username}
                className="w-10 h-10 text-base"
              />
              <div className="min-w-0">
                <Link
                  href={`/profile/${item.user.username}`}
                  className="font-semibold text-[#343A35] block truncate hover:text-[#66836A] transition-colors"
                >
                  @{item.user.username}
                </Link>
                <span className="text-xs text-[#343A35]/70">
                  {kindLabel[item.kind]} {formatWhen(item)}
                </span>
              </div>
            </div>
            {item.platform && (
              <span className="text-xs bg-[#66836A]/10 text-[#66836A] font-semibold px-2.5 py-1 rounded-full shrink-0">
                {item.platform}
              </span>
            )}
          </header>

          <div className="bg-[#E9E3D5] rounded-lg p-4 flex gap-4 items-center border border-[#343A35]/5">
            <SlugCover
              slug={item.game.slug}
              title={item.game.title}
              className="w-16 h-20 text-lg"
            />
            <div className="space-y-1 min-w-0">
              <Link
                href={`/game/${item.game.slug}`}
                className="font-bold text-[#343A35] text-lg hover:text-[#66836A] transition-colors block"
              >
                {item.game.title}
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#343A35]/80">
                {item.minutes !== null && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#66836A]" />
                    {formatHours(item.minutes)}
                    {item.kind === "review" && " jogadas"}
                  </span>
                )}
                {item.kind === "completed" && (
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Trophy className="w-4 h-4" /> Zerado
                  </span>
                )}
                {item.rating !== null && (
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
                    {item.rating}.0
                  </span>
                )}
              </div>
              {item.text && (
                <p className="text-sm text-[#343A35]/90 italic pt-1 line-clamp-4 break-words">
                  &quot;{item.text}&quot;
                </p>
              )}
            </div>
          </div>

          {item.targetId !== null &&
            (item.kind === "session" || item.kind === "review") && (
              <footer className="pt-3 border-t flex flex-row gap-5 border-[#343A35]/10 space-y-3">
                <LikeButton
                  target={{ kind: item.kind, id: item.targetId }}
                  path="/"
                  initialCount={item.likeCount}
                  initialLiked={item.liked}
                  viewerId={viewerId}
                />
                <Comments
                  target={{ kind: item.kind, id: item.targetId }}
                  path="/"
                  comments={item.comments}
                  viewerId={viewerId}
                />
              </footer>
            )}
        </article>
      ))}

      {hasMore && page < MAX_FEED_PAGES && (
        <div className="text-center pt-2">
          <Link
            href={`/?feed=${page + 1}`}
            scroll={false}
            className="inline-block bg-[#F3EFE6] hover:bg-[#343A35]/10 border border-[#343A35]/10 text-[#343A35] px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            Ver mais atividades
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  return (
    <div className="space-y-8 pb-12">
      {/* Boas-vindas */}
      <section className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">
            Bem-vindo ao Gameda! 🎮
          </h1>
          <p className="text-[#343A35]/80 max-w-xl text-sm sm:text-base">
            Organize sua biblioteca, registre suas sessões de jogatina e veja o
            que seus amigos estão jogando hoje.
          </p>
        </div>
        <Link
          href="/library"
          className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar à Biblioteca
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#66836A]" />
            Atividades de quem você segue
          </h2>
          <Suspense fallback={<LoadingSpinner text="Carregando feed..." />}>
            <Feed searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Recomendações */}
        <Suspense fallback={<LoadingSpinner text="Carregando..." />}>
          <Recommendations />
        </Suspense>
      </div>
    </div>
  );
}