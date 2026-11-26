"use server";

import { createClient } from "@/lib/supabase/server";

export type BlockResult = { ok: true } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}

export async function blockUser(profileId: string): Promise<BlockResult> {
  if (!UUID.test(profileId)) return { ok: false, error: "Pedido inválido." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta." };
  if (userId === profileId) return { ok: false, error: "Você não pode bloquear a si mesmo." };

  const { error } = await supabase.rpc("block_user", { target: profileId });
  if (error) {
    if (error.code === "P0001") return { ok: false, error: error.message };
    return { ok: false, error: "Não foi possível bloquear." };
  }
  return { ok: true };
}

export async function unblockUser(profileId: string): Promise<BlockResult> {
  if (!UUID.test(profileId)) return { ok: false, error: "Pedido inválido." };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", profileId);

  if (error) return { ok: false, error: "Não foi possível desbloquear." };
  return { ok: true };
}