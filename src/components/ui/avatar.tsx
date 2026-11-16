import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string; // tamanho: ex. "w-10 h-10 text-base"
}

export default function Avatar({ src, name, className = "w-10 h-10 text-base" }: AvatarProps) {
  if (src) {
    return (
      <div className={`${className} relative shrink-0 overflow-hidden rounded-full bg-[#66836A]/20`}>
        <Image src={src} alt={`Foto de ${name}`} fill sizes="96px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`${className} shrink-0 rounded-full bg-[#66836A]/20 flex items-center justify-center font-bold text-[#66836A]`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}