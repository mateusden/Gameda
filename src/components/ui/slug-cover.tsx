"use client";

import { useEffect, useState } from "react";
import GameCover from "@/components/ui/game-cover";

// Cache em memória e fila: capas pedidas no mesmo instante viram 1 requisição só
const cache = new Map<string, string | null>();
const waiters = new Map<string, Array<(url: string | null) => void>>();
const queue = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  const slugs = [...queue];
  queue.clear();
  timer = null;

  try {
    const res = await fetch(`/api/covers?slugs=${slugs.map(encodeURIComponent).join(",")}`);
    if (!res.ok) throw new Error("Falha ao buscar capas");
    const data: { covers: Record<string, string | null> } = await res.json();
    for (const slug of slugs) cache.set(slug, data.covers[slug] ?? null);
  } catch {
    for (const slug of slugs) cache.set(slug, null);
  }

  for (const slug of slugs) {
    waiters.get(slug)?.forEach((callback) => callback(cache.get(slug) ?? null));
    waiters.delete(slug);
  }
}

function requestCover(slug: string, callback: (url: string | null) => void) {
  if (cache.has(slug)) {
    callback(cache.get(slug) ?? null);
    return;
  }

  const list = waiters.get(slug);
  if (list) {
    list.push(callback);
    return;
  }

  waiters.set(slug, [callback]);
  queue.add(slug);
  if (!timer) timer = setTimeout(flush, 50);
}

interface SlugCoverProps {
  slug: string;
  title: string;
  coverUrl?: string | null; // se já tiver a capa, não busca
  className?: string;
}

export default function SlugCover({ slug, title, coverUrl, className }: SlugCoverProps) {
  const [fetched, setFetched] = useState<string | null>(null);

  useEffect(() => {
    if (coverUrl) return;
    let active = true;
    requestCover(slug, (url) => {
      if (active) setFetched(url);
    });
    return () => {
      active = false;
    };
  }, [slug, coverUrl]);

  return <GameCover title={title} coverUrl={coverUrl ?? fetched} className={className} />;
}