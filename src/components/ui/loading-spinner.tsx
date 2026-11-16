export default function LoadingSpinner({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="w-8 h-8 border-4 border-[#343A35]/10 border-t-[#66836A] rounded-full animate-spin"></div>
      <p className="text-sm text-[#343A35]/70 font-medium">{text}</p>
    </div>
  );
}