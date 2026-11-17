"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type NotificationType = "follow" | "like" | "comment" | "reply";

interface GameRef {
  slug: string;
  title: string;
}

interface NotificationRow {
  id: number;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
  review_id: number | null;
  session_id: number | null;
  actor: { username: string; avatar_url: string | null } | null;
  recipient: { username: string } | null;
  reviews: { games: GameRef | null } | null;
  sessions: {
    library_platforms: { library_entries: { games: GameRef | null } | null } | null;
  } | null;
}

const SELECT =
  "id, type, read_at, created_at, review_id, session_id, " +
  "actor:profiles!actor_id(username, avatar_url), " +
  "recipient:profiles!user_id(username), " +
  "reviews(games(slug, title)), " +
  "sessions(library_platforms(library_entries(games(slug, title))))";

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  return `em ${new Date(iso).toLocaleDateString("pt-BR")}`;
}

function describe(n: NotificationRow) {
  const game = n.reviews?.games ?? n.sessions?.library_platforms?.library_entries?.games ?? null;
  const what = n.review_id ? "sua resenha" : "sua sessão";
  const where = game ? ` de ${game.title}` : "";

  switch (n.type) {
    case "follow":
      return "começou a seguir você";
    case "like":
      return `curtiu ${what}${where}`;
    case "comment":
      return `comentou em ${what}${where}`;
    case "reply":
      return `respondeu ao seu comentário${game ? ` em ${game.title}` : ""}`;
  }
}

function hrefFor(n: NotificationRow) {
  if (n.type === "follow") return n.actor ? `/profile/${n.actor.username}` : "/";
  if (n.review_id) {
    const slug = n.reviews?.games?.slug;
    if (slug) return `/game/${slug}`;
  }
  // Sessões aparecem no perfil de quem as registrou (o próprio destinatário)
  if (n.session_id && n.recipient) return `/profile/${n.recipient.username}`;
  return n.actor ? `/profile/${n.actor.username}` : "/";
}

export default function NotificationsBell({ className = "flex" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[] | null>(null);

  // Quem está logado
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!active) return;
        setUserId(session?.user.id ?? null);
        if (!session) {
          setUnread(0);
          setItems(null);
          setOpen(false);
        }
      }, 0);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Contador de não lidas: ao carregar e a cada 60 segundos
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let active = true;

    const refreshCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (active) setUnread(count ?? 0);
    };

    refreshCount();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refreshCount();
    }, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("notifications")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data ?? []) as unknown as NotificationRow[]);

    // Marca como lidas (a lista mostrada mantém o destaque das novas)
    if (unread > 0 && userId) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
      if (!error) setUnread(0);
    }
  };

  if (!ready) return <div className={`${className} h-6 w-6`} aria-hidden />;

  if (!userId) {
    return (
      <Link
        href="/login"
        aria-label="Notificações"
        className={`${className} cursor-pointer items-center transition-colors hover:text-[#66836A]`}
      >
        <Bell size={22} />
      </Link>
    );
  }

  return (
    <div ref={boxRef} className={`${className} relative items-center`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notificações (${unread} novas)` : "Notificações"}
        aria-expanded={open}
        className="relative flex cursor-pointer items-center transition-colors hover:text-[#66836A]"
      >
        <Bell size={22} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A9574D] px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#343A35]/10 bg-[#F3EFE6] shadow-lg animate-fadeIn">
          <p className="border-b border-[#343A35]/10 px-4 py-2.5 text-sm font-bold text-[#343A35]">
            Notificações
          </p>

          {items === null && <p className="px-4 py-4 text-sm text-[#343A35]/70">Carregando...</p>}

          {items !== null && items.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#343A35]/70">
              Nada por aqui ainda. Quando alguém seguir, curtir ou comentar, aparece aqui.
            </p>
          )}

          {items !== null && items.length > 0 && (
            <ul className="max-h-96 overflow-y-auto p-1.5">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={hrefFor(n)}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-[#E9E3D5]/70 ${
                      n.read_at ? "" : "bg-[#66836A]/10"
                    }`}
                  >
                    <Avatar
                      src={n.actor?.avatar_url}
                      name={n.actor?.username ?? "?"}
                      className="h-8 w-8 text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-[#343A35]">
                        <strong className="font-semibold">@{n.actor?.username ?? "alguém"}</strong>{" "}
                        {describe(n)}
                      </p>
                      <span className="text-xs text-[#343A35]/60">{timeAgo(n.created_at)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}