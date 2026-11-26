"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccountResult = { ok: true } | { ok: false; error: string };

export async function deleteAccount(confirmation: string): Promise<AccountResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = (data?.claims?.sub as string | undefined) ?? null;
  if (!userId) return { ok: false, error: "Entre na sua conta." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || confirmation.trim() !== profile.username) {
    return { ok: false, error: "Digite seu @ exatamente como aparece para confirmar." };
  }

  const admin = createAdminClient();

  // Apaga as fotos de perfil guardadas no nosso armazenamento
  try {
    const { data: files } = await admin.storage.from("avatars").list(userId, { limit: 100 });
    if (files && files.length > 0) {
      await admin.storage.from("avatars").remove(files.map((f) => `${userId}/${f.name}`));
    }
  } catch {
    // Se falhar, seguimos: o mais importante é apagar a conta
  }

  // Apaga o usuário; o banco apaga o resto em cascata
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { ok: false, error: "Não foi possível excluir a conta. Tente de novo ou escreva para o suporte." };
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // a sessão já não existe mais
  }

  return { ok: true };
}