import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProfileLibrary from "@/components/profile/profile-library";
import { createClient } from "@/lib/supabase/server";
import { formatHours, loadLibrary } from "@/lib/library";

async function LibraryContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  if (!userId) redirect("/login");

  const { games, totalMinutes } = await loadLibrary(supabase, userId);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#343A35]/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">Minha Biblioteca</h1>
          <p className="text-[#343A35]/80 text-sm sm:text-base mt-1">
            {games.length} {games.length === 1 ? "jogo" : "jogos"} • {formatHours(totalMinutes)} registradas
          </p>
        </div>
        <Link
          href="/explore"
          className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] active:scale-95 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar jogo
        </Link>
      </div>

      <ProfileLibrary games={games} />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando biblioteca..." />}>
      <LibraryContent />
    </Suspense>
  );
}