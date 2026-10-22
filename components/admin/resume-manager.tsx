"use client";

import { ExternalLinkIcon, FileTextIcon, FileUpIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { setResume } from "@/lib/actions/profile";
import { formatDate } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import { uploadResume } from "@/lib/upload";

export function ResumeManager({ path, updatedAt }: { path: string | null; updatedAt: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadResume(file);
      const result = await setResume(uploaded);
      if (!result.ok) throw new Error(result.error);
      toast.success("Currículo atualizado. O botão “Visualizar currículo” já abre a nova versão.");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setBusy(true);
    const result = await setResume(null);
    setBusy(false);
    if (!result.ok) toast.error(result.error);
    else toast.success("Currículo removido do portfólio.");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFile(e.dataTransfer.files[0]);
        }}
        className="flex items-center gap-4 rounded-xl border bg-card p-5"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
          <FileTextIcon className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {path ? (
            <>
              <p className="font-medium">Currículo atual</p>
              <p className="text-sm text-muted-foreground">Enviado em {formatDate(updatedAt)}</p>
            </>
          ) : (
            <>
              <p className="font-medium">Nenhum currículo enviado</p>
              <p className="text-sm text-muted-foreground">Envie um PDF de até 10 MB. Arraste o arquivo para cá ou clique em enviar.</p>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
        aria-label="Selecionar currículo em PDF"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2Icon className="animate-spin" /> : <FileUpIcon data-icon="inline-start" />}
          {path ? "Substituir PDF" : "Enviar PDF"}
        </Button>
        {path && (
          <>
            <a href={storageUrl(path, "resume")!} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline" })}>
              <ExternalLinkIcon data-icon="inline-start" /> Abrir PDF atual
            </a>
            <Button variant="ghost" onClick={() => setConfirmRemove(true)} disabled={busy}>
              <Trash2Icon data-icon="inline-start" /> Remover
            </Button>
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Link permanente para usar no LinkedIn e em candidaturas: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/curriculo</code>.
        Ele sempre abre a versão mais recente.
      </p>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover currículo?"
        description="O botão “Visualizar currículo” deixará de aparecer no portfólio."
        confirmLabel="Remover"
        onConfirm={remove}
      />
    </div>
  );
}
