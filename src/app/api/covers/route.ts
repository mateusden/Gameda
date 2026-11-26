import { NextRequest, NextResponse } from "next/server";
import { getGamesBySlugs } from "@/lib/igdb";
import { guardApi } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const blocked = guardApi(request, { name: "covers", limit: 60 });
  if (blocked) return blocked;

  const raw = request.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,100}$/.test(s))
    .slice(0, 30);

  const games = await getGamesBySlugs(slugs);

  const covers: Record<string, string | null> = {};
  for (const slug of slugs) covers[slug] = null;
  for (const game of games) covers[game.slug] = game.coverUrl;

  return NextResponse.json(
    { covers },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}