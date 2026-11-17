import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommentItem } from "@/components/social/comments";

export type FeedKind = "session" | "review" | "completed";

export interface FeedItem {
  key: string;
  kind: FeedKind;
  at: string; // ISO, usado para ordenar
  dateOnly: boolean; // sessões só têm a data, sem hora
  user: { username: string; avatarUrl: string | null };
  game: { slug: string; title: string };
  platform: string | null;
  minutes: number | null;
  rating: number | null;
  text: string | null;
  targetId: number | null; // id da sessão ou resenha (null em "zerou")
  likeCount: number;
  liked: boolean;
  comments: CommentItem[];
}

const LIMIT = 20;

interface SessionRow {
  id: number;
  user_id: string;
  played_on: string;
  duration_minutes: number;
  comment: string | null;
  library_platforms: {
    platform: string;
    library_entries: { games: { slug: string; title: string } | null } | null;
  } | null;
}

interface ReviewRow {
  id: number;
  user_id: string;
  rating: number;
  body: string;
  minutes_at_review: number;
  created_at: string;
  games: { slug: string; title: string } | null;
}

interface CompletedRow {
  id: number;
  user_id: string;
  completed_at: string;
  games: { slug: string; title: string } | null;
  library_platforms: { platform: string }[] | null;
}

interface LikeRow {
  review_id: number | null;
  session_id: number | null;
  user_id: string;
}

type CommentRow = CommentItem & { review_id: number | null; session_id: number | null };

export async function loadFeed(supabase: SupabaseClient, viewerId: string) {
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId);

  const followingIds = (follows ?? []).map((f) => f.following_id as string);
  if (followingIds.length === 0) {
    return { items: [] as FeedItem[], followingCount: 0 };
  }

  const [sessionsRes, reviewsRes, completedRes, profilesRes] = await Promise.all([
    supabase
      .from("sessions")
      .select(
        "id, user_id, played_on, duration_minutes, comment, library_platforms(platform, library_entries(games(slug, title)))"
      )
      .in("user_id", followingIds)
      .order("played_on", { ascending: false })
      .order("id", { ascending: false })
      .limit(LIMIT),
    supabase
      .from("reviews")
      .select("id, user_id, rating, body, minutes_at_review, created_at, games(slug, title)")
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .limit(LIMIT),
    supabase
      .from("library_entries")
      .select("id, user_id, completed_at, games(slug, title), library_platforms(platform)")
      .in("user_id", followingIds)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(LIMIT),
    supabase.from("profiles").select("id, username, avatar_url").in("id", followingIds),
  ]);

  const profiles = new Map(
    (profilesRes.data ?? []).map((p) => [
      p.id as string,
      { username: p.username as string, avatarUrl: (p.avatar_url as string | null) ?? null },
    ])
  );

  const items: FeedItem[] = [];

  for (const s of (sessionsRes.data ?? []) as unknown as SessionRow[]) {
    const game = s.library_platforms?.library_entries?.games;
    const user = profiles.get(s.user_id);
    if (!game || !user) continue;
    items.push({
      key: `session-${s.id}`,
      kind: "session",
      at: `${s.played_on}T00:00:00`,
      dateOnly: true,
      user,
      game,
      platform: s.library_platforms?.platform ?? null,
      minutes: s.duration_minutes,
      rating: null,
      text: s.comment,
      targetId: s.id,
      likeCount: 0,
      liked: false,
      comments: [],
    });
  }

  for (const r of (reviewsRes.data ?? []) as unknown as ReviewRow[]) {
    const user = profiles.get(r.user_id);
    if (!r.games || !user) continue;
    items.push({
      key: `review-${r.id}`,
      kind: "review",
      at: r.created_at,
      dateOnly: false,
      user,
      game: r.games,
      platform: null,
      minutes: r.minutes_at_review,
      rating: r.rating,
      text: r.body,
      targetId: r.id,
      likeCount: 0,
      liked: false,
      comments: [],
    });
  }

  for (const c of (completedRes.data ?? []) as unknown as CompletedRow[]) {
    const user = profiles.get(c.user_id);
    if (!c.games || !user) continue;
    items.push({
      key: `completed-${c.id}`,
      kind: "completed",
      at: c.completed_at,
      dateOnly: false,
      user,
      game: c.games,
      platform: (c.library_platforms ?? []).map((p) => p.platform).join(", ") || null,
      minutes: null,
      rating: null,
      text: null,
      targetId: null,
      likeCount: 0,
      liked: false,
      comments: [],
    });
  }

  items.sort((a, b) => b.at.localeCompare(a.at));
  const top = items.slice(0, LIMIT);

  // Curtidas e comentários só dos itens que ficaram
  const reviewIds = top.filter((i) => i.kind === "review").map((i) => i.targetId as number);
  const sessionIds = top.filter((i) => i.kind === "session").map((i) => i.targetId as number);

  const fetchLikes = async (column: "review_id" | "session_id", ids: number[]) => {
    if (ids.length === 0) return [] as LikeRow[];
    const { data } = await supabase
      .from("likes")
      .select("review_id, session_id, user_id")
      .in(column, ids);
    return (data ?? []) as LikeRow[];
  };

  const fetchComments = async (column: "review_id" | "session_id", ids: number[]) => {
    if (ids.length === 0) return [] as CommentRow[];
    const { data } = await supabase
      .from("comments")
      .select(
        "id, user_id, review_id, session_id, parent_id, body, created_at, profiles(username, avatar_url)"
      )
      .in(column, ids)
      .order("created_at", { ascending: true });
    return (data ?? []) as unknown as CommentRow[];
  };

  const [reviewLikes, sessionLikes, reviewComments, sessionComments] = await Promise.all([
    fetchLikes("review_id", reviewIds),
    fetchLikes("session_id", sessionIds),
    fetchComments("review_id", reviewIds),
    fetchComments("session_id", sessionIds),
  ]);

  for (const item of top) {
    if (item.targetId === null) continue;
    const isReview = item.kind === "review";
    const likes = (isReview ? reviewLikes : sessionLikes).filter((l) =>
      isReview ? l.review_id === item.targetId : l.session_id === item.targetId
    );
    item.likeCount = likes.length;
    item.liked = likes.some((l) => l.user_id === viewerId);
    item.comments = (isReview ? reviewComments : sessionComments).filter((c) =>
      isReview ? c.review_id === item.targetId : c.session_id === item.targetId
    );
  }

  return { items: top, followingCount: followingIds.length };
}