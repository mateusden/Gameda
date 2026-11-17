import { NextResponse } from "next/server";
import { getPopularGames } from "@/lib/igdb";

export async function GET() {
  const games = await getPopularGames(12);

  return NextResponse.json({
    results: games.map((game) => ({
      slug: game.slug,
      title: game.name,
      genre: game.genres.join(" / "),
      platforms: game.platforms,
      coverUrl: game.coverUrl,
    })),
  });
}