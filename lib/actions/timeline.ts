"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { adminAction, dbError, parseOrThrow } from "@/lib/actions/shared";
import { certificationSchema, educationSchema, experienceSchema } from "@/lib/validations";

const idSchema = z.uuid();

async function topSortOrder(supabase: SupabaseClient, table: string) {
  const { data } = await supabase.from(table).select("sort_order").order("sort_order").limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? 1) - 1;
}

/** Novos itens entram no topo da lista (mais recentes primeiro). */
async function upsertRow(
  supabase: SupabaseClient,
  table: "experiences" | "education" | "certifications",
  id: string | null,
  row: Record<string, unknown>
) {
  const { data, error } = id
    ? await supabase.from(table).update(row).eq("id", idSchema.parse(id)).select("id").single()
    : await supabase
        .from(table)
        .insert({ ...row, sort_order: await topSortOrder(supabase, table) })
        .select("id")
        .single();
  if (error) throw dbError(error);
  return data.id as string;
}

export async function saveExperience(id: string | null, input: z.input<typeof experienceSchema>) {
  return adminAction(async (supabase) => {
    const { technology_ids, ...values } = parseOrThrow(experienceSchema, input);
    const experienceId = await upsertRow(supabase, "experiences", id, {
      ...values,
      end_date: values.is_current ? null : values.end_date,
    });

    const { error: delError } = await supabase
      .from("experience_technologies")
      .delete()
      .eq("experience_id", experienceId);
    if (delError) throw dbError(delError);
    if (technology_ids.length) {
      const { error } = await supabase.from("experience_technologies").insert(
        [...new Set(technology_ids)].map((technology_id) => ({ experience_id: experienceId, technology_id }))
      );
      if (error) throw dbError(error);
    }
    return { id: experienceId };
  });
}

export async function saveEducation(id: string | null, input: z.input<typeof educationSchema>) {
  return adminAction(async (supabase) => {
    const values = parseOrThrow(educationSchema, input);
    return {
      id: await upsertRow(supabase, "education", id, {
        ...values,
        end_date: values.is_current ? null : values.end_date,
      }),
    };
  });
}

export async function saveCertification(id: string | null, input: z.input<typeof certificationSchema>) {
  return adminAction(async (supabase) => {
    const values = parseOrThrow(certificationSchema, input);
    return { id: await upsertRow(supabase, "certifications", id, values) };
  });
}

const timelineTable = z.enum(["experiences", "education", "certifications"]);

export async function deleteTimelineItem(table: z.input<typeof timelineTable>, id: string) {
  return adminAction(async (supabase) => {
    const { error } = await supabase.from(timelineTable.parse(table)).delete().eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}

export async function setTimelineVisible(table: z.input<typeof timelineTable>, id: string, visible: boolean) {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from(timelineTable.parse(table))
      .update({ visible: Boolean(visible) })
      .eq("id", idSchema.parse(id));
    if (error) throw dbError(error);
  });
}
