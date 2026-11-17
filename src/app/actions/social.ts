"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Target = { kind: "review" | "session"; id: number };
export type LikeResult = { ok: true; liked: boolean } | { ok: false; error: string };
export type CommentResult = { ok: true } | { ok: false; error: string };

// Só deixa revalidar páginas de jogo ou de perfil
const PATH_PATTERN = /^(\/|\/(game|profile)\/[a-zA-Z0-9_-]{1,100})$/;

const column = (target: Target) =>
  target.kind === "review" ? "review_id" : "session_id";

const validTarget = (target: Target) =>
  (target.kind === "review" || target.kind === "session") &&
  Number.isInteger(target.id) &&
  target.id > 0;

async function getUserId(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}

function refresh(path: string) {
  if (PATH_PATTERN.test(path)) revalidatePath(path);
}

export async function toggleLike(target: Target, path: string): Promise<LikeResult> {
  if (!validTarget(target)) return { ok: false, error: "Pedido inválido." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta para curtir." };

  const col = column(target);

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq(col, target.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    if (error) return { ok: false, error: "Não foi possível remover a curtida." };
    refresh(path);
    return { ok: true, liked: false };
  }

  const { error } = await supabase
    .from("likes")
    .insert({ user_id: userId, [col]: target.id });

  // 23505 = já existia (duplo clique): para a pessoa, continua curtido
  if (error && error.code !== "23505") {
    return {
      ok: false,
      error: error.code === "23503" ? "Conteúdo não encontrado." : "Não foi possível curtir.",
    };
  }

  refresh(path);
  return { ok: true, liked: true };
}

export async function addComment(
  target: Target,
  body: string,
  path: string,
  parentId?: number
): Promise<CommentResult> {
  const text = body.trim();

  if (!validTarget(target)) return { ok: false, error: "Pedido inválido." };
  if (text.length < 1) return { ok: false, error: "Escreva alguma coisa." };
  if (text.length > 1000) return { ok: false, error: "O comentário pode ter no máximo 1000 caracteres." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta para comentar." };

  const col = column(target);

  // Respostas: só a um comentário principal do mesmo conteúdo (um nível)
  if (parentId !== undefined) {
    if (!Number.isInteger(parentId) || parentId < 1) {
      return { ok: false, error: "Pedido inválido." };
    }
    const { data: parent } = await supabase
      .from("comments")
      .select("id, parent_id, review_id, session_id")
      .eq("id", parentId)
      .maybeSingle();

    if (!parent || parent[col] !== target.id) {
      return { ok: false, error: "Comentário não encontrado." };
    }
    if (parent.parent_id !== null) {
      return { ok: false, error: "Só é possível responder a comentários principais." };
    }
  }

  const { error } = await supabase.from("comments").insert({
    user_id: userId,
    [col]: target.id,
    parent_id: parentId ?? null,
    body: text,
  });

  if (error) {
    return {
      ok: false,
      error: error.code === "23503" ? "Conteúdo não encontrado." : "Não foi possível comentar.",
    };
  }

  refresh(path);
  return { ok: true };
}

export async function deleteComment(commentId: number, path: string): Promise<CommentResult> {
  if (!Number.isInteger(commentId) || commentId < 1) {
    return { ok: false, error: "Pedido inválido." };
  }

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: "Não foi possível apagar o comentário." };

  refresh(path);
  return { ok: true };
}