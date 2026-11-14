import { PlusCircle, Gamepad2, Users, Star, Clock, MessageSquare, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 pb-12">
      {/* Seção de Boas-vindas e Banner para Adicionar Jogos */}
      <section className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">
            Bem-vindo de volta ao Gameda! 🎮
          </h1>
          <p className="text-[#343A35]/80 max-w-xl text-sm sm:text-base">
            Organize sua biblioteca, registre suas sessões de jogatina e veja o que seus amigos estão jogando hoje.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-sm shrink-0">
          <PlusCircle className="w-5 h-5" />
          Adicionar à Biblioteca
        </button>
      </section>

      {/* Grid Principal: Feed e Barra Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Principal: Feed de Atividades */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#66836A]" />
              Atividades dos Amigos
            </h2>
          </div>

          {/* Card de Exemplo no Feed */}
          <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#66836A]/20 flex items-center justify-center font-bold text-[#66836A]">
                  M
                </div>
                <div>
                  <span className="font-semibold text-[#343A35] block">Mariana Souza</span>
                  <span className="text-xs text-[#343A35]/70">registrou uma sessão há 2 horas</span>
                </div>
              </div>
              <span className="text-xs bg-[#66836A]/10 text-[#66836A] font-semibold px-2.5 py-1 rounded-full">
                PC
              </span>
            </div>

            <div className="bg-[#E9E3D5] rounded-lg p-4 flex gap-4 items-center border border-[#343A35]/5">
              <div className="w-16 h-20 bg-[#343A35]/10 rounded-md flex items-center justify-center text-xs text-[#343A35]/60 font-medium shrink-0">
                Capa
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#343A35] text-lg">Hades II</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#343A35]/80">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#66836A]" /> 2h 30m</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-600 fill-amber-600" /> Zerado</span>
                </div>
                <p className="text-sm text-[#343A35]/90 italic pt-1">
                  &quot;Finalmente consegui derrotar o chefe final da superfície! Que trilha sonora espetacular.&quot;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#343A35]/70 pt-2 border-t border-[#343A35]/10">
              <button className="hover:text-[#66836A] transition-colors flex items-center gap-1.5 font-medium">
                <Heart className="w-4 h-4" /> Curtir
              </button>
              <button className="hover:text-[#66836A] transition-colors flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-4 h-4" /> Comentar
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Recomendações */}
        <div className="space-y-6">
          <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#343A35] flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#66836A]" />
              Recomendações
            </h2>
            <div className="space-y-2">
              {[
                { name: "Elden Ring", genre: "RPG de Ação" },
                { name: "Silksong", genre: "Metroidvania" },
                { name: "Balatro", genre: "Roguelike" }
              ].map((jogo, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 hover:bg-[#E9E3D5]/60 rounded-lg transition-colors cursor-pointer group">
                  <div>
                    <span className="font-medium text-[#343A35] text-sm block group-hover:text-[#66836A] transition-colors">{jogo.name}</span>
                    <span className="text-xs text-[#343A35]/60">{jogo.genre}</span>
                  </div>
                  <span className="text-xs text-[#66836A] font-semibold bg-[#66836A]/10 px-2 py-1 rounded-md">Ver</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}