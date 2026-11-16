import Image from "next/image";

const palettes = [
  "bg-linear-to-br from-[#66836A] to-[#263A30]",
  "bg-linear-to-br from-[#343A35] to-[#5A635B]",
  "bg-linear-to-br from-[#A9574D] to-[#6E342D]",
  "bg-linear-to-br from-[#263A30] to-[#66836A]",
];

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface GameCoverProps {
  title: string;
  coverUrl?: string | null;
  className?: string; // controla tamanho: ex. "w-16 h-20"
}

export default function GameCover({ title, coverUrl, className = "w-16 h-20" }: GameCoverProps) {
  if (coverUrl) {
    return (
      <div
        className={`${className} relative shrink-0 overflow-hidden rounded-lg bg-[#343A35]/10 shadow-sm`}
      >
        <Image
          src={coverUrl}
          alt={`Capa de ${title}`}
          fill
          sizes="(max-width: 768px) 96px, 224px"
          className="object-cover"
        />
      </div>
    );
  }

  const palette = palettes[hash(title) % palettes.length];
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      role="img"
      aria-label={`Capa de ${title}`}
      className={`${palette} ${className} shrink-0 rounded-lg flex items-center justify-center text-[#F3EFE6] font-bold tracking-tight shadow-sm select-none`}
    >
      {initials}
    </div>
  );
}