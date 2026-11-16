"use client";

import { useEffect, useState } from "react";
import { searchCatalog } from "@/lib/catalog";

export interface SearchResult {
  slug: string;
  title: string;
  genre: string;
  platforms: string[];
  coverUrl: string | null;
}

export function useGameSearch(query: string, limit = 8) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();

    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&limit=${limit}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Falha na busca");
        const data = await res.json();
        setResults(data.results);
      } catch {
        if (controller.signal.aborted) return;
        // Reserva: lista local
        setResults(
          searchCatalog(term)
            .slice(0, limit)
            .map((game) => ({ ...game, coverUrl: null }))
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, limit]);

  return { results, loading };
}