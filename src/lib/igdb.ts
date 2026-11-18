const IMAGE_BASE = "https://images.igdb.com/igdb/image/upload";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("IGDB: defina IGDB_CLIENT_ID e IGDB_CLIENT_SECRET no .env.local");
    return null;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST", cache: "no-store" }
  );

  if (!res.ok) {
    console.error("IGDB: falha ao obter token", res.status);
    return null;
  }

  const data = await res.json();
  // Renova 5 minutos antes de vencer
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
  return cachedToken.value;
}

interface IgdbGameRaw {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  first_release_date?: number; // segundos (unix)
  cover?: { image_id: string };
  platforms?: { name: string }[];
  genres?: { name: string }[];
  involved_companies?: { developer: boolean; company: { name: string } }[];
}

export interface GameInfo {
  id: number;
  slug: string;
  name: string;
  summary: string | null; // vem em inglês da IGDB
  releaseYear: number | null;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  developers: string[];
}

const FIELDS =
  "name, slug, summary, first_release_date, cover.image_id, platforms.name, genres.name, involved_companies.developer, involved_companies.company.name";

export function buildCoverUrl(imageId: string, size = "t_cover_big") {
  return `${IMAGE_BASE}/${size}/${imageId}.jpg`;
}

function normalize(raw: IgdbGameRaw): GameInfo {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    summary: raw.summary ?? null,
    releaseYear: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).getUTCFullYear()
      : null,
    coverUrl: raw.cover ? buildCoverUrl(raw.cover.image_id) : null,
    platforms: raw.platforms?.map((p) => p.name) ?? [],
    genres: raw.genres?.map((g) => g.name) ?? [],
    developers:
      raw.involved_companies?.filter((c) => c.developer).map((c) => c.company.name) ?? [],
  };
}

// Remove caracteres que quebrariam a consulta
function sanitize(text: string) {
  return text.replace(/["\\;]/g, "").trim();
}

async function queryGames(body: string): Promise<GameInfo[]> {
  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("IGDB: erro na consulta", res.status);
      return [];
    }

    const data: IgdbGameRaw[] = await res.json();
    return data.map(normalize);
  } catch (error) {
    console.error("IGDB: falha de rede", error);
    return [];
  }
}

export async function getGameBySlug(slug: string): Promise<GameInfo | null> {
  const results = await queryGames(
    `fields ${FIELDS}; where slug = "${sanitize(slug)}"; limit 1;`
  );
  return results[0] ?? null;
}

const SEARCH_FILTER =
  "version_parent = null & game_type = (0,8,9,10,11)";

export async function searchGames(term: string, limit = 10): Promise<GameInfo[]> {
  const clean = sanitize(term);
  if (!clean) return [];
  return queryGames(
    `search "${clean}"; fields ${FIELDS}; where ${SEARCH_FILTER}; limit ${limit};`
  );
}

export async function getGamesBySlugs(slugs: string[]): Promise<GameInfo[]> {
  const clean = slugs.map((s) => sanitize(s)).filter(Boolean);
  if (clean.length === 0) return [];
  const list = clean.map((s) => `"${s}"`).join(",");
  return queryGames(`fields ${FIELDS}; where slug = (${list}); limit ${clean.length};`);
}

export async function getPopularGames(limit = 12): Promise<GameInfo[]> {
  return queryGames(
    `fields ${FIELDS}; where ${SEARCH_FILTER} & total_rating_count > 200 & first_release_date != null; sort total_rating_count desc; limit ${limit};`
  );
}