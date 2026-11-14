import Link from "next/link";
import { Search, Bell, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-[#D8D1C3] bg-[#E9E3D5]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link href="/" className="text-3xl font-bold tracking-tight text-[#343A35]">
          gameda
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-[#66836A]">
            Início
          </Link>

          <Link href="/library" className="text-sm text-[#343A35] hover:text-[#66836A]">
            Biblioteca
          </Link>

          <Link href="/explore" className="text-sm text-[#343A35] hover:text-[#66836A]">
            Explorar
          </Link>
        </nav>

        <div className="flex items-center gap-5 text-[#343A35]">
          <button aria-label="Pesquisar" className="cursor-pointer hover:text-[#66836A] transition-colors">
            <Search size={21} />
          </button>

          <button aria-label="Notificações" className="cursor-pointer hover:text-[#66836A] transition-colors">
            <Bell size={21} />
          </button>

          {/* Perfil agora redireciona para a rota dinâmica do utilizador */}
          <Link href="/profile/mariana" aria-label="Perfil" className="cursor-pointer hover:text-[#66836A] transition-colors flex items-center">
            <UserCircle size={23} />
          </Link>
        </div>

      </div>
    </header>
  );
}