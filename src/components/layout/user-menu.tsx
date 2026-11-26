"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type State =
  | { status: "loading" }
  | { status: "out" }
  | { status: "in"; username: string; displayName: string; avatarUrl: string | null };

export default function UserMenu({ className = "flex" }: { className?: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load(userId: string | null) {
      if (!userId) {
        if (active) setState({ status: "out" });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", userId)
        .single();
      if (active) {
        setState({
          status: "in",
          username: data?.username ?? "",
          displayName: data?.display_name ?? data?.username ?? "Perfil",
          avatarUrl: data?.avatar_url ?? null,
        });
      }
    }

    supabase.auth.getUser().then(({ data }) => load(data.user?.id ?? null));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      // setTimeout evita travar o cliente ao consultar dentro deste callback
      setTimeout(() => load(session?.user.id ?? null), 0);
    });

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string | null }>).detail;
      // Se o aviso trouxe a foto nova, mostra na hora
      if (detail && "avatarUrl" in detail) {
        setState((prev) =>
          prev.status === "in" ? { ...prev, avatarUrl: detail.avatarUrl ?? null } : prev
        );
      }
      // E confirma com o banco em seguida (nome, @ etc.)
      supabase.auth.getUser().then(({ data }) => load(data.user?.id ?? null));
    };
    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (state.status === "loading") {
    return <div className={`${className} h-6 w-24`} aria-hidden />;
  }

  if (state.status === "out") {
    return (
      <Link
        href="/login"
        className={`${className} items-center rounded-xl bg-gameda-primary px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gameda-primary-dark`}
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className={`${className} items-center gap-3`}>
      <Link
        href={`/profile/${state.username}`}
        title={state.displayName}
        aria-label={`Perfil de @${state.username}`}
        className="flex cursor-pointer items-center gap-2 transition-colors hover:text-gameda-primary "
      >
        <Avatar src={state.avatarUrl} name={state.username} className="w-8 h-8 text-xs" />
        <span className="hidden max-w-32 truncate text-base font-medium sm:inline">
          @{state.username}
        </span>
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sair"
        className="flex cursor-pointer items-center transition-colors hover:text-[#A9574D]"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}