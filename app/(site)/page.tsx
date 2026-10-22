import { About } from "@/components/public/about";
import { Contact } from "@/components/public/contact";
import { ExperienceSection } from "@/components/public/experience";
import { Hero } from "@/components/public/hero";
import { ProjectsShowcase } from "@/components/public/projects-showcase";
import { Section } from "@/components/public/section";
import { Skills } from "@/components/public/skills";
import { JsonLd } from "@/components/shared/json-ld";
import {
  getCertifications,
  getEducation,
  getExperiences,
  getProfile,
  getPublishedProjects,
  getSettings,
  getSkillGroups,
} from "@/lib/data/public";
import { publicEnv } from "@/lib/env";
import { storageUrl } from "@/lib/storage";
import type { ProjectCardData } from "@/types";

export default async function HomePage() {
  const [profile, settings, skills, projects, experiences, education, certifications] = await Promise.all([
    getProfile(),
    getSettings(),
    getSkillGroups(),
    getPublishedProjects(),
    getExperiences(),
    getEducation(),
    getCertifications(),
  ]);

  const cards: ProjectCardData[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    short_description: p.short_description,
    category: p.category,
    year: p.year,
    site_url: p.site_url,
    repo_url: p.repo_url,
    cover_path: p.cover_path,
    featured: p.featured,
    technologies: p.technologies,
  }));

  const hasAbout = Boolean(profile.summary || profile.bio || profile.experience_summary || profile.goals);
  const hasTimeline = experiences.length + education.length + certifications.length > 0;

  // Numeração das seções acompanha apenas as que estão visíveis.
  let index = 0;
  const next = () => ++index;
  const aboutIndex = hasAbout ? next() : 0;
  const skillsIndex = skills.length ? next() : 0;
  const projectsIndex = next();
  const timelineIndex = hasTimeline ? next() : 0;
  const contactIndex = next();

  const sameAs = [profile.github_url, profile.linkedin_url].filter(Boolean);

  return (
    <>
      {profile.full_name && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.full_name,
            jobTitle: profile.role_title || undefined,
            description: profile.summary || undefined,
            url: publicEnv.siteUrl,
            image: storageUrl(profile.avatar_path) ?? undefined,
            email: profile.email ? `mailto:${profile.email}` : undefined,
            sameAs: sameAs.length ? sameAs : undefined,
            knowsAbout: skills.flatMap((g) => g.technologies.map((t) => t.name)),
          }}
        />
      )}

      <Hero profile={profile} hasProjects={cards.length > 0} />
      {hasAbout && (
        <About index={aboutIndex} profile={profile} education={education} showLocation={settings.show_location} />
      )}
      {skills.length > 0 && <Skills index={skillsIndex} groups={skills} />}

      <Section
        id="projetos"
        index={projectsIndex}
        title="Projetos"
        description="Sites e aplicações que desenvolvi. Abra a versão publicada, veja o código-fonte quando disponível ou consulte os detalhes técnicos."
        className="border-y bg-muted/20"
      >
        {cards.length ? (
          <ProjectsShowcase projects={cards} />
        ) : (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Os projetos serão publicados em breve.
          </p>
        )}
      </Section>

      {hasTimeline && (
        <ExperienceSection
          index={timelineIndex}
          experiences={experiences}
          education={education}
          certifications={certifications}
        />
      )}
      <Contact profile={profile} settings={settings} index={contactIndex} />
    </>
  );
}
