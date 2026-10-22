-- =============================================================================
-- Portfólio — schema principal
-- Leitura pública apenas do que está publicado/visível; escrita só para admins.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Administradores
-- -----------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Cada usuário só enxerga a própria linha (permite checar "sou admin?").
-- Não há políticas de escrita: admins são cadastrados via SQL Editor.
create policy "admins: ler a própria linha"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Perfil (linha única)
-- -----------------------------------------------------------------------------
create table public.profile (
  id                 smallint primary key default 1 check (id = 1),
  full_name          text not null default '',
  role_title         text not null default '',
  hero_title         text not null default '',
  hero_subtitle      text not null default '',
  bio                text not null default '',
  summary            text not null default '',
  experience_summary text not null default '',
  interests          text[] not null default '{}',
  goals              text not null default '',
  avatar_path        text,
  location           text not null default '',
  email              text not null default '',
  whatsapp           text not null default '',
  github_url         text not null default '',
  linkedin_url       text not null default '',
  resume_path        text,
  resume_updated_at  timestamptz,
  updated_at         timestamptz not null default now()
);

create trigger profile_updated_at before update on public.profile
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Configurações gerais (linha única)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id               smallint primary key default 1 check (id = 1),
  site_title       text not null default 'Portfólio',
  site_description text not null default '',
  keywords         text[] not null default '{}',
  og_image_path    text,
  show_location    boolean not null default true,
  show_whatsapp    boolean not null default false,
  updated_at       timestamptz not null default now()
);

create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Categorias
-- -----------------------------------------------------------------------------
create table public.tech_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.project_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Tecnologias
-- `visible` controla a exibição na seção "Tecnologias" do site. As
-- tecnologias ligadas a projetos publicados aparecem nesses projetos.
-- `icon` aceita um slug do Simple Icons (ex.: "react") ou uma URL https.
-- -----------------------------------------------------------------------------
create table public.technologies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text not null default '',
  category_id uuid references public.tech_categories (id) on delete set null,
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index technologies_category_idx on public.technologies (category_id);

