"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PlusCircle, Clock, Star } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

type GameStatus = "Jogando" | "Quero jogar" | "Zerado" | "Pausado";

interface Game {
  id: number;
  slug: string; // Adicionado slug para a rota dinâmica
  title: string;
  platform: string;
  hours: string;
  status: GameStatus;
  coverColor: string;
}

const initialGames: Game[] = [
  { id: 1, slug: "hades-ii", title: "Hades II", platform: "PC", hours: "35h", status: "Jogando", coverColor: "bg-[#66836A]/20" },
  { id: 2, slug: "elden-ring", title: "Elden Ring", platform: "PlayStation 5", hours: "120h", status: "Zerado", coverColor: "bg-[#343A35]/25" },
  { id: 3, slug: "silksong", title: "Silksong", platform: "PC", hours: "0h", status: "Quero jogar", coverColor: "bg-[#A9574D]/20" },
  { id: 4, slug: "balatro", title: "Balatro", platform: "Nintendo Switch", hours: "18h", status: "Pausado", coverColor: "bg-[#66836A]/30" },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<GameStatus>("Jogando");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: GameStatus) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const filteredGames = initialGames.filter((game) => game.status === activeTab);
  const tabs: GameStatus[] = ["Jogando", "Quero jogar", "Zerado", "Pausado"];

  return (
    <div className="space-y-8 pb-12 transition-all duration-300">
      {/* Cabeçalho da Biblioteca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#343A35]/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">Minha Biblioteca</h1>
          <p className="text-[#343A35]/80 text-sm sm:text-base mt-1">
            Gerencie seus jogos, acompanhe horas e organize seu progresso por status.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm self-start sm:self-auto cursor-pointer">
          <PlusCircle className="w-5 h-5" />
          Adicionar Jogo
        </button>
      </div>

      {/* Abas de Navegação de Status */}
      <div className="flex flex-wrap gap-2 border-b border-[#343A35]/10 pb-4">
        {tabs.map((tab) => {
          const count = initialGames.filter((g) => g.status === tab).length;
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-[#66836A] text-white shadow-sm"
                  : "bg-[#F3EFE6] text-[#343A35] hover:bg-[#343A35]/10 border border-[#343A35]/10"
              }`}
            >
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-[#343A35]/10 text-[#343A35]"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo Dinâmico */}
      {isPending ? (
        <LoadingSpinner text="A atualizar biblioteca..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.slug}`}
                className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm hover:border-[#66836A]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex gap-4 items-start">
                  <div className={`w-20 h-28 ${game.coverColor} rounded-lg flex items-center justify-center text-xs text-[#343A35]/60 font-medium shrink-0 border border-[#343A35]/10`}>
                    Capa
                  </div>
                  
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded-md">
                      {game.platform}
                    </span>
                    <h3 className="font-bold text-[#343A35] text-lg leading-tight group-hover:text-[#66836A] transition-colors">{game.title}</h3>
                    
                    <div className="pt-2 flex items-center gap-3 text-xs text-[#343A35]/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#66836A]" /> {game.hours}
                      </span>
                      {game.status === "Zerado" && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" /> Zerado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#343A35]/10 flex justify-end">
                  <span className="text-xs text-[#343A35]/70 group-hover:text-[#66836A] font-medium transition-colors">
                    Ver detalhes &rarr;
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20">
              <p className="text-[#343A35]/70 text-sm">Nenhum jogo encontrado com o status &quot;{activeTab}&quot;.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}