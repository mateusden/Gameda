import Link from "next/link";
import {
  PlusCircle,
  Gamepad2,
  Users,
  Star,
  Clock,
  MessageSquare,
  Heart,
  Trophy,
} from "lucide-react";
import GameCover from "@/components/ui/game-cover";
import SlugCover from "@/components/ui/slug-cover";

type ActivityKind = "session" | "review" | "completed";

interface Activity {
  id: number;
  user: string;
  time: string;
  kind: ActivityKind;
  game: string;
  slug: string;
  platform: string;
  duration?: string;
  rating?: number;
  comment: string;
}

// Dados fictícios — virão do banco de dados no futuro
const activities: Activity[] = [
  {
    id: 1,
    user: "Mariana Souza",
    time: "há 2 horas",
    kind: "session",
    game: "Hades II",
    slug: "hades-ii",
    platform: "PC",
    duration: "2h 30m",
    comment: "Finalmente consegui derrotar o chefe final da superfície! Que trilha sonora espetacular.",
  },
  {
    id: 2,
    user: "Lucas Andrade",
    time: "há 5 horas",
    kind: "review",
    game: "Elden Ring",
    slug: "elden-ring",
    platform: "PlayStation 5",
    rating: 5,
    comment: "Um mundo que te convida a se perder. Cada canto escondido recompensa a curiosidade.",
  },
  {
    id: 3,
    user: "Camila Rocha",
    time: "ontem",
    kind: "completed",
    game: "Balatro",
    slug: "balatro",
    platform: "Nintendo Switch",
    duration: "18h",
    comment: "Zerei! Agora é partir para as stakes mais difíceis.",
  },
];

const kindLabel: Record<ActivityKind, string> = {
  session: "registrou uma sessão",
  review: "publicou uma resenha",
  completed: "zerou um jogo",
};

const recommendations = [
  { name: "Elden Ring", genre: "RPG de Ação", slug: "elden-ring" },
  { name: "Silksong", genre: "Metroidvania", slug: "hollow-knight-silksong" },
  { name: "Balatro", genre: "Roguelike", slug: "balatro" },
];

export default function Home() {
  return (
    <div className="space-y-8 pb-12">
      {/* Boas-vindas */}
      <section className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">
            Bem-vindo de volta ao Gameda! 🎮
          </h1>
          <p className="text-[#343A35]/80 max-w-xl text-sm sm:text-base">
            Organize sua biblioteca, registre suas sessões de jogatina e veja o que seus amigos estão jogando hoje.
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
            Atividades dos Amigos
          </h2>

          {activities.length === 0 ? (
            <div className="py-12 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 space-y-2">
              <p className="font-semibold text-[#343A35]">Seu feed está vazio por enquanto</p>
              <p className="text-sm text-[#343A35]/70">
                Siga outros jogadores para ver o que eles estão jogando.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <article
                  key={activity.id}
                  className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm animate-fadeIn"
                >
                  <header className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#66836A]/20 flex items-center justify-center font-bold text-[#66836A] shrink-0">
                        {activity.user.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#343A35] block truncate">
                          {activity.user}
                        </span>
                        <span className="text-xs text-[#343A35]/70">
                          {kindLabel[activity.kind]} {activity.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs bg-[#66836A]/10 text-[#66836A] font-semibold px-2.5 py-1 rounded-full shrink-0">
                      {activity.platform}
                    </span>
                  </header>

                  <div className="bg-[#E9E3D5] rounded-lg p-4 flex gap-4 items-center border border-[#343A35]/5">
                    <SlugCover slug={activity.slug} title={activity.game} className="w-16 h-20 text-lg" />
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/game/${activity.slug}`}
                        className="font-bold text-[#343A35] text-lg hover:text-[#66836A] transition-colors block"
                      >
                        {activity.game}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#343A35]/80">
                        {activity.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-[#66836A]" /> {activity.duration}
                          </span>
                        )}
                        {activity.kind === "completed" && (
                          <span className="flex items-center gap-1 text-amber-700 font-medium">
                            <Trophy className="w-4 h-4" /> Zerado
                          </span>
                        )}
                        {activity.rating && (
                          <span className="flex items-center gap-1 text-amber-700 font-medium">
                            <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
                            {activity.rating}.0
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#343A35]/90 italic pt-1">
                        &quot;{activity.comment}&quot;
                      </p>
                    </div>
                  </div>

                  <footer className="flex items-center gap-6 text-sm text-[#343A35]/70 pt-3 border-t border-[#343A35]/10">
                    <button className="hover:text-[#A9574D] transition-colors flex items-center gap-1.5 font-medium cursor-pointer">
                      <Heart className="w-4 h-4" /> Curtir
                    </button>
                    <button className="hover:text-[#66836A] transition-colors flex items-center gap-1.5 font-medium cursor-pointer">
                      <MessageSquare className="w-4 h-4" /> Comentar
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Recomendações */}
        <aside className="space-y-6">
          <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#343A35] flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#66836A]" />
              Recomendações
            </h2>
            <div className="space-y-1">
              {recommendations.map((jogo) => (
                <Link
                  key={jogo.slug}
                  href={`/game/${jogo.slug}`}
                  className="flex items-center gap-3 p-2 hover:bg-[#E9E3D5]/60 rounded-lg transition-colors group"
                >
                  <SlugCover slug={jogo.slug} title={jogo.name} className="w-10 h-14 text-sm" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-[#343A35] text-sm block group-hover:text-[#66836A] transition-colors truncate">
                      {jogo.name}
                    </span>
                    <span className="text-xs text-[#343A35]/60">{jogo.genre}</span>
                  </div>
                  <span className="text-xs text-[#66836A] font-semibold bg-[#66836A]/10 px-2 py-1 rounded-md">
                    Ver
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}