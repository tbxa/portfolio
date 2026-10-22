"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { adminAction, dbError, parseOrThrow } from "@/lib/actions/shared";
import { copyFile, removeFiles } from "@/lib/actions/storage-cleanup";
import { slugify, uniqueSlug } from "@/lib/slug";
import { projectSchema, reorderSchema, type ProjectInput } from "@/lib/validations";
import type { ProjectStatus } from "@/types";
import { z } from "zod";

const idSchema = z.uuid();

async function resolveSlug(supabase: SupabaseClient, wanted: string, ignoreId?: string) {
  const base = slugify(wanted) || "projeto";
  let query = supabase.from("projects").select("slug").like("slug", `${base}%`);
  if (ignoreId) query = query.neq("id", ignoreId);
  const { data, error } = await query;
  if (error) throw dbError(error);
  return uniqueSlug(base, (data ?? []).map((r) => r.slug as string));
}

/** Cria (id = null) ou atualiza um projeto com tecnologias e galeria. */
export async function saveProject(id: string | null, input: ProjectInput) {
  return adminAction(async (supabase) => {
    const projectId = id ? idSchema.parse(id) : null;
    const { technology_ids, images, slug, ...fields } = parseOrThrow(projectSchema, input);

    let previous: { cover_path: string | null } | null = null;
    if (projectId) {
      const { data, error } = await supabase
        .from("projects")
        .select("cover_path")
        .eq("id", projectId)
        .single();
      if (error) throw dbError(error);
      previous = data;
    }

    const row = {
      ...fields,
      slug: await resolveSlug(supabase, slug || fields.name, projectId ?? undefined),
    };

    const { data: saved, error } = projectId
      ? await supabase.from("projects").update(row).eq("id", projectId).select("id, slug").single()
      : await supabase.from("projects").insert(row).select("id, slug").single();
    if (error) throw dbError(error);

    // Tecnologias: substitui o conjunto inteiro.
    const { error: delTechError } = await supabase
      .from("project_technologies")
      .delete()
      .eq("project_id", saved.id);
    if (delTechError) throw dbError(delTechError);
    if (technology_ids.length) {
      const { error: techError } = await supabase.from("project_technologies").insert(
        [...new Set(technology_ids)].map((technology_id) => ({ project_id: saved.id, technology_id }))
      );
      if (techError) throw dbError(techError);
    }

    // Galeria: remove o que saiu, atualiza o que ficou, insere o que é novo.
    const { data: existing, error: imgError } = await supabase
      .from("project_images")
      .select("id, path")
      .eq("project_id", saved.id);
    if (imgError) throw dbError(imgError);

    const keepIds = new Set(images.flatMap((img) => (img.id ? [img.id] : [])));
    const removed = (existing ?? []).filter((img) => !keepIds.has(img.id));
    if (removed.length) {
      const { error: rmError } = await supabase
        .from("project_images")
        .delete()
        .in(
          "id",
          removed.map((img) => img.id)
        );
      if (rmError) throw dbError(rmError);
    }

    const existingIds = new Set((existing ?? []).map((img) => img.id));
    const rows = images.map((img, index) => ({
      ...(img.id && existingIds.has(img.id) ? { id: img.id } : {}),
      project_id: saved.id,
      path: img.path,
      alt: img.alt,
      kind: img.kind,
      sort_order: index,
    }));
    const updates = rows.filter((r) => "id" in r);
    const inserts = rows.filter((r) => !("id" in r));
    if (updates.length) {
      const { error: upError } = await supabase.from("project_images").upsert(updates);
      if (upError) throw dbError(upError);
    }
    if (inserts.length) {
      const { error: insError } = await supabase.from("project_images").insert(inserts);
      if (insError) throw dbError(insError);
    }

    const keptPaths = new Set(images.map((img) => img.path));
    await removeFiles(supabase, "media", [
      ...removed.map((img) => img.path).filter((p) => !keptPaths.has(p)),
      previous?.cover_path && previous.cover_path !== fields.cover_path ? previous.cover_path : null,
    ]);

    return { id: saved.id as string, slug: saved.slug as string };
  });
}

export async function setProjectStatus(id: string, status: ProjectStatus) {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: z.enum(["draft", "published"]).parse(status) })
      .eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}

export async function setProjectFeatured(id: string, featured: boolean) {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from("projects")
      .update({ featured: Boolean(featured) })
      .eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}

/** Duplica como rascunho, copiando também os arquivos de imagem. */
export async function duplicateProject(id: string) {
  return adminAction(async (supabase) => {
    const { data: source, error } = await supabase
      .from("projects")
      .select("*, project_technologies(technology_id), project_images(*)")
      .eq("id", idSchema.parse(id))
      .single();
    if (error) throw dbError(error);

    const {
      id: _id,
      created_at: _c,
      updated_at: _u,
      published_at: _p,
      project_technologies,
      project_images,
      ...fields
    } = source;

    const coverCopy = fields.cover_path ? await copyFile(supabase, "media", fields.cover_path) : null;
    const { data: created, error: insError } = await supabase
      .from("projects")
      .insert({
        ...fields,
        name: `${fields.name} (cópia)`,
        slug: await resolveSlug(supabase, `${fields.slug}-copia`),
        status: "draft",
        featured: false,
        cover_path: coverCopy,
      })
      .select("id")
      .single();
    if (insError) throw dbError(insError);

    const techRows = (project_technologies as { technology_id: string }[]).map((t) => ({
      project_id: created.id,
      technology_id: t.technology_id,
    }));
    if (techRows.length) {
      const { error: techError } = await supabase.from("project_technologies").insert(techRows);
      if (techError) throw dbError(techError);
    }

    const imageRows = [];
    for (const img of project_images as { path: string; alt: string; kind: string; sort_order: number }[]) {
      const path = await copyFile(supabase, "media", img.path);
      if (path) imageRows.push({ project_id: created.id, path, alt: img.alt, kind: img.kind, sort_order: img.sort_order });
    }
    if (imageRows.length) {
      const { error: imgError } = await supabase.from("project_images").insert(imageRows);
      if (imgError) throw dbError(imgError);
    }

    return { id: created.id as string };
  });
}

export async function deleteProject(id: string) {
  return adminAction(async (supabase) => {
    const projectId = idSchema.parse(id);
    const { data, error } = await supabase
      .from("projects")
      .select("cover_path, project_images(path)")
      .eq("id", projectId)
      .single();
    if (error) throw dbError(error);

    const { error: delError } = await supabase.from("projects").delete().eq("id", projectId);
    if (delError) throw dbError(delError);

    await removeFiles(supabase, "media", [
      data.cover_path,
      ...(data.project_images as { path: string }[]).map((img) => img.path),
    ]);
  });
}

/** Reordenação por drag-and-drop (projetos, tecnologias, categorias, trajetória). */
export async function reorderItems(table: string, ids: string[]) {
  return adminAction(async (supabase) => {
    const input = parseOrThrow(reorderSchema, { table, ids });
    const { error } = await supabase.rpc("reorder_items", { p_table: input.table, p_ids: input.ids });
    if (error) throw dbError(error);
  });
}
