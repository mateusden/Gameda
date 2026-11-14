import { PlusCircle, Clock, Star, Calendar, Building2, Tag, MessageSquare, Heart } from "lucide-react";

export default function GameDetailPage() {
  // Dados fictícios para simular um jogo do catálogo/biblioteca
  const game = {
    title: "Hades II",
    developer: "Supergiant Games",
    genre: "Roguelike / Ação",
    platforms: ["PC", "PlayStation 5"],
    releaseYear: 2024,
    description: "Assuma o papel da Princesa do Submundo e explore um mito maior, enfrentando o Titã do Tempo com o poder total do Olimpo nesta sequência eletrizante e cheia de ação do aprimorado roguelike original.",
    // Informações pessoais do utilizador (simulando que o utilizador já adicionou)
    userStatus: "Jogando",
    totalHours: "35h 30m",
    sessions: [
      { id: 1, platform: "PC", date: "Ontem", duration: "2h 30m", comment: "Cheguei finalmente ao chefe do Oceano!" },
      { id: 2, platform: "PC", date: "Há 3 dias", duration: "3h 00m", comment: "Desbloqueuei novas armas e feitiços." },
    ],
    reviews: [
      {
        id: 1,
        author: "Mariana Souza",
        date: "12 de Outubro, 2024",
        rating: 5,
        hoursAtReview: "30h",
        content: "A Supergiant conseguiu superar o primeiro jogo em todos os aspetos. A jogabilidade da Melinoë é fluida e a banda sonora é simplesmente impecável.",
      }
    ]
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Seção Superior: Informações Gerais do Jogo */}
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        {/* Capa Simulada */}
        <div className="w-full md:w-56 h-72 bg-[#66836A]/20 rounded-xl flex items-center justify-center text-sm text-[#343A35]/60 font-semibold shrink-0 border border-[#343A35]/10">
          Capa do Jogo
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {game.platforms.map((platform, idx) => (
                <span key={idx} className="text-xs font-semibold bg-[#66836A]/10 text-[#66836A] px-2.5 py-0.5 rounded-md">
                  {platform}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#343A35] pt-1">
              {game.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#343A35]/80">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#66836A]" />
              <span><strong>Desenvolvedora:</strong> {game.developer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#66836A]" />
              <span><strong>Género:</strong> {game.genre}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#66836A]" />
              <span><strong>Lançamento:</strong> {game.releaseYear}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#343A35]/90 leading-relaxed pt-2">
            {game.description}
          </p>

          {/* Botão de Biblioteca (Informação Pessoal) */}
          <div className="pt-4 border-t border-[#343A35]/10 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-[#E9E3D5] px-4 py-2.5 rounded-xl border border-[#343A35]/10">
              <span className="text-xs text-[#343A35]/70">Status na Biblioteca:</span>
              <span className="text-sm font-bold text-[#66836A]">{game.userStatus}</span>
            </div>
            
            <button className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
              <PlusCircle className="w-5 h-5" />
              Registrar Sessão
            </button>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Informações Pessoais (Sessões e Resenhas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Histórico de Sessões do Utilizador */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#66836A]" />
              Meu Histórico de Sessões ({game.totalHours} totais)
            </h2>
          </div>

          <div className="space-y-3">
            {game.sessions.map((session) => (
              <div key={session.id} className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#343A35]/70">
                  <span className="font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded">
                    {session.platform}
                  </span>
                  <span>{session.date} • Duração: <strong>{session.duration}</strong></span>
                </div>
                <p className="text-sm text-[#343A35]/90 italic">
                  &quot;{session.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Resenhas Publicadas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#343A35] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#66836A]" />
              Resenhas
            </h2>
          </div>

          <div className="space-y-4">
            {game.reviews.map((review) => (
              <div key={review.id} className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#343A35] text-sm">{review.author}</span>
                  <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" /> {review.rating}.0
                  </div>
                </div>
                <div className="text-xs text-[#343A35]/70">
                  {review.date} • {review.hoursAtReview} jogadas
                </div>
                <p className="text-sm text-[#343A35]/90 leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}