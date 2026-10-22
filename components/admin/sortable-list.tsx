"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { createContext, useContext, useId } from "react";

import { cn } from "@/lib/utils";

type HandleProps = Record<string, unknown>;
const HandleContext = createContext<HandleProps | null>(null);

/**
 * Lista reordenável por arrastar (mouse/toque) ou teclado (Espaço + setas).
 * Cada item usa <DragHandle /> onde quiser a alça.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  as: Tag = "ul",
  className,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  as?: "ul" | "tbody";
  className?: string;
}) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable: "Pressione Espaço para pegar o item, use as setas para mover e Espaço novamente para soltar.",
        },
      }}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <Tag className={className}>{items.map((item, index) => renderItem(item, index))}</Tag>
      </SortableContext>
    </DndContext>
  );
}

export function SortableItem({
  id,
  as: Tag = "li",
  className,
  children,
}: {
  id: string;
  as?: "li" | "tr";
  className?: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, transform, transition, isDragging, listeners, attributes } = useSortable({ id });
  return (
    <Tag
      ref={setNodeRef as never}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(className, isDragging && "relative z-10 bg-muted/80 shadow-lg")}
    >
      <HandleContext.Provider value={{ ...listeners, ...attributes }}>{children}</HandleContext.Provider>
    </Tag>
  );
}

export function DragHandle({ label = "Reordenar" }: { label?: string }) {
  const props = useContext(HandleContext);
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
    >
      <GripVerticalIcon className="size-4" />
    </button>
  );
}
