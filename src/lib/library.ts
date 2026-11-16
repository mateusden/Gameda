import type { SupabaseClient } from "@supabase/supabase-js";
import type { GameStatus, LibraryGame } from "@/lib/mock-games";

export const statusLabel: Record<string, GameStatus> = {
  quero_jogar: "Quero jogar",
  jogando: "Jogando",
  zerado: "Zerado",
  pausado: "Pausado",
};

export function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0 && m === 0) return "0h";
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

interface EntryRow {
  id: number;
  status: string;
  games: { slug: string; title: string } | null;
  library_platforms:
    | { platform: string; sessions: { duration_minutes: number }[] | null }[]
    | null;
}

export async function loadLibrary(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("library_entries")
    .select("id, status, games(slug, title), library_platforms(platform, sessions(duration_minutes))")
    .eq("user_id", userId);

  const entries = ((data ?? []) as unknown as EntryRow[]).filter((e) => e.games);

  let totalMinutes = 0;
  const games: LibraryGame[] = entries.map((entry) => {
    const platforms = entry.library_platforms ?? [];
    const minutes = platforms.reduce(
      (sum, p) => sum + (p.sessions ?? []).reduce((s, x) => s + x.duration_minutes, 0),
      0
    );
    totalMinutes += minutes;
    return {
      id: entry.id,
      slug: entry.games!.slug,
      title: entry.games!.title,
      platform: platforms.map((p) => p.platform).join(", ") || "—",
      hours: formatHours(minutes),
      status: statusLabel[entry.status] ?? "Quero jogar",
    };
  });

  return { games, totalMinutes };
}