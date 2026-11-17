"use server";

import { createClient } from "@/lib/supabase/server";

export type RequestResult = { ok: true } | { ok: false; error: string };

const MAX_PENDING = 5;

// Escapa curingas do ilike para comparar o título literalmente
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function requestGame(
  title: string,
  platform: string,
  notes: string
): Promise<RequestResult> {
  const cleanTitle = title.trim().replace(/\s+/g, " ");
  const cleanPlatform = platform.trim().slice(0, 60);
  const cleanNotes = notes.trim();

  if (cleanTitle.length < 2) return { ok: false, error: "Escreva o nome do jogo." };
  if (cleanTitle.length > 120) return { ok: false, error: "O nome pode ter no máximo 120 caracteres." };
  if (cleanNotes.length > 500) return { ok: false, error: "A observação pode ter no máximo 500 caracteres." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = (data?.claims?.sub as string | undefined) ?? null;
  if (!userId) return { ok: false, error: "Entre na sua conta para solicitar um jogo." };

  // Pedidos pendentes da própria pessoa (freio contra spam e duplicatas)
  const { data: pending } = await supabase
    .from("game_requests")
    .select("title")
    .eq("requested_by", userId)
    .eq("status", "pendente");

  const mine = pending ?? [];
  if (mine.some((r) => (r.title as string).toLowerCase() === cleanTitle.toLowerCase())) {
    return { ok: false, error: "Você já pediu esse jogo. Ele está em análise." };
  }
  if (mine.length >= MAX_PENDING) {
    return { ok: false, error: `Você já tem ${MAX_PENDING} pedidos em análise. Aguarde a validação.` };
  }

  // Sem .select() no fim: não depende de policy de leitura
  const { error } = await supabase.from("game_requests").insert({
    requested_by: userId,
    title: cleanTitle,
    platform: cleanPlatform || null,
    notes: cleanNotes || null,
  });

  if (error) return { ok: false, error: "Não foi possível enviar o pedido." };
  return { ok: true };
}