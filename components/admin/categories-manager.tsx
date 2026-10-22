"use client";

import { CheckIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useSyncedState } from "@/hooks/use-synced-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DragHandle, SortableItem, SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reorderItems } from "@/lib/actions/projects";
import { deleteCategory, saveCategory } from "@/lib/actions/technologies";
import type { Category } from "@/types";

export function CategoriesManager({
  table,
  categories: initial,
  title,
  description,
  deleteWarning,
}: {
  table: "tech_categories" | "project_categories";
  categories: Category[];
  title: string;
  description: string;
  deleteWarning: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useSyncedState(initial);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();


  function save(id: string | null, name: string, after?: () => void) {
    startTransition(async () => {
      const result = await saveCategory(table, id, { name });
      if (!result.ok) {
        toast.error(result.fieldErrors?.name?.[0] ?? result.error);
        return;
      }
      after?.();
      router.refresh();
    });
  }

  function reorder(next: Category[]) {
    setCategories(next);
    startTransition(async () => {
      const result = await reorderItems(table, next.map((c) => c.id));
      if (!result.ok) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <SortableList
        items={categories}
        onReorder={reorder}
        className="divide-y"
        renderItem={(c) => (
          <SortableItem key={c.id} id={c.id} className="flex items-center gap-2 bg-card px-2 py-2 sm:px-3">
            <DragHandle label={`Reordenar ${c.name}`} />
            {editing?.id === c.id ? (
              <form
                className="flex flex-1 items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  save(c.id, editing.name, () => setEditing(null));
                }}
              >
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} autoFocus aria-label="Nome da categoria" className="h-8" />
                <Button type="submit" variant="ghost" size="icon-sm" aria-label="Salvar">
                  <CheckIcon />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(null)} aria-label="Cancelar">
                  <XIcon />
                </Button>
              </form>
            ) : (
              <>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{c.slug}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ id: c.id, name: c.name })} aria-label={`Renomear ${c.name}`}>
                  <PencilIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(c)} aria-label={`Excluir ${c.name}`}>
                  <Trash2Icon />
                </Button>
              </>
            )}
          </SortableItem>
        )}
      />

      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) save(null, draft, () => setDraft(""));
        }}
      >
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nova categoria" aria-label="Nome da nova categoria" className="h-8" />
        <Button type="submit" size="sm" variant="outline" disabled={pending || !draft.trim()}>
          {pending ? <Loader2Icon className="animate-spin" /> : <PlusIcon data-icon="inline-start" />}
          Adicionar
        </Button>
      </form>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Excluir “${toDelete?.name}”?`}
        description={deleteWarning}
        onConfirm={() => {
          if (!toDelete) return;
          const id = toDelete.id;
          startTransition(async () => {
            const result = await deleteCategory(table, id);
            if (!result.ok) toast.error(result.error);
            router.refresh();
          });
        }}
      />
    </section>
  );
}
