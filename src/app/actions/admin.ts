"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getGameBySlug } from "@/lib/igdb";

export type AdminResult = { ok: true } | { ok: false; error: string };

const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin === true ? supabase : null;
}

export async function approveRequest(
  requestId: number,
  slug: string,
  note: string
): Promise<AdminResult> {
  const cleanSlug = slug.trim().toLowerCase();
  const cleanNote = note.trim().slice(0, 300);

  if (!Number.isInteger(requestId) || requestId < 1) {
    return { ok: false, error: "Pedido inválido." };
  }
  if (!SLUG_PATTERN.test(cleanSlug)) {
    return { ok: false, error: "Slug inválido. Use o trecho da URL da IGDB (ex.: elden-ring)." };
  }

  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Sem permissão." };

  const game = await getGameBySlug(cleanSlug);
  if (!game) return { ok: false, error: "Esse slug não existe na IGDB." };

  const { error } = await supabase
    .from("game_requests")
    .update({ status: "aprovado", igdb_slug: game.slug, admin_note: cleanNote || null })
    .eq("id", requestId)
    .eq("status", "pendente");

  if (error) return { ok: false, error: "Não foi possível aprovar o pedido." };

  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectRequest(requestId: number, note: string): Promise<AdminResult> {
  const cleanNote = note.trim().slice(0, 300);

  if (!Number.isInteger(requestId) || requestId < 1) {
    return { ok: false, error: "Pedido inválido." };
  }

  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Sem permissão." };

  const { error } = await supabase
    .from("game_requests")
    .update({ status: "rejeitado", admin_note: cleanNote || null })
    .eq("id", requestId)
    .eq("status", "pendente");

  if (error) return { ok: false, error: "Não foi possível recusar o pedido." };

  revalidatePath("/admin");
  return { ok: true };
}