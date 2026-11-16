"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGameBySlug } from "@/lib/igdb";

export type ActionResult = { ok: true } | { ok: false; error: string };

const STATUSES = ["quero_jogar", "jogando", "zerado", "pausado"];
const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

async function getUserId(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}

// Garante que o jogo existe na tabela games (cadastra a partir da IGDB se preciso)
async function ensureGame(supabase: SupabaseClient, slug: string) {
  const { data: existing } = await supabase
    .from("games")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id as number;

  const igdbGame = await getGameBySlug(slug);
  if (!igdbGame) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("games")
    .upsert(
      { igdb_id: igdbGame.id, slug: igdbGame.slug, title: igdbGame.name },
      { onConflict: "igdb_id" }
    )
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as number;
}

export async function addToLibrary(
  slug: string,
  status: string,
  platform: string
): Promise<ActionResult> {
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: "Jogo inválido." };
  if (!STATUSES.includes(status)) return { ok: false, error: "Status inválido." };
  const cleanPlatform = platform.trim().slice(0, 60);
  if (!cleanPlatform) return { ok: false, error: "Escolha uma plataforma." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta para adicionar jogos." };

  const gameId = await ensureGame(supabase, slug);
  if (!gameId) return { ok: false, error: "Não encontramos esse jogo." };

  const { data: entry, error } = await supabase
    .from("library_entries")
    .upsert(
      { user_id: userId, game_id: gameId, status, updated_at: new Date().toISOString() },
      { onConflict: "user_id,game_id" }
    )
    .select("id")
    .single();

  if (error || !entry) return { ok: false, error: "Não foi possível adicionar o jogo." };

  const { error: platformError } = await supabase
    .from("library_platforms")
    .upsert(
      { entry_id: entry.id, platform: cleanPlatform },
      { onConflict: "entry_id,platform", ignoreDuplicates: true }
    );

  if (platformError) return { ok: false, error: "Não foi possível salvar a plataforma." };

  revalidatePath("/library");
  revalidatePath(`/game/${slug}`);
  return { ok: true };
}

export async function updateStatus(slug: string, status: string): Promise<ActionResult> {
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: "Jogo inválido." };
  if (!STATUSES.includes(status)) return { ok: false, error: "Status inválido." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { data: game } = await supabase.from("games").select("id").eq("slug", slug).maybeSingle();
  if (!game) return { ok: false, error: "Jogo não encontrado." };

  const { error } = await supabase
    .from("library_entries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("game_id", game.id);

  if (error) return { ok: false, error: "Não foi possível mudar o status." };

  revalidatePath("/library");
  revalidatePath(`/game/${slug}`);
  return { ok: true };
}

interface SessionInput {
  slug: string;
  platform: string;
  playedOn: string; // AAAA-MM-DD
  minutes: number;
  comment: string;
}

export async function logSession(input: SessionInput): Promise<ActionResult> {
  const { slug, playedOn } = input;
  const platform = input.platform.trim().slice(0, 60);
  const comment = input.comment.trim().slice(0, 500);
  const minutes = Math.round(input.minutes);

  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: "Jogo inválido." };
  if (!platform) return { ok: false, error: "Escolha uma plataforma." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(playedOn)) return { ok: false, error: "Data inválida." };
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
    return { ok: false, error: "A duração precisa ser entre 1 minuto e 24 horas." };
  }

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { data: game } = await supabase.from("games").select("id").eq("slug", slug).maybeSingle();
  if (!game) return { ok: false, error: "Adicione o jogo à biblioteca primeiro." };

  const { data: entry } = await supabase
    .from("library_entries")
    .select("id, status")
    .eq("user_id", userId)
    .eq("game_id", game.id)
    .maybeSingle();
  if (!entry) return { ok: false, error: "Adicione o jogo à biblioteca primeiro." };

  // Reaproveita a plataforma, ou cria se for nova (ex.: jogou também no Switch)
  let { data: platformRow } = await supabase
    .from("library_platforms")
    .select("id")
    .eq("entry_id", entry.id)
    .eq("platform", platform)
    .maybeSingle();

  if (!platformRow) {
    const { data: created, error: createError } = await supabase
      .from("library_platforms")
      .insert({ entry_id: entry.id, platform })
      .select("id")
      .single();
    if (createError || !created) return { ok: false, error: "Não foi possível salvar a plataforma." };
    platformRow = created;
  }

  const { error: sessionError } = await supabase.from("sessions").insert({
    user_id: userId,
    platform_id: platformRow.id,
    played_on: playedOn,
    duration_minutes: minutes,
    comment: comment || null,
  });

  if (sessionError) return { ok: false, error: "Não foi possível registrar a sessão." };

  if (entry.status === "quero_jogar") {
    await supabase.from("library_entries").update({ status: "jogando" }).eq("id", entry.id);
  }

  revalidatePath("/library");
  revalidatePath(`/game/${slug}`);
  return { ok: true };
}

export async function createReview(
  slug: string,
  rating: number,
  body: string
): Promise<ActionResult> {
  const text = body.trim();

  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: "Jogo inválido." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Escolha uma nota de 1 a 5 estrelas." };
  }
  if (text.length < 10) return { ok: false, error: "Escreva pelo menos 10 caracteres." };
  if (text.length > 2000) return { ok: false, error: "A resenha pode ter no máximo 2000 caracteres." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta para escrever resenhas." };

  const { data: game } = await supabase.from("games").select("id").eq("slug", slug).maybeSingle();
  if (!game) return { ok: false, error: "Adicione o jogo à biblioteca primeiro." };

  const { error } = await supabase
    .from("reviews")
    .insert({ user_id: userId, game_id: game.id, rating, body: text });

  if (error) {
    // Mensagens das regras do banco (biblioteca e sessão) já vêm em português
    if (error.code === "P0001") return { ok: false, error: error.message };
    return { ok: false, error: "Não foi possível publicar a resenha." };
  }

  revalidatePath(`/game/${slug}`);
  return { ok: true };
}

export async function deleteReview(reviewId: number, slug: string): Promise<ActionResult> {
  if (!Number.isInteger(reviewId) || !SLUG_PATTERN.test(slug)) {
    return { ok: false, error: "Pedido inválido." };
  }

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: "Não foi possível apagar a resenha." };

  revalidatePath(`/game/${slug}`);
  return { ok: true };
}