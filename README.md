# Portfólio

Portfólio profissional de desenvolvedor, totalmente administrável por um painel em `/admin`.
Novos projetos aparecem no site assim que são publicados, sem novo deploy.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Motion,
Supabase (Postgres, Auth, Storage) e Vercel.

## Funcionalidades

- Seções públicas: apresentação, sobre mim, tecnologias, projetos com filtros por categoria e
  tecnologia, experiência/formação/certificações e contato.
- Página técnica de cada projeto em `/projetos/[slug]`, com estudo de caso, stack e galeria
  desktop/mobile.
- Painel `/admin`: dashboard, projetos (criar, editar, duplicar, publicar, despublicar, excluir,
  reordenar), tecnologias e categorias, perfil, trajetória, currículo em PDF e configurações de SEO.
- Captura automática de screenshot (Microlink), com validação de URL e proteção contra SSRF.
- SEO: metadados dinâmicos, sitemap, robots, imagem Open Graph gerada e JSON-LD.
- Link permanente do currículo: `/curriculo` sempre abre o PDF mais recente.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev
```

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode os arquivos de `supabase/migrations/` **em ordem**:
   - `20261019000001_schema.sql`: tabelas, RLS e funções.
   - `20261019000002_storage.sql`: buckets `media` e `resume` com políticas.
   - `20261019000003_seed.sql`: categorias e tecnologias sugeridas (entram **ocultas**).
3. Em **Authentication → Users**, crie seu usuário (e-mail e senha).
4. Em **Authentication → Sign In / Providers**, desative "Allow new users to sign up".
5. Torne seu usuário administrador:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'seu-email@exemplo.com';
   ```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Chave `anon` pública. A proteção dos dados é feita pelo RLS |
| `NEXT_PUBLIC_SITE_URL` | sim | URL pública do site, usada no SEO e no sitemap |
| `MICROLINK_API_KEY` | não | Chave do plano pago do Microlink. Sem ela, usa o plano gratuito (~50 capturas/dia) |

A chave `service_role` **não** é usada nem deve ser configurada.

## Deploy na Vercel

1. Envie o repositório para o GitHub.
2. Na Vercel: **Add New → Project**, importe o repositório (framework detectado: Next.js).
3. Em **Environment Variables**, cadastre as variáveis acima. `NEXT_PUBLIC_SITE_URL` deve ser o
   domínio final (ex.: `https://seunome.dev`).
4. Clique em **Deploy**.
5. No Supabase, em **Authentication → URL Configuration**, adicione o domínio da Vercel em
   *Site URL* / *Redirect URLs*.

As variáveis `NEXT_PUBLIC_*` são embutidas no build: se mudá-las, faça um novo deploy.

## Segurança

- Leitura pública só do que está publicado/visível; escrita apenas para quem está na tabela
  `admins` (RLS em todas as tabelas e nos buckets).
- Três camadas no painel: `proxy.ts` (sessão), layout do painel (`is_admin`) e cada Server Action.
- Uploads vão direto do navegador ao Storage, limitados por tipo e tamanho no bucket.
- A captura de screenshot rejeita esquemas diferentes de http(s), credenciais na URL, portas não
  padrão, nomes internos e domínios que resolvem para IPs privados ou reservados.

## Scripts

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Vitest
```
