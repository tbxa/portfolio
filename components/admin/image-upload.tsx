"use client";

import { CameraIcon, ImageUpIcon, Loader2Icon, MonitorIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { captureScreenshot } from "@/lib/actions/screenshot";
import { ACCEPTED_IMAGE_TYPES, storageUrl } from "@/lib/storage";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

/**
 * Área de imagem única: arrastar/soltar, clicar para escolher ou gerar
 * screenshot a partir da URL do site. Mostra a pré-visualização na hora.
 */
export function ImageUpload({
  id,
  value,
  onChange,
  folder,
  aspect = "aspect-[16/10]",
  screenshotUrl,
  label = "Imagem",
  className,
}: {
  id: string;
  value: string | null;
  onChange: (path: string | null) => void;
  folder: string;
  aspect?: string;
  /** Quando definido, mostra o botão "Gerar screenshot". */
  screenshotUrl?: string;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "upload" | "desktop">(null);
  const [dragging, setDragging] = useState(false);
  const preview = storageUrl(value);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    try {
      onChange(await uploadImage(file, folder));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function capture(device: "desktop") {
    if (!screenshotUrl) {
      toast.error("Informe a URL do site primeiro.");
      return;
    }
    setBusy(device);
    const toastId = toast.loading("Gerando screenshot… isso pode levar alguns segundos.");
    try {
      const result = await captureScreenshot({ url: screenshotUrl, device });
      if (!result.ok) throw new Error(result.error);
      onChange(result.data.path);
      toast.success("Screenshot gerado. Você pode substituí-lo por uma imagem manual.", { id: toastId });
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed bg-muted/40 transition-colors",
          aspect,
          dragging && "border-brand bg-brand/5"
        )}
      >
        {preview ? (
          <Image src={preview} alt={`Pré-visualização: ${label}`} fill sizes="480px" className="object-cover object-top" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ImageUpIcon className="size-6" aria-hidden="true" />
            <span>
              <span className="font-medium text-foreground">Clique para enviar</span> ou arraste uma imagem
            </span>
            <span className="text-xs">PNG, JPG, WebP ou AVIF · até 8 MB</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Loader2Icon className="size-6 animate-spin" aria-label="Processando" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
        aria-label={label}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={() => inputRef.current?.click()}>
          <ImageUpIcon data-icon="inline-start" />
          {preview ? "Substituir" : "Enviar imagem"}
        </Button>
        {screenshotUrl !== undefined && (
          <Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={() => capture("desktop")}>
            {busy === "desktop" ? <Loader2Icon className="animate-spin" /> : <CameraIcon data-icon="inline-start" />}
            Gerar screenshot
            <MonitorIcon className="opacity-60" aria-hidden="true" />
          </Button>
        )}
        {preview && (
          <Button type="button" variant="ghost" size="sm" disabled={!!busy} onClick={() => onChange(null)}>
            <Trash2Icon data-icon="inline-start" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
