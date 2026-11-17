import type { SupabaseClient } from "@supabase/supabase-js";
import { getGamesBySlugs, getPopularGames } from "@/lib/igdb";

export interface Recommendation {
  slug: string;
  title: string;
  genre: string;
  fromGameda: number; // quantas bibliotecas visíveis têm o jogo (0 = veio da IGDB)
}

const WANTED = 5;

interface Row {
  games: { slug: string; title: string } | null;
}

export async function loadRecommendations(
  supabase: SupabaseClient,
  viewerId: string | null
): Promise<Recommendation[]> {
  const [allRes, mineRes] = await Promise.all([
    supabase
      .from("library_entries")
      .select("games(slug, title)")
      .order("id", { ascending: false })
      .limit(500),
    viewerId
      ? supabase.from("library_entries").select("games(slug)").eq("user_id", viewerId)
      : Promise.resolve({ data: [] }),
  ]);

  const mine = new Set(
    ((mineRes.data ?? []) as unknown as Row[]).map((r) => r.games?.slug).filter(Boolean) as string[]
  );

  const counts = new Map<string, { title: string; count: number }>();
  for (const row of (allRes.data ?? []) as unknown as Row[]) {
    const game = row.games;
    if (!game || mine.has(game.slug)) continue;
    const current = counts.get(game.slug);
    if (current) current.count += 1;
    else counts.set(game.slug, { title: game.title, count: 1 });
  }

  const fromDb = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, WANTED)
    .map(([slug, v]) => ({ slug, title: v.title, count: v.count }));

  // Gêneros dos jogos do Gameda (a tabela games não guarda gênero)
  const info = await getGamesBySlugs(fromDb.map((g) => g.slug));
  const genreOf = new Map(info.map((g) => [g.slug, g.genres.join(" / ")]));

  const result: Recommendation[] = fromDb.map((g) => ({
    slug: g.slug,
    title: g.title,
    genre: genreOf.get(g.slug) ?? "",
    fromGameda: g.count,
  }));

  // Completa com populares da IGDB
  if (result.length < WANTED) {
    const taken = new Set([...mine, ...result.map((r) => r.slug)]);
    const popular = await getPopularGames(12);
    for (const game of popular) {
      if (result.length >= WANTED) break;
      if (taken.has(game.slug)) continue;
      result.push({
        slug: game.slug,
        title: game.name,
        genre: game.genres.join(" / "),
        fromGameda: 0,
      });
    }
  }

  return result;
}