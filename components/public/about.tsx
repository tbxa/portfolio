import { GraduationCapIcon, MapPinIcon, TargetIcon } from "lucide-react";
import Image from "next/image";

import { Section } from "@/components/public/section";
import { Reveal } from "@/components/shared/reveal";
import { RichText } from "@/components/shared/rich-text";
import { Badge } from "@/components/ui/badge";
import { storageUrl } from "@/lib/storage";
import type { Education, Profile } from "@/types";

export function About({
  index,
  profile,
  education,
  showLocation,
}: {
  index: number;
  profile: Profile;
  education: Education[];
  showLocation: boolean;
}) {
  const avatar = storageUrl(profile.avatar_path);
  const mainEducation = education[0];

  return (
    <Section id="sobre" index={index} title="Sobre mim">
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <Reveal className="space-y-6">
          {profile.summary && (
            <p className="text-xl leading-relaxed text-pretty text-foreground">{profile.summary}</p>
          )}
          <RichText text={profile.bio} className="text-base" />
          {profile.experience_summary && (
            <div>
              <h3 className="mb-2 font-medium">Experiência na área</h3>
              <RichText text={profile.experience_summary} />
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="space-y-6">
          {avatar && (
            <div className="relative aspect-square w-40 overflow-hidden rounded-2xl border bg-muted lg:w-full">
              <Image
                src={avatar}
                alt={`Foto de ${profile.full_name || "perfil"}`}
                fill
                sizes="(min-width: 1024px) 20rem, 10rem"
                className="object-cover"
              />
            </div>
          )}

          <dl className="space-y-5 text-sm">
            {profile.full_name && (
              <div>
                <dt className="font-mono text-xs text-muted-foreground uppercase">Nome</dt>
                <dd className="mt-1 font-medium">{profile.full_name}</dd>
              </div>
            )}
            {mainEducation && (
              <div>
                <dt className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase">
                  <GraduationCapIcon className="size-3.5" aria-hidden="true" /> Formação
                </dt>
                <dd className="mt-1">
                  <span className="font-medium">{mainEducation.degree}</span>
                  {mainEducation.field && ` em ${mainEducation.field}`}
                  <span className="block text-muted-foreground">{mainEducation.institution}</span>
                </dd>
              </div>
            )}
            {showLocation && profile.location && (
              <div>
                <dt className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase">
                  <MapPinIcon className="size-3.5" aria-hidden="true" /> Localização
                </dt>
                <dd className="mt-1">{profile.location}</dd>
              </div>
            )}
            {profile.interests.length > 0 && (
              <div>
                <dt className="font-mono text-xs text-muted-foreground uppercase">Áreas de interesse</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
            {profile.goals && (
              <div>
                <dt className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase">
                  <TargetIcon className="size-3.5" aria-hidden="true" /> Objetivos profissionais
                </dt>
                <dd className="mt-1 leading-relaxed text-muted-foreground">{profile.goals}</dd>
              </div>
            )}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
