"use server";

import { z } from "zod";

import { adminAction, dbError, parseOrThrow } from "@/lib/actions/shared";
import { removeFiles } from "@/lib/actions/storage-cleanup";
import { profileSchema, settingsSchema } from "@/lib/validations";

const resumePath = z
  .string()
  .regex(/^resume\/[a-zA-Z0-9-]+\.pdf$/, "Arquivo de currículo inválido.")
  .nullable();

export async function saveProfile(input: z.input<typeof profileSchema>) {
  return adminAction(async (supabase) => {
    const values = parseOrThrow(profileSchema, input);
    const { data: previous } = await supabase.from("profile").select("avatar_path").eq("id", 1).maybeSingle();

    const { error } = await supabase.from("profile").upsert({ id: 1, ...values });
    if (error) throw dbError(error);

    if (previous?.avatar_path && previous.avatar_path !== values.avatar_path) {
      await removeFiles(supabase, "media", [previous.avatar_path]);
    }
  });
}

export async function saveSettings(input: z.input<typeof settingsSchema>) {
  return adminAction(async (supabase) => {
    const values = parseOrThrow(settingsSchema, input);
    const { data: previous } = await supabase
      .from("site_settings")
      .select("og_image_path")
      .eq("id", 1)
      .maybeSingle();

    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...values });
    if (error) throw dbError(error);

    if (previous?.og_image_path && previous.og_image_path !== values.og_image_path) {
      await removeFiles(supabase, "media", [previous.og_image_path]);
    }
  });
}

/** Define (ou remove, com null) o PDF atual do currículo e apaga o anterior. */
export async function setResume(path: string | null) {
  return adminAction(async (supabase) => {
    const next = resumePath.parse(path);
    const { data: previous } = await supabase.from("profile").select("resume_path").eq("id", 1).maybeSingle();

    const { error } = await supabase
      .from("profile")
      .upsert({ id: 1, resume_path: next, resume_updated_at: next ? new Date().toISOString() : null });
    if (error) throw dbError(error);

    if (previous?.resume_path && previous.resume_path !== next) {
      await removeFiles(supabase, "resume", [previous.resume_path]);
    }
  });
}
