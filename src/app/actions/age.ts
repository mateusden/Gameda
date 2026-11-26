"use server";

import { createClient } from "@/lib/supabase/server";
import { isOldEnough, isValidIsoDate, MIN_AGE } from "@/lib/age";

export type AgeResult = { ok: true } | { ok: false; error: string };

export async function saveBirthDate(iso: string): Promise<AgeResult> {
  if (!isValidIsoDate(iso)) return { ok: false, error: "Data inválida." };
  if (!isOldEnough(iso)) {
    return { ok: false, error: `O Gameda é para maiores de ${MIN_AGE} anos.` };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = (data?.claims?.sub as string | undefined) ?? null;
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { error } = await supabase
    .from("profile_private")
    .insert({ user_id: userId, birth_date: iso });

  if (error) {
    // 23505 = já informada antes: pode seguir
    if (error.code === "23505") return { ok: true };
    return { ok: false, error: "Não foi possível salvar. Tente de novo." };
  }

  return { ok: true };
}