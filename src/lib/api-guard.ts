import { NextResponse, type NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Só aceita chamadas feitas pelo próprio site (navegador)
function isSameOrigin(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";

  const host = request.headers.get("host");
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!host || !source) return false;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

export function guardApi(
  request: NextRequest,
  options: { name: string; limit: number; windowMs?: number }
): NextResponse | null {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Acesso não permitido." }, { status: 403 });
  }

  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  // Limpeza para o mapa não crescer sem parar
  if (buckets.size > 5000) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
    if (buckets.size > 20000) buckets.clear();
  }

  const key = `${options.name}:${clientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > options.limit) {
    const retry = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Muitas requisições. Tente de novo em instantes." },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }

  return null;
}