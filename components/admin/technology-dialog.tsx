"use client";

import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { describedBy, Field, NativeSelect } from "@/components/admin/field";
import { TechIcon } from "@/components/shared/tech-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createTechnology, updateTechnology } from "@/lib/actions/technologies";
import { suggestIconSlug } from "@/lib/slug";
import type { Category, Technology } from "@/types";

export function TechnologyDialog({
  open,
  onOpenChange,
  technology,
  categories,
  defaultCategoryId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technology: Technology | null;
  categories: Category[];
  defaultCategoryId?: string | null;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <TechnologyForm
            technology={technology}
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            onDone={() => {
              onOpenChange(false);
              onSaved();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TechnologyForm({
  technology,
  categories,
  defaultCategoryId,
  onDone,
}: {
  technology: Technology | null;
  categories: Category[];
  defaultCategoryId?: string | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(technology?.name ?? "");
  const [icon, setIcon] = useState(technology?.icon ?? "");
  const [iconTouched, setIconTouched] = useState(Boolean(technology));
  const [categoryId, setCategoryId] = useState<string>(technology?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [visible, setVisible] = useState(technology?.visible ?? true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  // Sugere o slug do Simple Icons a partir do nome até o usuário editar o campo.
  const suggestedIcon = suggestIconSlug(name);
  const effectiveIcon = iconTouched ? icon : suggestedIcon;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const input = { name, icon: effectiveIcon, category_id: categoryId || null, visible };
    const result = technology ? await updateTechnology(technology.id, input) : await createTechnology(input);
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success(technology ? "Tecnologia atualizada." : "Tecnologia cadastrada.");
    onDone();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>{technology ? "Editar tecnologia" : "Nova tecnologia"}</DialogTitle>
        <DialogDescription>Tecnologias podem ser associadas a vários projetos e experiências.</DialogDescription>
      </DialogHeader>

      <Field id="tech-name" label="Nome" required error={errors.name?.[0]}>
        <Input {...describedBy("tech-name", errors.name?.[0])} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>

      <Field
        id="tech-icon"
        label="Ícone"
        error={errors.icon?.[0]}
        hint={
          <>
            Slug do{" "}
            <a href="https://simpleicons.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline">
              Simple Icons <ExternalLinkIcon className="size-3" />
            </a>{" "}
            (ex.: react, nextdotjs) ou URL https de um SVG. Sem ícone, mostramos as iniciais.
          </>
        }
      >
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
            <TechIcon name={name || "?"} icon={effectiveIcon} className="size-4" />
          </span>
          <Input
            {...describedBy("tech-icon", errors.icon?.[0], true)}
            value={effectiveIcon}
            onChange={(e) => {
              setIconTouched(true);
              setIcon(e.target.value.trim());
            }}
            placeholder="react"
          />
        </div>
      </Field>

      <Field id="tech-category" label="Categoria">
        <NativeSelect id="tech-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="">Sem categoria</option>
        </NativeSelect>
      </Field>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div>
          <label htmlFor="tech-visible" className="text-sm font-medium">
            Exibir na seção Tecnologias
          </label>
          <p className="text-xs text-muted-foreground">Ative apenas para tecnologias que você domina.</p>
        </div>
        <Switch id="tech-visible" checked={visible} onCheckedChange={setVisible} />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2Icon className="animate-spin" />}
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
