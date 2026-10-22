"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { describedBy, Field, FormSection } from "@/components/admin/field";
import { ImageUpload } from "@/components/admin/image-upload";
import { TagInput } from "@/components/admin/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/lib/actions/profile";
import { settingsSchema, type SettingsValues } from "@/lib/validations";
import type { SiteSettings } from "@/types";

type SettingsInput = z.input<typeof settingsSchema>;

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SettingsInput, unknown, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });
  const { register, control, formState } = form;
  const e = formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await saveSettings(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      form.reset(values);
      toast.success("Configurações salvas.");
      router.refresh();
    })
  );

  const toggle = (name: "show_location" | "show_whatsapp", label: string, hint: string) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Controller control={control} name={name} render={({ field }) => <Switch id={name} checked={field.value} onCheckedChange={field.onChange} />} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      <FormSection title="SEO e compartilhamento" description="Como o portfólio aparece no Google, LinkedIn e WhatsApp.">
        <Field id="site_title" label="Título do site" required error={e.site_title?.message} hint="Usado quando o nome do perfil estiver vazio.">
          <Input {...register("site_title")} {...describedBy("site_title", e.site_title?.message, true)} />
        </Field>
        <Field id="site_description" label="Descrição" error={e.site_description?.message} hint="Até 300 caracteres. Ideal: 140–160.">
          <Textarea rows={3} maxLength={300} {...register("site_description")} {...describedBy("site_description", e.site_description?.message, true)} />
        </Field>
        <Field id="keywords" label="Palavras-chave">
          <Controller control={control} name="keywords" render={({ field }) => <TagInput id="keywords" value={field.value} onChange={field.onChange} placeholder="Ex.: desenvolvedor react" />} />
        </Field>
        <Field id="og" label="Imagem de compartilhamento (1200×630)" hint="Opcional. Sem imagem, geramos uma automaticamente com seu nome e cargo.">
          <Controller
            control={control}
            name="og_image_path"
            render={({ field }) => <ImageUpload id="og" label="Imagem de compartilhamento" value={field.value} onChange={field.onChange} folder="site" aspect="aspect-[1200/630]" className="max-w-md" />}
          />
        </Field>
      </FormSection>

      <FormSection title="Privacidade do contato">
        {toggle("show_location", "Exibir localização", "Mostra a cidade cadastrada no perfil.")}
        {toggle("show_whatsapp", "Exibir WhatsApp", "Mostra o número cadastrado no perfil na seção Contato.")}
      </FormSection>

      <Button type="submit" disabled={pending || !formState.isDirty}>
        {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon data-icon="inline-start" />}
        Salvar configurações
      </Button>
    </form>
  );
}
