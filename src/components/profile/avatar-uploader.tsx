"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

const MAX_ORIGINAL_BYTES = 8 * 1024 * 1024;
const BUCKET_MARKER = "/storage/v1/object/public/avatars/";

// Recorta o centro em quadrado e reduz
async function toSquare(file: File, size = 256): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");

  context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao converter"))),
      "image/webp",
      0.85
    )
  );
}

// Só apaga arquivos que estão no nosso armazenamento (não fotos do Google, por exemplo)
function storagePathFromUrl(url: string | null) {
  if (!url) return null;
  const index = url.indexOf(BUCKET_MARKER);
  return index === -1 ? null : decodeURIComponent(url.slice(index + BUCKET_MARKER.length));
}

interface AvatarUploaderProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

export default function AvatarUploader({ userId, username, avatarUrl }: AvatarUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(avatarUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = (url: string | null) => {
    setCurrent(url);
    window.dispatchEvent(new CustomEvent("profile-updated", { detail: { avatarUrl: url } }));
    router.refresh();
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setError("A imagem é muito grande. Use uma de até 8 MB.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const blob = await toSquare(file);
      const extension = blob.type === "image/png" ? "png" : "webp";
      const path = `${userId}/${Date.now()}.${extension}`;
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);
      if (updateError) throw updateError;

      const oldPath = storagePathFromUrl(current);
      if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);

      finish(data.publicUrl);
    } catch {
      setError("Não foi possível enviar a foto. Tente outra imagem.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);
      if (updateError) throw updateError;

      const oldPath = storagePathFromUrl(current);
      if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);

      finish(null);
    } catch {
      setError("Não foi possível remover a foto.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <Avatar
        src={current}
        name={username}
        className="w-20 h-20 text-3xl border-2 border-[#66836A]/30"
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-2 bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            {busy ? "Enviando..." : "Trocar foto"}
          </button>

          {current && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#343A35] hover:bg-[#343A35]/10 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-[#A9574D]" />
              Remover
            </button>
          )}
        </div>

        <p className="text-xs text-[#343A35]/60">JPG, PNG ou WebP. Ela é recortada em quadrado.</p>
        {error && (
          <p role="alert" className="text-sm text-[#A9574D] font-medium">
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}