"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import SlugCover from "@/components/ui/slug-cover";
import RequestGame from "@/components/explore/request-game";
import { useGameSearch, type SearchResult } from "@/hooks/use-game-search";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<SearchResult[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const { results, loading } = useGameSearch(query, 18);

  useEffect(() => {
    let active = true;
    fetch("/api/featured")
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => {
        if (active) setFeatured(data.results ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setFeaturedLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isSearching = query.trim().length >= 2;
  const games = isSearching ? results : featured;

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-[#343A35]/10 pb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">Explorar</h1>
          <p className="text-[#343A35]/80 text-sm sm:text-base mt-1">
            Descubra jogos no catálogo do Gameda.
          </p>
        </div>

        <label className="relative block max-w-xl">
          <span className="sr-only">Buscar jogos</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#343A35]/50" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome do jogo..."
            className="w-full bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl pl-12 pr-4 py-3 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none transition-colors"
          />
        </label>
      </div>

      {!isSearching && <h2 className="text-lg font-bold text-[#343A35]">Em destaque</h2>}

      {((isSearching && loading) || (!isSearching && featuredLoading)) && games.length === 0 && (
        <p className="text-sm text-[#343A35]/70">
          {isSearching ? "Buscando..." : "Carregando destaques..."}
        </p>
      )}

      {games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/game/${game.slug}`}
              className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 shadow-sm hover:border-[#66836A]/50 hover:shadow-md transition-all duration-200 flex gap-4 items-start group"
            >
              <SlugCover
                slug={game.slug}
                title={game.title}
                coverUrl={game.coverUrl}
                className="w-20 h-28 text-xl"
              />
              <div className="space-y-2 flex-1 min-w-0">
                <h3 className="font-bold text-[#343A35] text-lg leading-tight group-hover:text-[#66836A] transition-colors">
                  {game.title}
                </h3>
                {game.genre && <p className="text-xs text-[#343A35]/70">{game.genre}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms.slice(0, 3).map((platform) => (
                    <span
                      key={platform}
                      className="text-xs font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded-md"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isSearching && !loading && games.length === 0 && (
        <div className="py-12 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 space-y-4">
          <div className="space-y-1">
            <p className="font-semibold text-[#343A35]">
              Nenhum jogo encontrado para &quot;{query.trim()}&quot;
            </p>
            <p className="text-sm text-[#343A35]/70">
              Não achou o que procurava? Você pode pedir a inclusão no catálogo.
            </p>
          </div>
          <RequestGame initialTitle={query.trim()} />
        </div>
      )}
    </div>
  );
}