"use client";

import { ImagePlusIcon, Loader2Icon, MonitorIcon, SmartphoneIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { NativeSelect } from "@/components/admin/field";
import { DragHandle, SortableItem, SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureScreenshot } from "@/lib/actions/screenshot";
import { ACCEPTED_IMAGE_TYPES, storageUrl } from "@/lib/storage";
import { uploadImage } from "@/lib/upload";
import type { ImageKind } from "@/types";

export interface GalleryItem {
  /** id do banco (imagens já salvas) ou chave temporária (novas). */
  key: string;
  id?: string;
  path: string;
  alt: string;
  kind: ImageKind;
}

export function GalleryManager({
  value,
  onChange,
  screenshotUrl,
}: {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  screenshotUrl: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "upload" | ImageKind>(null);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy("upload");
    const added: GalleryItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const path = await uploadImage(file, "projects");
        added.push({ key: crypto.randomUUID(), path, alt: "", kind: "desktop" });
      } catch (error) {
        toast.error(`${file.name}: ${(error as Error).message}`);
      }
    }
    onChange([...value, ...added]);
    setBusy(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function capture(device: "desktop" | "mobile") {
    if (!screenshotUrl) {
      toast.error("Informe a URL do site primeiro.");
      return;
    }
    setBusy(device);
    const toastId = toast.loading(`Capturando versão ${device === "mobile" ? "mobile" : "desktop"}…`);
    const result = await captureScreenshot({ url: screenshotUrl, device });
    setBusy(null);
    if (!result.ok) {
      toast.error(result.error, { id: toastId });
      return;
    }
    toast.success("Captura adicionada à galeria.", { id: toastId });
    onChange([...value, { key: crypto.randomUUID(), path: result.data.path, alt: "", kind: device }]);
  }

  function update(key: string, patch: Partial<GalleryItem>) {
    onChange(value.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <SortableList
          items={value.map((v) => ({ ...v, id: v.key }))}
          onReorder={(items) => onChange(items.map(({ id: _key, ...rest }) => ({ ...rest, id: value.find((v) => v.key === rest.key)?.id })))}
          className="space-y-2"
          renderItem={(item) => (
            <SortableItem key={item.key} id={item.key} className="flex items-center gap-3 rounded-lg border bg-background p-2">
              <DragHandle label="Reordenar imagem" />
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image src={storageUrl(item.path)!} alt="" fill sizes="80px" className="object-cover object-top" />
              </div>
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_8rem]">
                <Input
                  value={item.alt}
                  onChange={(e) => update(item.key, { alt: e.target.value })}
                  placeholder="Descrição da imagem (acessibilidade)"
                  aria-label="Descrição da imagem"
                  className="h-8"
                />
                <NativeSelect
                  value={item.kind}
                  onChange={(e) => update(item.key, { kind: e.target.value as ImageKind })}
                  aria-label="Tipo de visualização"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="other">Outra</option>
                </NativeSelect>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onChange(value.filter((v) => v.key !== item.key))}
                aria-label="Remover imagem"
              >
                <Trash2Icon />
              </Button>
            </SortableItem>
          )}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => void addFiles(e.target.files)}
        aria-label="Adicionar imagens à galeria"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={() => inputRef.current?.click()}>
          {busy === "upload" ? <Loader2Icon className="animate-spin" /> : <ImagePlusIcon data-icon="inline-start" />}
          Adicionar imagens
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={!!busy} onClick={() => capture("desktop")}>
          {busy === "desktop" ? <Loader2Icon className="animate-spin" /> : <MonitorIcon data-icon="inline-start" />}
          Capturar desktop
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={!!busy} onClick={() => capture("mobile")}>
          {busy === "mobile" ? <Loader2Icon className="animate-spin" /> : <SmartphoneIcon data-icon="inline-start" />}
          Capturar mobile
        </Button>
      </div>
    </div>
  );
}