create trigger technologies_updated_at before update on public.technologies
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Projetos
-- -----------------------------------------------------------------------------
create table public.projects (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  short_description text not null default '',
  category_id       uuid references public.project_categories (id) on delete set null,
  year              integer check (year between 1990 and 2100),
  site_url          text not null default '',
  repo_url          text not null default '',
  cover_path        text,
  cover_alt         text not null default '',
  status            text not null default 'draft' check (status in ('draft', 'published')),
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  published_at      timestamptz,
  -- Estudo de caso (todos opcionais)
  description       text not null default '',
  goal              text not null default '',
  problem           text not null default '',
  features          text not null default '',
  role              text not null default '',
  challenges        text not null default '',
  solutions         text not null default '',
  architecture      text not null default '',
  integrations      text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index projects_status_order_idx on public.projects (status, sort_order);
create index projects_category_idx on public.projects (category_id);

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- Preenche published_at na primeira publicação.
create or replace function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger projects_published_at before insert or update on public.projects
  for each row execute function public.set_published_at();

create table public.project_technologies (
  project_id    uuid not null references public.projects (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  primary key (project_id, technology_id)
);

create index project_technologies_tech_idx on public.project_technologies (technology_id);

create table public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path       text not null,
  alt        text not null default '',
  kind       text not null default 'desktop' check (kind in ('desktop', 'mobile', 'other')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index project_images_project_idx on public.project_images (project_id, sort_order);

-- -----------------------------------------------------------------------------
-- Experiência, formação e certificações
-- -----------------------------------------------------------------------------
create table public.experiences (
  id               uuid primary key default gen_random_uuid(),
  company          text not null,
  role             text not null,
  location         text not null default '',
  employment_type  text not null default '',
  start_date       date not null,
  end_date         date,
  is_current       boolean not null default false,
  description      text not null default '',
  responsibilities text not null default '',
  sort_order       integer not null default 0,
  visible          boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create trigger experiences_updated_at before update on public.experiences
  for each row execute function public.set_updated_at();

create table public.experience_technologies (
  experience_id uuid not null references public.experiences (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  primary key (experience_id, technology_id)
);

create index experience_technologies_tech_idx on public.experience_technologies (technology_id);

create table public.education (
  id          uuid primary key default gen_random_uuid(),
  institution text not null,
  degree      text not null,
  field       text not null default '',
  start_date  date,
  end_date    date,
  is_current  boolean not null default false,
  description text not null default '',
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger education_updated_at before update on public.education
  for each row execute function public.set_updated_at();

create table public.certifications (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  issuer         text not null default '',
  issued_at      date,
  credential_id  text not null default '',
  credential_url text not null default '',
  sort_order     integer not null default 0,
  visible        boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger certifications_updated_at before update on public.certifications
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profile                 enable row level security;
alter table public.site_settings           enable row level security;
alter table public.tech_categories         enable row level security;
alter table public.project_categories      enable row level security;
alter table public.technologies            enable row level security;
alter table public.projects                enable row level security;
alter table public.project_technologies    enable row level security;
alter table public.project_images          enable row level security;
alter table public.experiences             enable row level security;
alter table public.experience_technologies enable row level security;
alter table public.education               enable row level security;
alter table public.certifications          enable row level security;

-- Conteúdo de leitura pública integral
create policy "profile: leitura pública" on public.profile
  for select to anon, authenticated using (true);
create policy "site_settings: leitura pública" on public.site_settings
  for select to anon, authenticated using (true);
create policy "tech_categories: leitura pública" on public.tech_categories
  for select to anon, authenticated using (true);
create policy "project_categories: leitura pública" on public.project_categories
  for select to anon, authenticated using (true);
create policy "technologies: leitura pública" on public.technologies
  for select to anon, authenticated using (true);

-- Projetos: visitantes só veem os publicados
create policy "projects: leitura dos publicados" on public.projects
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "project_technologies: leitura dos publicados" on public.project_technologies
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

create policy "project_images: leitura dos publicados" on public.project_images
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

-- Trajetória: visitantes só veem itens visíveis
create policy "experiences: leitura dos visíveis" on public.experiences
  for select to anon, authenticated
  using (visible or (select public.is_admin()));

create policy "experience_technologies: leitura dos visíveis" on public.experience_technologies
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.visible
    )
  );

create policy "education: leitura dos visíveis" on public.education
  for select to anon, authenticated
  using (visible or (select public.is_admin()));

create policy "certifications: leitura dos visíveis" on public.certifications
  for select to anon, authenticated
  using (visible or (select public.is_admin()));

-- Escrita: somente administradores
do $$
declare
  t text;
begin
  foreach t in array array[
    'profile', 'site_settings', 'tech_categories', 'project_categories',
    'technologies', 'projects', 'project_technologies', 'project_images',
    'experiences', 'experience_technologies', 'education', 'certifications'
  ]
  loop
    execute format(
      'create policy "%1$s: admin insere" on public.%1$I for insert to authenticated with check ((select public.is_admin()))',
      t
    );
    execute format(
      'create policy "%1$s: admin atualiza" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
    execute format(
      'create policy "%1$s: admin exclui" on public.%1$I for delete to authenticated using ((select public.is_admin()))',
      t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Reordenação em lote (usada pelo drag-and-drop do painel)
-- -----------------------------------------------------------------------------
create or replace function public.reorder_items(p_table text, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_table not in (
    'projects', 'technologies', 'tech_categories', 'project_categories',
    'experiences', 'education', 'certifications', 'project_images'
  ) then
    raise exception 'invalid table %', p_table;
  end if;

  execute format(
    'update public.%I as t set sort_order = o.ord - 1
       from unnest($1) with ordinality as o(id, ord)
      where t.id = o.id',
    p_table
  ) using p_ids;
end;
$$;

revoke all on function public.reorder_items(text, uuid[]) from public;
grant execute on function public.reorder_items(text, uuid[]) to authenticated;
