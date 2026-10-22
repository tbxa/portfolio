"use client";

import { ChevronLeftIcon, ChevronRightIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { ImageKind, ProjectImage } from "@/types";

const LABELS: Record<ImageKind | "all", string> = {
  all: "Todas",
  desktop: "Desktop",
  mobile: "Mobile",
  other: "Outras",
};

export function ProjectGallery({ images, projectName }: { images: ProjectImage[]; projectName: string }) {
  const kinds = (["desktop", "mobile", "other"] as const).filter((k) => images.some((i) => i.kind === k));
  const [filter, setFilter] = useState<ImageKind | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const visible = filter === "all" ? images : images.filter((i) => i.kind === filter);
  const current = open !== null ? visible[open] : null;
  const altOf = (img: ProjectImage, i: number) =>
    img.alt || `${projectName} — captura ${LABELS[img.kind].toLowerCase()} ${i + 1}`;

  return (
    <div>
      {kinds.length > 1 && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ImageKind | "all")} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">{LABELS.all}</TabsTrigger>
            {kinds.map((k) => (
              <TabsTrigger key={k} value={k}>
                {k === "desktop" && <MonitorIcon />}
                {k === "mobile" && <SmartphoneIcon />}
                {LABELS[k]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((img, i) => (
          <li key={img.id} className={cn(img.kind === "mobile" ? "row-span-2" : "")}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                "relative block w-full overflow-hidden rounded-lg border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                img.kind === "mobile" ? "aspect-[9/19]" : "aspect-[16/10]"
              )}
              aria-label={`Ampliar: ${altOf(img, i)}`}
            >
              <Image
                src={storageUrl(img.path)!}
                alt={altOf(img, i)}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover object-top transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-[min(96vw,80rem)] gap-3 p-3 sm:max-w-[min(96vw,80rem)]">
          {current && open !== null && (
            <>
              <DialogTitle className="sr-only">{altOf(current, open)}</DialogTitle>
              <DialogDescription className="sr-only">
                Imagem {open + 1} de {visible.length}
              </DialogDescription>
              <div className="relative h-[75vh] w-full">
                <Image
                  src={storageUrl(current.path)!}
                  alt={altOf(current, open)}
                  fill
                  sizes="96vw"
                  className="object-contain"
                />
              </div>
              {visible.length > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOpen((open - 1 + visible.length) % visible.length)}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <span className="font-mono text-xs text-muted-foreground">
                    {open + 1} / {visible.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOpen((open + 1) % visible.length)}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
