import { User, Gamepad2, Users, Clock, Star, Settings, Shield } from "lucide-react";

// O Next.js (App Router) passa os parâmetros da rota através das props (params)
interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Aguardamos os parâmetros (boa prática no Next.js App Router)
  const resolvedParams = await params;
  const username = resolvedParams.username;

  // Simulamos a busca de dados com base no username recebido na URL
  // No futuro, isto virá do banco de dados pesquisando por `username`
  const profile = {
    name: username === "mariana" ? "Mariana Souza" : `Utilizador (@${username})`,
    username: `@${username}`,
    bio: "Amante de RPGs, roguelikes e trilhas sonoras marcantes. Jogando atualmente no PC e Switch.",
    joinedDate: "Membro desde Outubro de 2024",
    stats: {
      gamesCompleted: 42,
      totalHours: "480h",
      following: 28,
      followers: 45,
    },
    recentActivity: [
      {
        id: 1,
        game: "Hades II",
        platform: "PC",
        action: "registrou uma sessão de 2h 30m",
        date: "Há 2 horas",
        comment: "Finalmente consegui derrotar o chefe final da superfície!"
      },
      {
        id: 2,
        game: "Elden Ring",
        platform: "PlayStation 5",
        action: "marcou como Zerado",
        date: "Há 3 dias",
        comment: "Jogaço monumental. Valeu cada minuto."
      }
    ]
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Cabeçalho do Perfil / Informações do Utilizador */}
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Simulado */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#66836A]/20 flex items-center justify-center font-bold text-[#66836A] text-3xl border-2 border-[#66836A]/30">
              {profile.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#343A35]">
                {profile.name}
              </h1>
              <p className="text-sm font-medium text-[#66836A]">{profile.username}</p>
              <p className="text-xs text-[#343A35]/70 pt-1">{profile.joinedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#E9E3D5] hover:bg-[#343A35]/10 text-[#343A35] px-4 py-2.5 rounded-xl font-medium transition-colors border border-[#343A35]/10 text-sm">
              <Settings className="w-4 h-4 text-[#66836A]" />
              Editar Perfil
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#343A35]/90 max-w-2xl">
          {profile.bio}
        </p>

        {/* Estatísticas Rápidas do Perfil */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#343A35]/10">
          <div className="bg-[#E9E3D5] p-3.5 rounded-xl text-center border border-[#343A35]/5">
            <span className="text-xl font-bold text-[#343A35] block">{profile.stats.gamesCompleted}</span>
            <span className="text-xs text-[#343A35]/70 font-medium">Jogos Zerados</span>
          </div>
          <div className="bg-[#E9E3D5] p-3.5 rounded-xl text-center border border-[#343A35]/5">
            <span className="text-xl font-bold text-[#343A35] block">{profile.stats.totalHours}</span>
            <span className="text-xs text-[#343A35]/70 font-medium">Horas Registradas</span>
          </div>
          <div className="bg-[#E9E3D5] p-3.5 rounded-xl text-center border border-[#343A35]/5">
            <span className="text-xl font-bold text-[#343A35] block">{profile.stats.following}</span>
            <span className="text-xs text-[#343A35]/70 font-medium">Seguindo</span>
          </div>
          <div className="bg-[#E9E3D5] p-3.5 rounded-xl text-center border border-[#343A35]/5">
            <span className="text-xl font-bold text-[#343A35] block">{profile.stats.followers}</span>
            <span className="text-xs text-[#343A35]/70 font-medium">Seguidores</span>
          </div>
        </div>
      </div>

      {/* Seções Inferiores: Atividades Recentes e Atalho para Biblioteca Pública */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Atividades Recentes do Utilizador */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#343A35] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#66836A]" />
            Atividades Recentes
          </h2>

          <div className="space-y-4">
            {profile.recentActivity.map((activity) => (
              <div key={activity.id} className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#343A35]/70">
                  <span className="font-semibold text-[#66836A] bg-[#66836A]/10 px-2 py-0.5 rounded">
                    {activity.platform}
                  </span>
                  <span>{activity.date}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[#343A35] text-base">
                    {activity.game} — <span className="font-normal text-sm text-[#343A35]/80">{activity.action}</span>
                  </h3>
                  <p className="text-sm text-[#343A35]/90 italic pt-1">
                    &quot;{activity.comment}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações Públicas / Atalhos */}
        <div className="space-y-6">
          <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#343A35] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#66836A]" />
              Privacidade & Status
            </h2>
            <p className="text-xs text-[#343A35]/80 leading-relaxed">
              O perfil de <strong className="text-[#66836A]">{profile.name}</strong> está configurado como <strong className="text-[#66836A]">Público</strong> por padrão[cite: 3], permitindo que outros utilizadores vejam a biblioteca e sessões.
            </p>
            <div className="pt-2">
              <a 
                href="/library" 
                className="block w-full text-center bg-[#66836A] hover:bg-[#263A30] text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                Ver Biblioteca Completa
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}