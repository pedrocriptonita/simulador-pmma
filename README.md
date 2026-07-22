# Simulador PM MA 2026

Plataforma SaaS de preparação para o concurso da Polícia Militar do Maranhão (Edital nº 1 — PMMA/2026). Simulados no formato Cebraspe (Certo/Errado) com **nota líquida** (acertos − erros), dashboard de desempenho por matéria e biblioteca de resumos em PDF.

**Prova:** 11/10/2026 · **Banca:** Cebraspe · **1.000 vagas**

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- Supabase (Postgres + Auth + Storage)
- Prisma (ORM)
- Deploy: Vercel · Pagamento: checkout externo via webhook

## Setup local

Pré-requisitos: Node.js 20+ e npm.

```bash
# 1. Instalar dependências
npm install

# 2. Variáveis de ambiente
#    Copie .env.example para .env.local e preencha com as chaves
#    do seu projeto Supabase (a partir da Fase 2)
cp .env.example .env.local

# 3. Rodar em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Descrição                   |
| ---------------------- | --------------------------- |
| `npm run dev`          | Servidor de desenvolvimento |
| `npm run build`        | Build de produção           |
| `npm run start`        | Servir build de produção    |
| `npm run lint`         | ESLint                      |
| `npm run typecheck`    | Checagem de tipos (tsc)     |
| `npm run format`       | Formatar com Prettier       |
| `npm run format:check` | Verificar formatação        |

## Estrutura de pastas

```
src/
  app/                  # rotas (App Router)
    (auth)/             # grupo: login, cadastro, recuperar senha
    (app)/              # grupo: área logada (dashboard, simulados, pdfs, planos)
    admin/              # painel administrativo
    api/                # route handlers (webhook, etc.)
  components/           # componentes compartilhados (ui/ = shadcn)
  features/             # código por feature (exam, dashboard, pdf, billing)
  lib/                  # supabase client, prisma client, utils
  services/             # regras de negócio server-side
prisma/
  schema.prisma         # modelos do banco (a partir da Fase 2)
```

## CI/CD e Deploy

- **CI:** GitHub Actions roda lint + typecheck + build em cada PR e push na `main` (`.github/workflows/ci.yml`).
- **Deploy:** conectar o repositório GitHub à [Vercel](https://vercel.com) — preview em PRs, produção na `main`. Configurar as variáveis do `.env.example` no painel da Vercel.

## Roadmap

Desenvolvimento por Vertical Slices (ver `roadmap-simulador-pmma.md` na raiz do repositório de planejamento):

1. ✅ **Fase 1** — Setup inicial (projeto, CI, deploy placeholder)
2. ⏳ **Fase 2** — Autenticação (Supabase Auth + Prisma + RLS)
3. ⏳ **Fase 3** — Simulados com correção Cebraspe
4. ⏳ **Fase 4** — Dashboard de desempenho + biblioteca de PDFs
5. ⏳ **Fase 5** — UI shell e refatoração
6. ⏳ **Fase 6** — Billing (checkout externo + webhook)
7. ⏳ **Fase 7** — Polimento (performance, segurança, SEO)
