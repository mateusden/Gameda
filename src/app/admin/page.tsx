import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import RequestActions from "@/components/admin/request-actions";
import { createClient } from "@/lib/supabase/server";

interface RequestRow {
  id: number;
  requested_by: string;
  title: string;
  platform: string | null;
  notes: string | null;
  status: "pendente" | "aprovado" | "rejeitado";
  igdb_slug: string | null;
  admin_note: string | null;
  created_at: string;
}

const statusStyle: Record<RequestRow["status"], string> = {
  pendente: "bg-amber-600/10 text-amber-700",
  aprovado: "bg-[#66836A]/10 text-[#66836A]",
  rejeitado: "bg-[#A9574D]/10 text-[#A9574D]",
};

async function AdminContent() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) notFound();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) notFound();

  const [pendingRes, doneRes] = await Promise.all([
    supabase
      .from("game_requests")
      .select("id, requested_by, title, platform, notes, status, igdb_slug, admin_note, created_at")
      .eq("status", "pendente")
      .order("created_at", { ascending: true }),
    supabase
      .from("game_requests")
      .select("id, requested_by, title, platform, notes, status, igdb_slug, admin_note, created_at")
      .neq("status", "pendente")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const pending = (pendingRes.data ?? []) as RequestRow[];
  const done = (doneRes.data ?? []) as RequestRow[];

  const userIds = [...new Set([...pending, ...done].map((r) => r.requested_by))];
  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("id, username").in("id", userIds)
    : { data: [] };
  const usernameOf = new Map(
    (profilesData ?? []).map((p) => [p.id as string, p.username as string])
  );

  const who = (id: string) => {
    const username = usernameOf.get(id);
    return username ? (
      <Link href={`/profile/${username}`} className="font-semibold hover:text-[#66836A]">
        @{username}
      </Link>
    ) : (
      <span className="font-semibold">Usuário</span>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">Pedidos de inclusão</h1>
        <p className="mt-1 text-sm text-[#343A35]/70">
          Procure o jogo na IGDB, copie o slug (o trecho final da URL em igdb.com/games/…) e aprove.
          Se não achar ou for duplicado, recuse com uma observação.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#343A35]">Pendentes ({pending.length})</h2>

        {pending.length === 0 ? (
          <div className="py-8 text-center bg-[#F3EFE6] rounded-xl border border-dashed border-[#343A35]/20 text-sm text-[#343A35]/70">
            Nenhum pedido pendente.
          </div>
        ) : (
          pending.map((request) => (
            <div
              key={request.id}
              className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl p-5 space-y-4 shadow-sm"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#343A35] break-words">{request.title}</h3>
                <p className="text-xs text-[#343A35]/70">
                  {who(request.requested_by)} •{" "}
                  {new Date(request.created_at).toLocaleDateString("pt-BR")}
                  {request.platform && ` • ${request.platform}`}
                </p>
                {request.notes && (
                  <p className="text-sm text-[#343A35]/90 whitespace-pre-line break-words pt-1">
                    {request.notes}
                  </p>
                )}
              </div>
              <RequestActions requestId={request.id} />
            </div>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#343A35]">Últimos analisados</h2>

        {done.length === 0 ? (
          <p className="text-sm text-[#343A35]/70">Nada analisado ainda.</p>
        ) : (
          <div className="space-y-2">
            {done.map((request) => (
              <div
                key={request.id}
                className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-semibold text-[#343A35] break-words">{request.title}</p>
                  <p className="text-xs text-[#343A35]/70">
                    {who(request.requested_by)}
                    {request.igdb_slug && (
                      <>
                        {" "}
                        •{" "}
                        <Link
                          href={`/game/${request.igdb_slug}`}
                          className="text-[#66836A] hover:text-[#263A30]"
                        >
                          /game/{request.igdb_slug}
                        </Link>
                      </>
                    )}
                    {request.admin_note && ` • ${request.admin_note}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[request.status]}`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando pedidos..." />}>
      <AdminContent />
    </Suspense>
  );
}