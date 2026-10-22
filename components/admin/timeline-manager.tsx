"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useSyncedState } from "@/hooks/use-synced-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DragHandle, SortableItem, SortableList } from "@/components/admin/sortable-list";
import { CertificationForm, EducationForm, ExperienceForm } from "@/components/admin/timeline-forms";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { reorderItems } from "@/lib/actions/projects";
import { deleteTimelineItem, setTimelineVisible } from "@/lib/actions/timeline";
import { formatMonthYear, formatPeriod } from "@/lib/format";
import type { Category, Certification, Education, Experience, Technology } from "@/types";

type Table = "experiences" | "education" | "certifications";
type Item = Experience | Education | Certification;

const COPY: Record<Table, { add: string; empty: string; deleted: string }> = {
  experiences: { add: "Nova experiência", empty: "Nenhuma experiência cadastrada.", deleted: "Experiência excluída." },
  education: { add: "Nova formação", empty: "Nenhuma formação cadastrada.", deleted: "Formação excluída." },
  certifications: { add: "Nova certificação", empty: "Nenhuma certificação cadastrada.", deleted: "Certificação excluída." },
};

function describe(table: Table, item: Item) {
  if (table === "experiences") {
    const e = item as Experience;
    return { title: `${e.role} · ${e.company}`, meta: formatPeriod(e.start_date, e.end_date, e.is_current) };
  }
  if (table === "education") {
    const e = item as Education;
    return { title: `${e.degree}${e.field ? ` em ${e.field}` : ""}`, meta: [e.institution, formatPeriod(e.start_date, e.end_date, e.is_current)].filter(Boolean).join(" · ") };
  }
  const c = item as Certification;
  return { title: c.name, meta: [c.issuer, formatMonthYear(c.issued_at)].filter(Boolean).join(" · ") };
}

export function TimelineManager({
  table,
  items: initial,
  technologies = [],
  categories = [],
}: {
  table: Table;
  items: Item[];
  technologies?: Technology[];
  categories?: Category[];
}) {
  const router = useRouter();
  const [items, setItems] = useSyncedState(initial);
  const [editing, setEditing] = useState<{ item: Item | null } | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);
  const [, startTransition] = useTransition();

  const done = () => {
    setEditing(null);
    router.refresh();
  };

  function reorder(next: Item[]) {
    setItems(next);
    startTransition(async () => {
      const result = await reorderItems(table, next.map((i) => i.id));
      if (!result.ok) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  function toggle(item: Item, visible: boolean) {
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, visible } : i)));
    startTransition(async () => {
      const result = await setTimelineVisible(table, item.id, visible);
      if (!result.ok) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ item: null })}>
          <PlusIcon data-icon="inline-start" /> {COPY[table].add}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">{COPY[table].empty}</p>
      ) : (
        <div className="rounded-xl border bg-card">
          <SortableList
            items={items}
            onReorder={reorder}
            className="divide-y"
            renderItem={(item) => {
              const { title, meta } = describe(table, item);
              return (
                <SortableItem key={item.id} id={item.id} className="flex items-center gap-3 bg-card px-2 py-3 sm:px-3">
                  <DragHandle label={`Reordenar ${title}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{title}</p>
                    <p className="truncate text-xs text-muted-foreground">{meta}</p>
                  </div>
                  <Switch checked={item.visible} onCheckedChange={(v) => toggle(item, v)} aria-label={`Exibir ${title} no portfólio`} />
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ item })} aria-label={`Editar ${title}`}>
                    <PencilIcon />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(item)} aria-label={`Excluir ${title}`}>
                    <Trash2Icon />
                  </Button>
                </SortableItem>
              );
            }}
          />
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          {editing && table === "experiences" && (
            <ExperienceForm item={editing.item as Experience | null} technologies={technologies} categories={categories} onDone={done} />
          )}
          {editing && table === "education" && <EducationForm item={editing.item as Education | null} onDone={done} />}
          {editing && table === "certifications" && <CertificationForm item={editing.item as Certification | null} onDone={done} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir item?"
        description={toDelete ? `“${describe(table, toDelete).title}” será removido permanentemente.` : ""}
        onConfirm={() => {
          if (!toDelete) return;
          const id = toDelete.id;
          startTransition(async () => {
            const result = await deleteTimelineItem(table, id);
            if (!result.ok) toast.error(result.error);
            else toast.success(COPY[table].deleted);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
