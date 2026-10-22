-- =============================================================================
-- Dados iniciais
-- Perfil e configurações começam vazios: nada de informações inventadas.
-- As tecnologias sugeridas entram OCULTAS (visible = false) e só aparecem na
-- seção "Tecnologias" depois que você confirmar cada uma no painel.
-- =============================================================================

insert into public.profile (id) values (1) on conflict (id) do nothing;
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.tech_categories (name, slug, sort_order) values
  ('Frontend',       'frontend',       0),
  ('Backend',        'backend',        1),
  ('Banco de dados', 'banco-de-dados', 2),
  ('Ferramentas',    'ferramentas',    3)
on conflict (slug) do nothing;

insert into public.project_categories (name, slug, sort_order) values
  ('Frontend',            'frontend',            0),
  ('Full Stack',          'full-stack',          1),
  ('Sistema web',         'sistema-web',         2),
  ('Landing page',        'landing-page',        3),
  ('Site institucional',  'site-institucional',  4)
on conflict (slug) do nothing;

insert into public.technologies (name, slug, icon, category_id, sort_order, visible)
select t.name, t.slug, t.icon, c.id, t.sort_order, false
from (values
  ('HTML5',        'html5',        'html5',        'frontend',       0),
  ('CSS3',         'css3',         'css',          'frontend',       1),
  ('JavaScript',   'javascript',   'javascript',   'frontend',       2),
  ('TypeScript',   'typescript',   'typescript',   'frontend',       3),
  ('React',        'react',        'react',        'frontend',       4),
  ('Next.js',      'nextjs',       'nextdotjs',    'frontend',       5),
  ('Tailwind CSS', 'tailwind-css', 'tailwindcss',  'frontend',       6),
  ('Node.js',      'nodejs',       'nodedotjs',    'backend',        0),
  ('APIs REST',    'apis-rest',    '',             'backend',        1),
  ('PostgreSQL',   'postgresql',   'postgresql',   'banco-de-dados', 0),
  ('Supabase',     'supabase',     'supabase',     'banco-de-dados', 1),
  ('Git',          'git',          'git',          'ferramentas',    0),
  ('GitHub',       'github',       'github',       'ferramentas',    1),
  ('VS Code',      'vscode',       '',             'ferramentas',    2),
  ('Vercel',       'vercel',       'vercel',       'ferramentas',    3)
) as t(name, slug, icon, category_slug, sort_order)
join public.tech_categories c on c.slug = t.category_slug
on conflict (slug) do nothing;
