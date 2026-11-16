"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, UserCircle } from "lucide-react";
import GameCover from "@/components/ui/game-cover";
import { useGameSearch } from "@/hooks/use-game-search";
import UserMenu from "@/components/layout/user-menu";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/library", label: "Biblioteca" },
  { href: "/explore", label: "Explorar" },
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

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onOpenChange(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  const toggle = () => {
    if (open) {
      close();
    } else {
      onOpenChange(true);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(results[0] ? `/game/${results[0].slug}` : "/explore");
    close();
  };

  return (
    <div ref={boxRef} className="relative">
      {/* A lupa fica à esquerda; a barra cresce para a direita e empurra a lupa */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center rounded-full border py-1.5 transition-all duration-300 ${open
            ? "border-[#343A35]/10 bg-[#F3EFE6] px-3"
            : "border-transparent px-0"
          }`}
      >
        <button
          type="button"
          aria-label={open ? "Fechar pesquisa" : "Pesquisar"}
          aria-expanded={open}
          onClick={toggle}
          className="flex cursor-pointer items-center transition-colors hover:text-[#66836A]"
        >
          <Search size={22} />
        </button>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && close()}
          tabIndex={open ? 0 : -1}
          placeholder="Buscar jogos..."
          aria-label="Buscar jogos"
          className={`bg-transparent text-sm text-[#343A35] placeholder:text-[#343A35]/50 outline-none transition-all duration-300 ${open ? "ml-2 w-28 opacity-100 sm:w-40 lg:w-48" : "ml-0 w-0 opacity-0"
            }`}
        />
      </form>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#343A35]/10 bg-[#F3EFE6] shadow-lg animate-fadeIn">
          {!hasQuery && (
            <p className="px-4 py-3 text-xs text-[#343A35]/70">
              Comece a digitar para ver os jogos do catálogo.
            </p>
          )}

          {hasQuery && results.length > 0 && (
            <ul className="p-1.5">
              {results.map((game) => (
                <li key={game.slug}>
                  <Link
                    href={`/game/${game.slug}`}
                    onClick={close}
                    className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#E9E3D5]/70"
                  >
                    <GameCover title={game.title} coverUrl={game.coverUrl} className="h-12 w-9 text-xs" />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#343A35] transition-colors group-hover:text-[#66836A]">
                        {game.title}
                      </span>
                      <span className="block truncate text-xs text-[#343A35]/60">
                        {game.genre}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasQuery && loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-[#343A35]/70">Buscando...</p>
          )}

          {hasQuery && !loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-[#343A35]/70">
              Nenhum jogo encontrado para &quot;{query.trim()}&quot;.
            </p>
          )}

          <Link
            href="/explore"
            onClick={close}
            className="block border-t border-[#343A35]/10 px-4 py-2.5 text-xs font-medium text-[#66836A] transition-colors hover:bg-[#E9E3D5]/70"
          >
            Ver tudo em Explorar &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `text-sm transition-colors ${isActive(href)
      ? "font-semibold text-[#66836A]"
      : "font-medium text-[#343A35] hover:text-[#66836A]"
    }`;

  // No celular, esconde os outros ícones enquanto a busca está aberta, para caber
  const hideOnMobileWhenSearching = searchOpen ? "hidden lg:flex" : "flex";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8D1C3] bg-[#E9E3D5]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="logo text-3xl tracking-tight text-[#343A35] sm:text-4xl"
        >
          gameda
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
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

        <div className="flex items-center gap-3 text-[#343A35] sm:gap-4 md:justify-end">
          <SearchBox open={searchOpen} onOpenChange={setSearchOpen} />

          <button
            aria-label="Notificações"
            className={`${hideOnMobileWhenSearching} cursor-pointer items-center transition-colors hover:text-[#66836A]`}
          >
            <Bell size={22} />
          </button>

          <UserMenu className={hideOnMobileWhenSearching} />
        </div>
      </div>

      <nav
        className="flex items-center justify-around border-t border-[#D8D1C3] px-4 py-2 md:hidden"
        aria-label="Principal (mobile)"
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
    </header>
  );
}