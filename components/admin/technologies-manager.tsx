"use client";

import { EyeOffIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useSyncedState } from "@/hooks/use-synced-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DragHandle, SortableItem, SortableList } from "@/components/admin/sortable-list";
import { TechnologyDialog } from "@/components/admin/technology-dialog";
import { TechIcon } from "@/components/shared/tech-icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { reorderItems } from "@/lib/actions/projects";
import { deleteTechnology, setTechnologyVisible } from "@/lib/actions/technologies";
import type { Category, Technology } from "@/types";

export function TechnologiesManager({
  technologies: initial,
  categories,
  usage,
}: {
  technologies: Technology[];
  categories: Category[];
  usage: Record<string, number>;
}) {
  const router = useRouter();
  const [technologies, setTechnologies] = useSyncedState(initial);
  const [editing, setEditing] = useState<{ tech: Technology | null; categoryId?: string | null } | null>(null);
  const [toDelete, setToDelete] = useState<Technology | null>(null);
  const [, startTransition] = useTransition();


  const groups = [
    ...categories.map((c) => ({ id: c.id as string | null, name: c.name, items: technologies.filter((t) => t.category_id === c.id) })),
    {
      id: null,
      name: "Sem categoria",
      items: technologies.filter((t) => !t.category_id || !categories.some((c) => c.id === t.category_id)),
    },
  ].filter((g) => g.id !== null || g.items.length > 0);
  const hiddenCount = technologies.filter((t) => !t.visible).length;

  function toggleVisible(tech: Technology, visible: boolean) {
    setTechnologies((list) => list.map((t) => (t.id === tech.id ? { ...t, visible } : t)));
    startTransition(async () => {
      const result = await setTechnologyVisible(tech.id, visible);
      if (!result.ok) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  function reorderGroup(groupItems: Technology[]) {
    const order = new Map(groupItems.map((t, i) => [t.id, i]));
    setTechnologies((list) =>
      list.map((t) => (order.has(t.id) ? { ...t, sort_order: order.get(t.id)! } : t)).sort((a, b) => a.sort_order - b.sort_order)
    );
    startTransition(async () => {
      const result = await reorderItems("technologies", groupItems.map((t) => t.id));
      if (!result.ok) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {hiddenCount > 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <EyeOffIcon className="size-4" aria-hidden="true" />
            {hiddenCount} {hiddenCount === 1 ? "tecnologia oculta" : "tecnologias ocultas"} na seção Tecnologias. Ative apenas as que você domina.
          </p>
        ) : (
          <span />
        )}
        <Button onClick={() => setEditing({ tech: null })}>
          <PlusIcon data-icon="inline-start" /> Nova tecnologia
        </Button>
      </div>

      {groups.map((group) => (
        <section key={group.id ?? "none"} className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-medium">
              {group.name} <span className="font-mono text-xs text-muted-foreground">{group.items.length}</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setEditing({ tech: null, categoryId: group.id })}>
              <PlusIcon data-icon="inline-start" /> Adicionar
            </Button>
          </div>
          {group.items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma tecnologia nesta categoria.</p>
          ) : (
            <SortableList
              items={group.items}
              onReorder={reorderGroup}
              className="divide-y"
              renderItem={(tech) => (
                <SortableItem key={tech.id} id={tech.id} className="flex items-center gap-3 bg-card px-2 py-2 sm:px-3">
                  <DragHandle label={`Reordenar ${tech.name}`} />
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                    <TechIcon name={tech.name} icon={tech.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {usage[tech.id] ? `${usage[tech.id]} ${usage[tech.id] === 1 ? "projeto" : "projetos"}` : "Não usada em projetos"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:inline">{tech.visible ? "Visível" : "Oculta"}</span>
                    <Switch
                      checked={tech.visible}
                      onCheckedChange={(v) => toggleVisible(tech, v)}
                      aria-label={`Exibir ${tech.name} na seção Tecnologias`}
                    />
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ tech })} aria-label={`Editar ${tech.name}`}>
                    <PencilIcon />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(tech)} aria-label={`Excluir ${tech.name}`}>
                    <Trash2Icon />
                  </Button>
                </SortableItem>
              )}
            />
          )}
        </section>
      ))}

      <TechnologyDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        technology={editing?.tech ?? null}
        defaultCategoryId={editing?.categoryId}
        categories={categories}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Excluir ${toDelete?.name ?? "tecnologia"}?`}
        description={
          toDelete && usage[toDelete.id]
            ? `Ela será removida de ${usage[toDelete.id]} ${usage[toDelete.id] === 1 ? "projeto" : "projetos"}.`
            : "Esta ação não pode ser desfeita."
        }
        onConfirm={() => {
          if (!toDelete) return;
          const tech = toDelete;
          startTransition(async () => {
            const result = await deleteTechnology(tech.id);
            if (!result.ok) toast.error(result.error);
            else toast.success("Tecnologia excluída.");
            router.refresh();
          });
        }}
      />
    </div>
  );
}
