import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-4">
      <p className="text-5xl font-bold text-[#66836A]">404</p>
      <h1 className="text-2xl font-bold tracking-tight text-[#343A35]">Página não encontrada</h1>
      <p className="text-sm text-[#343A35]/70">
        Esse endereço não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="inline-block bg-[#66836A] hover:bg-[#263A30] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
      >
        Voltar para o início
      </Link>
    </div>
  );
}