import { NextRequest, NextResponse } from "next/server";
import { getPopularGames } from "@/lib/igdb";
import { guardApi } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const blocked = guardApi(request, { name: "featured", limit: 20 });
  if (blocked) return blocked;

  const games = await getPopularGames(12);

  return NextResponse.json(
    {
      results: games.map((game) => ({
        slug: game.slug,
        title: game.name,
        genre: game.genres.join(" / "),
        platforms: game.platforms,
        coverUrl: game.coverUrl,
      })),
    },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}