"use client";

import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useSyncedState } from "@/hooks/use-synced-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DragHandle, SortableItem, SortableList } from "@/components/admin/sortable-list";
import { TechIcon } from "@/components/shared/tech-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteProject,
  duplicateProject,
  reorderItems,
  setProjectFeatured,
  setProjectStatus,
} from "@/lib/actions/projects";
import { formatDate } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import type { ActionResult, ProjectWithRelations } from "@/types";

export function ProjectsTable({ projects: initial }: { projects: ProjectWithRelations[] }) {
  const router = useRouter();
  const [projects, setProjects] = useSyncedState(initial);
  const [toDelete, setToDelete] = useState<ProjectWithRelations | null>(null);
  const [, startTransition] = useTransition();


  function run<T>(action: () => Promise<ActionResult<T>>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.error);
      else toast.success(success);
      router.refresh();
    });
  }

  function reorder(next: ProjectWithRelations[]) {
    const previous = projects;
    setProjects(next);
    startTransition(async () => {
      const result = await reorderItems("projects", next.map((p) => p.id));
      if (!result.ok) {
        setProjects(previous);
        toast.error(result.error);
      } else {
        toast.success("Ordem atualizada.");
      }
    });
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Nenhum projeto cadastrado.</p>
        <Link href="/admin/projetos/novo" className="mt-2 inline-block font-medium underline underline-offset-4">
          Cadastrar o primeiro projeto
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="w-10 px-2 py-3">
                <span className="sr-only">Ordem</span>
              </th>
              <th scope="col" className="px-2 py-3 font-medium">Projeto</th>
              <th scope="col" className="hidden px-2 py-3 font-medium lg:table-cell">Tecnologias</th>
              <th scope="col" className="hidden px-2 py-3 font-medium md:table-cell">Categoria</th>
              <th scope="col" className="px-2 py-3 font-medium">Status</th>
              <th scope="col" className="hidden px-2 py-3 font-medium md:table-cell">Atualizado</th>
              <th scope="col" className="w-12 px-2 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <SortableList
            as="tbody"
            items={projects}
            onReorder={reorder}
            className="divide-y"
            renderItem={(p) => {
              const cover = storageUrl(p.cover_path);
              return (
                <SortableItem key={p.id} id={p.id} as="tr" className="bg-card align-middle">
                  <td className="px-2 py-2">
                    <DragHandle label={`Reordenar ${p.name}`} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-[4.5rem] shrink-0 overflow-hidden rounded-md border bg-muted">
                        {cover ? (
                          <Image src={cover} alt="" fill sizes="72px" className="object-cover object-top" />
                        ) : (
                          <ImageIcon className="m-auto mt-3 size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/projetos/${p.id}`} className="flex items-center gap-1.5 font-medium hover:underline">
                          <span className="truncate">{p.name}</span>
                          {p.featured && <StarIcon className="size-3.5 shrink-0 fill-brand text-brand" aria-label="Em destaque" />}
                        </Link>
                        <p className="truncate font-mono text-xs text-muted-foreground">/projetos/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-2 py-2 lg:table-cell">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {p.technologies.slice(0, 5).map((t) => (
                        <span key={t.id} title={t.name}>
                          <TechIcon name={t.name} icon={t.icon} />
                        </span>
                      ))}
                      {p.technologies.length > 5 && <span className="text-xs">+{p.technologies.length - 5}</span>}
                    </div>
                  </td>
                  <td className="hidden px-2 py-2 text-muted-foreground md:table-cell">{p.category?.name ?? "—"}</td>
                  <td className="px-2 py-2">
                    <Badge variant={p.status === "published" ? "default" : "secondary"}>
                      {p.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </td>
                  <td className="hidden px-2 py-2 whitespace-nowrap text-muted-foreground md:table-cell">
                    {formatDate(p.updated_at)}
                  </td>
                  <td className="px-2 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${p.name}`}>
                            <MoreHorizontalIcon />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/admin/projetos/${p.id}`)}>
                          <PencilIcon /> Editar
                        </DropdownMenuItem>
                        {p.status === "published" ? (
                          <DropdownMenuItem onClick={() => run(() => setProjectStatus(p.id, "draft"), "Projeto despublicado.")}>
                            <EyeOffIcon /> Despublicar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => run(() => setProjectStatus(p.id, "published"), "Projeto publicado.")}>
                            <EyeIcon /> Publicar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            run(() => setProjectFeatured(p.id, !p.featured), p.featured ? "Removido dos destaques." : "Marcado como destaque.")
                          }
                        >
                          <StarIcon /> {p.featured ? "Remover destaque" : "Destacar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => run(() => duplicateProject(p.id), "Projeto duplicado como rascunho.")}>
                          <CopyIcon /> Duplicar
                        </DropdownMenuItem>
                        {p.status === "published" && (
                          <DropdownMenuItem onClick={() => window.open(`/projetos/${p.slug}`, "_blank")}>
                            <ExternalLinkIcon /> Ver no site
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setToDelete(p)}>
                          <Trash2Icon /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </SortableItem>
              );
            }}
          />
        </table>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir projeto?"
        description={
          <>
            <strong>{toDelete?.name}</strong> e todas as suas imagens serão removidos permanentemente.
          </>
        }
        onConfirm={() => {
          if (toDelete) run(() => deleteProject(toDelete.id), "Projeto excluído.");
        }}
      />
    </>
  );
}
