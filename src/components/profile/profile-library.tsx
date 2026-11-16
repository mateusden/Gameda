"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import SlugCover from "@/components/ui/slug-cover";
import { statusTabs, type GameStatus, type LibraryGame } from "@/lib/mock-games";

export default function ProfileLibrary({ games }: { games: LibraryGame[] }) {
  const [activeTab, setActiveTab] = useState<GameStatus>("Jogando");

  const filtered = games.filter((game) => game.status === activeTab);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const count = games.filter((g) => g.status === tab).length;
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-[#66836A] text-white shadow-sm"
                  : "bg-[#F3EFE6] text-[#343A35] hover:bg-[#343A35]/10 border border-[#343A35]/10"
              }`}
            >
              {tab}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#343A35]/10 text-[#343A35]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
          {filtered.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-3 shadow-sm hover:border-[#66836A]/50 hover:shadow-md transition-all duration-200 flex gap-3 items-center group"
            >
              <SlugCover slug={game.slug} title={game.title} className="w-14 h-20 text-base" />
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-bold text-[#343A35] leading-tight group-hover:text-[#66836A] transition-colors truncate">
                  {game.title}
                </h3>
                <span className="inline-block text-xs font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded-md">
                  {game.platform}
                </span>
                <div className="flex items-center gap-3 text-xs text-[#343A35]/70">
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
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20">
          <p className="text-[#343A35]/70 text-sm">
            Nenhum jogo com o status &quot;{activeTab}&quot;.
          </p>
        </div>
      )}
    </div>
  );
}