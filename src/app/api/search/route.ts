import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/igdb";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 8, 20);

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const games = await searchGames(q, limit);

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