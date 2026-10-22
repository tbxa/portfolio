import { AwardIcon, ExternalLinkIcon, GraduationCapIcon } from "lucide-react";

import { Section } from "@/components/public/section";
import { Reveal } from "@/components/shared/reveal";
import { RichText } from "@/components/shared/rich-text";
import { TechIcon } from "@/components/shared/tech-icon";
import { formatMonthYear, formatPeriod, toLines } from "@/lib/format";
import type { Certification, Education, Experience } from "@/types";

export function ExperienceSection({
  experiences,
  education,
  certifications,
  index,
}: {
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  index: number;
}) {
  return (
    <Section id="experiencia" index={index} title="Experiência e formação">
      {experiences.length > 0 && (
        <ol className="relative space-y-10 border-l pl-6 sm:pl-8">
          {experiences.map((exp, i) => {
            const responsibilities = toLines(exp.responsibilities);
            return (
              <li key={exp.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[calc(1.5rem+5px)] size-2.5 rounded-full border-2 border-background bg-brand sm:-left-[calc(2rem+5px)]"
                />
                <Reveal delay={Math.min(i * 0.05, 0.2)}>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatPeriod(exp.start_date, exp.end_date, exp.is_current)}
                    {exp.employment_type && ` · ${exp.employment_type}`}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold">
                    {exp.role} <span className="font-normal text-muted-foreground">· {exp.company}</span>
                  </h3>
                  <RichText text={exp.description} className="mt-3 max-w-3xl" />
                  {responsibilities.length > 0 && (
                    <div className="mt-4 max-w-3xl">
                      <h4 className="mb-2 text-sm font-medium">Principais responsabilidades</h4>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground marker:text-brand">
                        {responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exp.technologies.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tecnologias utilizadas">
                      {exp.technologies.map((t) => (
                        <li
                          key={t.id}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground"
                        >
                          <TechIcon name={t.name} icon={t.icon} className="size-3" />
                          {t.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ol>
      )}

      {(education.length > 0 || certifications.length > 0) && (
        <div className={`grid gap-6 lg:grid-cols-2 ${experiences.length ? "mt-16" : ""}`}>
          {education.length > 0 && (
            <Reveal className="rounded-xl border bg-card/50 p-6">
              <h3 className="mb-5 flex items-center gap-2 font-semibold">
                <GraduationCapIcon className="size-4 text-brand" aria-hidden="true" /> Formação acadêmica
              </h3>
              <ul className="space-y-5">
                {education.map((ed) => (
                  <li key={ed.id}>
                    <p className="font-medium">
                      {ed.degree}
                      {ed.field && <span className="text-muted-foreground"> em {ed.field}</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{ed.institution}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {formatPeriod(ed.start_date, ed.end_date, ed.is_current)}
                    </p>
                    {ed.description && <RichText text={ed.description} className="mt-2 text-sm" />}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {certifications.length > 0 && (
            <Reveal delay={0.05} className="rounded-xl border bg-card/50 p-6">
              <h3 className="mb-5 flex items-center gap-2 font-semibold">
                <AwardIcon className="size-4 text-brand" aria-hidden="true" /> Certificações
              </h3>
              <ul className="space-y-4">
                {certifications.map((cert) => (
                  <li key={cert.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[cert.issuer, formatMonthYear(cert.issued_at)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        aria-label={`Ver credencial de ${cert.name} (abre em nova aba)`}
                      >
                        Credencial <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      )}
    </Section>
  );
}
