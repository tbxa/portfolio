"use client";

import { ChevronsUpDownIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NativeSelect } from "@/components/admin/field";
import { TechIcon } from "@/components/shared/tech-icon";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createTechnology } from "@/lib/actions/technologies";
import type { Category, Technology } from "@/types";

/**
 * Seleção múltipla de tecnologias com busca. Se o termo buscado não existir,
 * oferece "Criar …" sem sair do formulário.
 */
export function TechPicker({
  id,
  technologies,
  categories,
  value,
  onChange,
  onCreated,
}: {
  id: string;
  technologies: Technology[];
  categories: Category[];
  value: string[];
  onChange: (ids: string[]) => void;
  onCreated: (tech: Technology) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newCategory, setNewCategory] = useState<string>(categories[0]?.id ?? "");

  const selected = useMemo(
    () => value.map((techId) => technologies.find((t) => t.id === techId)).filter((t): t is Technology => Boolean(t)),
    [value, technologies]
  );
  const grouped = useMemo(() => {
    const groups = categories.map((c) => ({ name: c.name, items: technologies.filter((t) => t.category_id === c.id) }));
    const others = technologies.filter((t) => !t.category_id || !categories.some((c) => c.id === t.category_id));
    if (others.length) groups.push({ name: "Outras", items: others });
    return groups.filter((g) => g.items.length);
  }, [technologies, categories]);

  const term = search.trim();
  const exists = technologies.some((t) => t.name.toLowerCase() === term.toLowerCase());

  function toggle(techId: string) {
    onChange(value.includes(techId) ? value.filter((v) => v !== techId) : [...value, techId]);
  }

  async function create() {
    if (!term) return;
    setCreating(true);
    const result = await createTechnology({
      name: term,
      icon: "",
      category_id: newCategory || null,
      visible: true,
    });
    setCreating(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onCreated(result.data);
    if (!value.includes(result.data.id)) onChange([...value, result.data.id]);
    setSearch("");
    toast.success(`“${result.data.name}” cadastrada e selecionada.`);
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="h-9 w-full justify-between font-normal"
              aria-haspopup="listbox"
            >
              <span className={selected.length ? "" : "text-muted-foreground"}>
                {selected.length
                  ? `${selected.length} ${selected.length === 1 ? "tecnologia selecionada" : "tecnologias selecionadas"}`
                  : "Selecione as tecnologias…"}
              </span>
              <ChevronsUpDownIcon className="opacity-50" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-(--anchor-width) min-w-72 p-0">
          <Command loop>
            <CommandInput placeholder="Buscar ou criar tecnologia…" value={search} onValueChange={setSearch} />
            <CommandList className="max-h-72">
              <CommandEmpty>{term ? "Nenhuma tecnologia encontrada." : "Nenhuma tecnologia cadastrada."}</CommandEmpty>
              {grouped.map((group) => (
                <CommandGroup key={group.name} heading={group.name}>
                  {group.items.map((tech) => (
                    <CommandItem
                      key={tech.id}
                      value={`${tech.name} ${tech.slug}`}
                      onSelect={() => toggle(tech.id)}
                      data-checked={value.includes(tech.id)}
                    >
                      <TechIcon name={tech.name} icon={tech.icon} />
                      {tech.name}
                      {!tech.visible && (
                        <span className="text-[10px] text-muted-foreground" title="Oculta na seção Tecnologias">
                          oculta
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {term && !exists && (
                <>
                  <CommandSeparator />
                  <CommandGroup forceMount heading="Nova tecnologia">
                    <CommandItem forceMount value={`__create__ ${term}`} onSelect={create} disabled={creating}>
                      {creating ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                      Criar “{term}”
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
            {term && !exists && categories.length > 0 && (
              <div className="flex items-center gap-2 border-t p-2 text-xs text-muted-foreground">
                <label htmlFor={`${id}-new-category`} className="shrink-0">
                  Categoria:
                </label>
                <NativeSelect
                  id={`${id}-new-category`}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-7 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="">Sem categoria</option>
                </NativeSelect>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias selecionadas">
          {selected.map((tech) => (
            <li key={tech.id} className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 py-1 pr-1 pl-2 text-xs">
              <TechIcon name={tech.name} icon={tech.icon} className="size-3" />
              {tech.name}
              <button
                type="button"
                onClick={() => toggle(tech.id)}
                className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={`Remover ${tech.name}`}
              >
                <XIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
