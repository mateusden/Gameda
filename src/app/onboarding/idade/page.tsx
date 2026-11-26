"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveBirthDate } from "@/app/actions/age";
import { brToIso, isOldEnough, maskDate, MIN_AGE } from "@/lib/age";

function AgeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/";
  // Só aceita caminhos do próprio site
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const iso = brToIso(date);
    if (!iso) {
      setError("Data inválida. Use dia/mês/ano, por exemplo 15/11/2000.");
      return;
    }
    if (!isOldEnough(iso)) {
      setError(`O Gameda é para maiores de ${MIN_AGE} anos.`);
      return;
    }

    startTransition(async () => {
      const result = await saveBirthDate(iso);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(next);
      router.refresh();
    });
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">
            Só mais uma coisa
          </h1>
          <p className="text-sm text-[#343A35]/70">
            O Gameda é para maiores de {MIN_AGE} anos. Informe sua data de nascimento para
            continuar. Ela não aparece no seu perfil nem é usada para anúncios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#343A35]">Data de nascimento</span>
            <input
              type="text"
              inputMode="numeric"
              required
              value={date}
              onChange={(e) => setDate(maskDate(e.target.value))}
              placeholder="dd/mm/aaaa"
              maxLength={10}
              className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2.5 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none transition-colors"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-[#A9574D] font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#66836A] hover:bg-[#263A30] active:scale-95 disabled:opacity-60 text-white py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
          >
            {pending ? "Salvando..." : "Continuar"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full text-sm text-[#343A35]/70 hover:text-[#A9574D] transition-colors cursor-pointer"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default function AgePage() {
  return (
    <Suspense fallback={null}>
      <AgeForm />
    </Suspense>
  );
}