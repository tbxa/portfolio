"use client";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { describedBy, Field } from "@/components/admin/field";
import { TechPicker } from "@/components/admin/tech-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveCertification, saveEducation, saveExperience } from "@/lib/actions/timeline";
import type { ActionResult, Category, Certification, Education, Experience, Technology } from "@/types";

type Errors = Record<string, string[]>;

/** Estado de formulário simples + envio para uma Server Action que valida com Zod. */
function useSubmit(onDone: () => void) {
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  async function submit(run: () => Promise<ActionResult<unknown>>, success: string) {
    setSaving(true);
    const result = await run();
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }
    toast.success(success);
    onDone();
  }
  return { errors, saving, submit };
}

function Text({
  id,
  label,
  value,
  onChange,
  errors,
  required,
  type = "text",
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  errors: Errors;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  const error = errors[id]?.[0];
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint}>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...describedBy(id, error, hint)} />
    </Field>
  );
}

function Area({ id, label, value, onChange, errors, hint, rows = 3 }: { id: string; label: string; value: string; onChange: (v: string) => void; errors: Errors; hint?: string; rows?: number }) {
  const error = errors[id]?.[0];
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...describedBy(id, error, hint)} />
    </Field>
  );
}

function Current({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      {label}
    </label>
  );
}

function Footer({ saving }: { saving: boolean }) {
  return (
    <DialogFooter>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2Icon className="animate-spin" />}
        Salvar
      </Button>
    </DialogFooter>
  );
}

export function ExperienceForm({
  item,
  technologies: initialTechnologies,
  categories,
  onDone,
}: {
  item: Experience | null;
  technologies: Technology[];
  categories: Category[];
  onDone: () => void;
}) {
  const [v, setV] = useState({
    company: item?.company ?? "",
    role: item?.role ?? "",
    location: item?.location ?? "",
    employment_type: item?.employment_type ?? "",
    start_date: item?.start_date ?? "",
    end_date: item?.end_date ?? "",
    is_current: item?.is_current ?? false,
    description: item?.description ?? "",
    responsibilities: item?.responsibilities ?? "",
    visible: item?.visible ?? true,
    technology_ids: item?.technologies.map((t) => t.id) ?? [],
  });
  const [technologies, setTechnologies] = useState(initialTechnologies);
  const { errors, saving, submit } = useSubmit(onDone);
  const set = <K extends keyof typeof v>(key: K) => (value: (typeof v)[K]) => setV((s) => ({ ...s, [key]: value }));

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(() => saveExperience(item?.id ?? null, v), "Experiência salva.");
      }}
    >
      <DialogHeader>
        <DialogTitle>{item ? "Editar experiência" : "Nova experiência"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <Text id="company" label="Empresa" required value={v.company} onChange={set("company")} errors={errors} />
        <Text id="role" label="Cargo" required value={v.role} onChange={set("role")} errors={errors} />
        <Text id="employment_type" label="Tipo" hint="CLT, PJ, estágio, freelance…" value={v.employment_type} onChange={set("employment_type")} errors={errors} />
        <Text id="location" label="Local" hint="Cidade ou “Remoto”" value={v.location} onChange={set("location")} errors={errors} />
        <Text id="start_date" label="Início" type="date" required value={v.start_date} onChange={set("start_date")} errors={errors} />
        {!v.is_current && <Text id="end_date" label="Fim" type="date" value={v.end_date} onChange={set("end_date")} errors={errors} />}
      </div>
      <Current checked={v.is_current} onChange={set("is_current")} label="Trabalho aqui atualmente" />
      <Area id="description" label="Descrição das atividades" value={v.description} onChange={set("description")} errors={errors} />
      <Area id="responsibilities" label="Principais responsabilidades" hint="Uma por linha." value={v.responsibilities} onChange={set("responsibilities")} errors={errors} rows={4} />
      <Field id="exp-techs" label="Tecnologias utilizadas">
        <TechPicker
          id="exp-techs"
          technologies={technologies}
          categories={categories}
          value={v.technology_ids}
          onChange={set("technology_ids")}
          onCreated={(t) => setTechnologies((list) => [...list, t])}
        />
      </Field>
      <Footer saving={saving} />
    </form>
  );
}

export function EducationForm({ item, onDone }: { item: Education | null; onDone: () => void }) {
  const [v, setV] = useState({
    institution: item?.institution ?? "",
    degree: item?.degree ?? "",
    field: item?.field ?? "",
    start_date: item?.start_date ?? "",
    end_date: item?.end_date ?? "",
    is_current: item?.is_current ?? false,
    description: item?.description ?? "",
    visible: item?.visible ?? true,
  });
  const { errors, saving, submit } = useSubmit(onDone);
  const set = <K extends keyof typeof v>(key: K) => (value: (typeof v)[K]) => setV((s) => ({ ...s, [key]: value }));

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(() => saveEducation(item?.id ?? null, v), "Formação salva.");
      }}
    >
      <DialogHeader>
        <DialogTitle>{item ? "Editar formação" : "Nova formação"}</DialogTitle>
      </DialogHeader>
      <Text id="institution" label="Instituição" required value={v.institution} onChange={set("institution")} errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Text id="degree" label="Curso / grau" required hint="Ex.: Bacharelado, Tecnólogo" value={v.degree} onChange={set("degree")} errors={errors} />
        <Text id="field" label="Área" hint="Ex.: Sistemas de Informação" value={v.field} onChange={set("field")} errors={errors} />
        <Text id="start_date" label="Início" type="date" value={v.start_date} onChange={set("start_date")} errors={errors} />
        {!v.is_current && <Text id="end_date" label="Conclusão" type="date" value={v.end_date} onChange={set("end_date")} errors={errors} />}
      </div>
      <Current checked={v.is_current} onChange={set("is_current")} label="Em andamento" />
      <Area id="description" label="Descrição (opcional)" value={v.description} onChange={set("description")} errors={errors} />
      <Footer saving={saving} />
    </form>
  );
}

export function CertificationForm({ item, onDone }: { item: Certification | null; onDone: () => void }) {
  const [v, setV] = useState({
    name: item?.name ?? "",
    issuer: item?.issuer ?? "",
    issued_at: item?.issued_at ?? "",
    credential_id: item?.credential_id ?? "",
    credential_url: item?.credential_url ?? "",
    visible: item?.visible ?? true,
  });
  const { errors, saving, submit } = useSubmit(onDone);
  const set = <K extends keyof typeof v>(key: K) => (value: (typeof v)[K]) => setV((s) => ({ ...s, [key]: value }));

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(() => saveCertification(item?.id ?? null, v), "Certificação salva.");
      }}
    >
      <DialogHeader>
        <DialogTitle>{item ? "Editar certificação" : "Nova certificação"}</DialogTitle>
      </DialogHeader>
      <Text id="name" label="Nome" required value={v.name} onChange={set("name")} errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Text id="issuer" label="Emissor" value={v.issuer} onChange={set("issuer")} errors={errors} />
        <Text id="issued_at" label="Data de emissão" type="date" value={v.issued_at} onChange={set("issued_at")} errors={errors} />
        <Text id="credential_id" label="ID da credencial" value={v.credential_id} onChange={set("credential_id")} errors={errors} />
        <Text id="credential_url" label="URL da credencial" value={v.credential_url} onChange={set("credential_url")} errors={errors} />
      </div>
      <Footer saving={saving} />
    </form>
  );
}
