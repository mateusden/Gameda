"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">Algo deu errado</h1>
      <p className="text-sm text-[#343A35]/70">
        Tivemos um problema ao carregar esta página. Tente de novo em instantes.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-[#66836A] hover:bg-[#263A30] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors"
        >
          Ir para o início
        </Link>
      </div>
    </div>
  );
}