"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { describedBy, Field, FormSection } from "@/components/admin/field";
import { ImageUpload } from "@/components/admin/image-upload";
import { TagInput } from "@/components/admin/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveProfile } from "@/lib/actions/profile";
import { profileSchema, type ProfileValues } from "@/lib/validations";
import type { Profile } from "@/types";
import type { z } from "zod";

type ProfileInput = z.input<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileInput, unknown, ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      role_title: profile.role_title,
      hero_title: profile.hero_title,
      hero_subtitle: profile.hero_subtitle,
      bio: profile.bio,
      summary: profile.summary,
      experience_summary: profile.experience_summary,
      interests: profile.interests,
      goals: profile.goals,
      avatar_path: profile.avatar_path,
      location: profile.location,
      email: profile.email,
      whatsapp: profile.whatsapp,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
    },
  });
  const { register, control, formState } = form;
  const e = formState.errors;

  const onSubmit = form.handleSubmit(
    (values) =>
      startTransition(async () => {
        const result = await saveProfile(values);
        if (!result.ok) {
          toast.error(result.error);
          for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
            form.setError(field as keyof ProfileInput, { message: messages[0] });
          }
          return;
        }
        form.reset(values);
        toast.success("Perfil atualizado no portfólio.");
        router.refresh();
      }),
    () => toast.error("Revise os campos destacados.")
  );

  const text = (name: keyof ProfileInput & string, label: string, opts: { hint?: string; placeholder?: string; type?: string } = {}) => (
    <Field id={name} label={label} hint={opts.hint} error={e[name]?.message}>
      <Input
        type={opts.type ?? "text"}
        placeholder={opts.placeholder}
        {...register(name as "full_name")}
        {...describedBy(name, e[name]?.message, opts.hint)}
      />
    </Field>
  );
  const area = (name: keyof ProfileInput & string, label: string, opts: { hint?: string; rows?: number } = {}) => (
    <Field id={name} label={label} hint={opts.hint} error={e[name]?.message}>
      <Textarea rows={opts.rows ?? 3} {...register(name as "bio")} {...describedBy(name, e[name]?.message, opts.hint)} />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-6">
          <FormSection title="Apresentação" description="Primeira seção do portfólio.">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("full_name", "Nome completo")}
              {text("role_title", "Cargo profissional", { placeholder: "Desenvolvedor de Software" })}
            </div>
            {text("hero_title", "Título de apresentação", {
              placeholder: "Olá, eu sou …",
              hint: "Se vazio, usamos “Olá, eu sou {nome}.”",
            })}
            {area("hero_subtitle", "Frase de apresentação", { rows: 2 })}
          </FormSection>

          <FormSection title="Sobre mim" description="Texto natural e objetivo, pensado para recrutadores.">
            {area("summary", "Resumo profissional", { rows: 3, hint: "Duas ou três frases em destaque no topo da seção." })}
            {area("bio", "Biografia / trajetória", { rows: 6, hint: "Linha em branco separa parágrafos." })}
            {area("experience_summary", "Experiência na área", { rows: 3 })}
            <Field id="interests" label="Áreas de interesse" hint="Pressione Enter ou vírgula para adicionar.">
              <Controller
                control={control}
                name="interests"
                render={({ field }) => <TagInput id="interests" value={field.value} onChange={field.onChange} placeholder="Ex.: Desenvolvimento web" />}
              />
            </Field>
            {area("goals", "Objetivos profissionais", { rows: 3 })}
          </FormSection>

          <FormSection title="Contato e links" description="Exibidos na seção Contato e no cabeçalho.">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("email", "E-mail profissional", { type: "email" })}
              {text("whatsapp", "WhatsApp (opcional)", { placeholder: "+55 11 99999-0000", hint: "Exibição controlada em Configurações." })}
              {text("linkedin_url", "LinkedIn", { placeholder: "https://linkedin.com/in/…" })}
              {text("github_url", "GitHub", { placeholder: "https://github.com/…" })}
              {text("location", "Localização", { placeholder: "Cidade, UF — Brasil" })}
            </div>
          </FormSection>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <FormSection title="Foto profissional" description="Opcional.">
            <Controller
              control={control}
              name="avatar_path"
              render={({ field }) => (
                <ImageUpload id="avatar" label="Foto profissional" value={field.value} onChange={field.onChange} folder="profile" aspect="aspect-square" />
              )}
            />
          </FormSection>
          <Button type="submit" className="h-10 w-full" disabled={pending || !formState.isDirty}>
            {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon data-icon="inline-start" />}
            Salvar perfil
          </Button>
        </aside>
      </div>
    </form>
  );
}
