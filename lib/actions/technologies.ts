"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { adminAction, dbError, parseOrThrow } from "@/lib/actions/shared";
import { slugify, suggestIconSlug, uniqueSlug } from "@/lib/slug";
import { categorySchema, technologySchema } from "@/lib/validations";
import type { Category, Technology } from "@/types";

const idSchema = z.uuid();
const categoryTable = z.enum(["tech_categories", "project_categories"]);
type CategoryTable = z.infer<typeof categoryTable>;

async function freeSlug(
  supabase: SupabaseClient,
  table: "technologies" | CategoryTable,
  wanted: string,
  ignoreId?: string
) {
  const base = slugify(wanted) || "item";
  let query = supabase.from(table).select("slug").like("slug", `${base}%`);
  if (ignoreId) query = query.neq("id", ignoreId);
  const { data, error } = await query;
  if (error) throw dbError(error);
  return uniqueSlug(base, (data ?? []).map((r) => r.slug as string));
}

async function nextSortOrder(supabase: SupabaseClient, table: string, filter?: [string, string | null]) {
  let query = supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  if (filter) query = filter[1] === null ? query.is(filter[0], null) : query.eq(filter[0], filter[1]);
  const { data } = await query;
  return ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;
}

/** Usado tanto na tela de tecnologias quanto no cadastro rápido dentro do formulário de projeto. */
export async function createTechnology(input: z.input<typeof technologySchema>) {
  return adminAction(async (supabase): Promise<Technology> => {
    const values = parseOrThrow(technologySchema, input);

    // Evita duplicatas ao criar "React" de novo a partir do formulário de projeto.
    const { data: same } = await supabase
      .from("technologies")
      .select("*")
      .ilike("name", values.name.replace(/[%_\\]/g, "\\$&"))
      .maybeSingle();
    if (same) return same as Technology;

    const { data, error } = await supabase
      .from("technologies")
      .insert({
        ...values,
        icon: values.icon || suggestIconSlug(values.name),
        slug: await freeSlug(supabase, "technologies", values.slug || values.name),
        sort_order: await nextSortOrder(supabase, "technologies", ["category_id", values.category_id]),
      })
      .select("*")
      .single();
    if (error) throw dbError(error);
    return data as Technology;
  });
}

export async function updateTechnology(id: string, input: z.input<typeof technologySchema>) {
  return adminAction(async (supabase): Promise<Technology> => {
    const techId = idSchema.parse(id);
    const values = parseOrThrow(technologySchema, input);
    const { data, error } = await supabase
      .from("technologies")
      .update({
        ...values,
        slug: await freeSlug(supabase, "technologies", values.slug || values.name, techId),
      })
      .eq("id", techId)
      .select("*")
      .single();
    if (error) throw dbError(error);
    return data as Technology;
  });
}

export async function setTechnologyVisible(id: string, visible: boolean) {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from("technologies")
      .update({ visible: Boolean(visible) })
      .eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}

export async function deleteTechnology(id: string) {
  return adminAction(async (supabase) => {
    const { error } = await supabase.from("technologies").delete().eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}

export async function saveCategory(
  table: CategoryTable,
  id: string | null,
  input: z.input<typeof categorySchema>
) {
  return adminAction(async (supabase): Promise<Category> => {
    const target = categoryTable.parse(table);
    const categoryId = id ? idSchema.parse(id) : undefined;
    const values = parseOrThrow(categorySchema, input);
    const row = {
      name: values.name,
      slug: await freeSlug(supabase, target, values.slug || values.name, categoryId),
    };
    const { data, error } = categoryId
      ? await supabase.from(target).update(row).eq("id", categoryId).select("*").single()
      : await supabase
          .from(target)
          .insert({ ...row, sort_order: await nextSortOrder(supabase, target) })
          .select("*")
          .single();
    if (error) throw dbError(error);
    return data as Category;
  });
}

export async function deleteCategory(table: CategoryTable, id: string) {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from(categoryTable.parse(table))
      .delete()
      .eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}
