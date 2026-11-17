import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommentItem } from "@/components/social/comments";

export interface SocialInfo {
  likeCount: number;
  liked: boolean;
  comments: CommentItem[];
}

export async function loadSocial(
  supabase: SupabaseClient,
  kind: "review" | "session",
  ids: number[],
  viewerId: string | null
) {
  const result = new Map<number, SocialInfo>();
  for (const id of ids) result.set(id, { likeCount: 0, liked: false, comments: [] });
  if (ids.length === 0) return result;

  const column = kind === "review" ? "review_id" : "session_id";

  const [likesRes, commentsRes] = await Promise.all([
    supabase.from("likes").select(`${column}, user_id`).in(column, ids),
    supabase
      .from("comments")
      .select(`id, user_id, ${column}, parent_id, body, created_at, profiles(username, avatar_url)`)
      .in(column, ids)
      .order("created_at", { ascending: true }),
  ]);

  const likes = (likesRes.data ?? []) as unknown as Record<string, unknown>[];
  for (const like of likes) {
    const info = result.get(like[column] as number);
    if (!info) continue;
    info.likeCount += 1;
    if (viewerId && like.user_id === viewerId) info.liked = true;
  }

  const comments = (commentsRes.data ?? []) as unknown as (CommentItem & Record<string, unknown>)[];
  for (const comment of comments) {
    result.get(comment[column] as number)?.comments.push(comment);
  }

  return result;
}