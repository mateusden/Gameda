"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import GameCover from "@/components/ui/game-cover";
import { useGameSearch } from "@/hooks/use-game-search";
import UserMenu from "@/components/layout/user-menu";
import NotificationsBell from "@/components/layout/notifications-bell";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/explore", label: "Explorar" },
  { href: "/library", label: "Biblioteca" },
];

interface SearchBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SearchBox({ open, onOpenChange }: SearchBoxProps) {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const hasQuery = query.trim().length > 0;
  const { results, loading } = useGameSearch(query, 5);

  const close = () => {
    onOpenChange(false);
    setQuery("");
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onOpenChange(false);
        setQuery("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  const toggle = () => {
    if (open) close();
    else onOpenChange(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(results[0] ? `/game/${results[0].slug}` : "/explore");
    close();
  };

  return (
    <div ref={boxRef} className="relative">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center rounded-full border py-1.5 transition-all duration-200 ${
          open
            ? "border-gameda-border bg-gameda-surface px-3"
            : "border-transparent px-0"
        }`}
      >
        <button
          type="button"
          aria-label={open ? "Fechar pesquisa" : "Pesquisar jogos"}
          aria-expanded={open}
          onClick={toggle}
          className="flex cursor-pointer items-center text-gameda-text transition-colors hover:text-gameda-primary"
        >
          <Search size={21} strokeWidth={1.8} />
        </button>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          tabIndex={open ? 0 : -1}
          placeholder="Buscar jogos..."
          aria-label="Buscar jogos"
          className={`min-w-0 bg-transparent text-sm text-gameda-text placeholder:text-gameda-muted outline-none transition-all duration-200 ${
            open
              ? "ml-2 w-28 opacity-100 sm:w-36 md:w-40 lg:w-48"
              : "ml-0 w-0 opacity-0"
          }`}
        />
      </form>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gameda-border bg-gameda-surface shadow-lg animate-fadeIn">
          {!hasQuery && (
            <p className="px-4 py-3 text-xs text-gameda-muted">
              Comece a digitar para encontrar jogos no catálogo.
            </p>
          )}

          {hasQuery && results.length > 0 && (
            <ul className="p-1.5">
              {results.map((game) => (
                <li key={game.slug}>
                  <Link
                    href={`/game/${game.slug}`}
                    onClick={close}
                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gameda-sage/50"
                  >
                    <GameCover
                      title={game.title}
                      coverUrl={game.coverUrl}
                      className="h-12 w-9 text-xs"
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gameda-text transition-colors group-hover:text-gameda-primary">
                        {game.title}
                      </span>
                      <span className="block truncate text-xs text-gameda-muted">
                        {game.genre}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasQuery && loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-gameda-muted">Buscando...</p>
          )}

          {hasQuery && !loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-gameda-muted">
              Nenhum jogo encontrado para &quot;{query.trim()}&quot;.
            </p>
          )}

          <Link
            href="/explore"
            onClick={close}
            className="block border-t border-gameda-border px-4 py-2.5 text-xs font-medium text-gameda-primary transition-colors hover:bg-gameda-sage/40"
          >
            Ver catálogo completo →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileHref, setProfileHref] = useState<string | null | undefined>(
    undefined,
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      isActive(href)
        ? "font-semibold text-gameda-primary"
        : "font-medium text-gameda-text hover:text-gameda-primary"
    }`;

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const loadProfileLink = async (userId: string | null) => {
      if (!userId) {
        if (active) setProfileHref(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (active) {
        setProfileHref(
          data?.username ? `/profile/${data.username}` : "/settings/profile",
        );
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      void loadProfileLink(data.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        void loadProfileLink(session?.user.id ?? null);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gameda-border bg-gameda-bg/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center px-4 sm:px-6 md:h-20 md:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          href="/"
          aria-label="Gameda — início"
          className="logo w-fit text-2xl tracking-tight text-gameda-text sm:text-3xl md:text-4xl"
        >
          gameda
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegação principal"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={linkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 text-gameda-text sm:gap-4">
          <SearchBox open={searchOpen} onOpenChange={setSearchOpen} />
          <NotificationsBell />
          <UserMenu className="hidden md:flex" />

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-1 text-gameda-text transition-colors hover:bg-gameda-sage/60 hover:text-gameda-primary md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegação móvel"
          className="absolute right-4 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gameda-border bg-gameda-surface p-2 shadow-lg md:hidden sm:right-6"
        >
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-gameda-sage/60 font-semibold text-gameda-primary"
                    : "text-gameda-text hover:bg-gameda-sage/40"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 border-t border-gameda-border" />

            {profileHref ? (
              <Link
                href={profileHref}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-gameda-text transition-colors hover:bg-gameda-sage/40"
              >
                Meu perfil
              </Link>
            ) : profileHref === null ? (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-gameda-primary transition-colors hover:bg-gameda-sage/40"
              >
                Entrar
              </Link>
            ) : (
              <div className="h-9 animate-pulse rounded-xl bg-gameda-sage/40" />
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
