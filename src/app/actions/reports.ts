"use server";

import { createClient } from "@/lib/supabase/server";

export type ReportTarget =
  | { kind: "review" | "session" | "comment"; id: number }
  | { kind: "profile"; id: string };

export type ReportResult = { ok: true } | { ok: false; error: string };

const REASONS = ["spam", "assedio", "menor", "idade", "ilegal", "direitos", "outro"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function reportContent(
  target: ReportTarget,
  reason: string,
  details: string
): Promise<ReportResult> {
  const text = details.trim();

  if (!REASONS.includes(reason)) return { ok: false, error: "Escolha um motivo." };
  if (text.length > 500) return { ok: false, error: "Os detalhes podem ter no máximo 500 caracteres." };

  const row: Record<string, unknown> = {};
  if (target.kind === "profile") {
    if (typeof target.id !== "string" || !UUID.test(target.id)) {
      return { ok: false, error: "Pedido inválido." };
    }
    row.profile_id = target.id;
  } else if (target.kind === "review" || target.kind === "session" || target.kind === "comment") {
    if (!Number.isInteger(target.id) || target.id < 1) return { ok: false, error: "Pedido inválido." };
    row[`${target.kind}_id`] = target.id;
  } else {
    return { ok: false, error: "Pedido inválido." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = (data?.claims?.sub as string | undefined) ?? null;
  if (!userId) return { ok: false, error: "Entre na sua conta para denunciar." };

  if (target.kind === "profile" && target.id === userId) {
    return { ok: false, error: "Você não pode denunciar a si mesmo." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: userId,
    reason,
    details: text || null,
    ...row,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Você já denunciou isso. Obrigado, vamos analisar." };
    if (error.code === "P0001") return { ok: false, error: error.message };
    return { ok: false, error: "Não foi possível enviar a denúncia." };
  }

  return { ok: true };
}