import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/igdb";
import { guardApi } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const blocked = guardApi(request, { name: "search", limit: 40 });
  if (blocked) return blocked;

  const q = (request.nextUrl.searchParams.get("q")?.trim() ?? "").slice(0, 80);
  const limit = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("limit")) || 8, 20));

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const games = await searchGames(q, limit);

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
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}