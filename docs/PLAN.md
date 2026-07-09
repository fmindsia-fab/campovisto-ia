# CampoVisto.IA — Plano de Execução

**Abordagem:** Interface primeiro, backend depois. Cada milestone entrega uma fatia vertical funcional: UI com dados mock → integração real com Supabase → RLS e segurança.

**Regra de progresso:** Nenhum milestone começa sem o anterior estar verificado e funcionando.

---

## Visão geral dos milestones

| # | Nome | Branch | Foco |
|---|---|---|---|
| ~~M0~~ | ~~Setup & Infraestrutura~~ | `main` | ✅ **Concluído** |
| ~~M1~~ | ~~Design System & Layout~~ | `feat/design-system` | ✅ **Concluído** |
| ~~M2~~ | ~~Autenticação~~ | `feat/auth` | ✅ **Concluído** |
| ~~M3~~ | ~~Clientes & Propriedades~~ | `feat/clients-properties` | ✅ **Concluído** |
| ~~M4~~ | ~~Vistorias & Upload de Imagens~~ | `feat/inspections` | ✅ **Concluído** |
| ~~M5~~ | ~~Editor Visual de Anotações~~ | `feat/image-editor` | ✅ **Concluído** |
| ~~M6~~ | ~~Análise de IA & Revisão Humana~~ | `main` | ✅ **Concluído** |
| ~~M7~~ | ~~Relatórios & Exportação PDF~~ | `main` | ✅ **Concluído** |
| ~~M8~~ | ~~Atividades & Kanban~~ | `main` | ✅ **Concluído** |
| ~~M9~~ | ~~Calendário~~ | `main` | ✅ **Concluído** |
| ~~M10~~ | ~~Dashboard & Notificações~~ | `main` | ✅ **Concluído** |
| ~~M11~~ | ~~Busca & Filtros~~ | `main` | ✅ **Concluído** |
| ~~M12~~ | ~~Onboarding~~ | `main` | ✅ **Concluído** |
| M13 | Planos Free/Premium | `feat/plans` | Limites, upgrade, scaffold Stripe |
| M14 | Configurações & Permissões | `feat/settings` | Perfil, equipe, papéis |
| M15 | Polimento, Auditoria & Deploy | `feat/polish` | Responsividade, segurança, produção |

---

## ✅ M0 — Setup & Infraestrutura — CONCLUÍDO

**Branch:** `main` | **Commits:** `5f373f8`, `151febe`

**Build:** ✅ `npm run build` — exit code 0, 13 rotas, zero erros TypeScript

### Entregas

**Projeto**
- [x] Next.js 15 com TypeScript, Tailwind CSS v3, App Router — setup manual (diretório não vazio)
- [x] `tsconfig.json` com `strict: true`
- [x] ESLint + Prettier + `prettier-plugin-tailwindcss` configurados
- [x] Estrutura de pastas criada conforme `CLAUDE.md`
- [x] `.gitattributes` com normalização LF

**shadcn/ui**
- [x] `components.json` configurado (RSC, TSX, aliases corretos)
- [x] 12 componentes instalados: `button`, `card`, `input`, `label`, `textarea`, `select`, `dialog`, `dropdown-menu`, `badge`, `separator`, `avatar`, `sonner`

**Supabase**
- [x] `lib/supabase/client.ts` — cliente browser
- [x] `lib/supabase/server.ts` — cliente server com tipos corretos
- [x] `lib/supabase/middleware.ts` — refresh de sessão com tipagem `NonNullable<CookieMethodsServer['setAll']>`
- [x] `middleware.ts` na raiz com proteção de rotas autenticadas
- [x] ⏳ Projeto criado no Supabase Dashboard (ação do usuário)
- [x] ⏳ `.env.local` com `SUPABASE_URL` e `SUPABASE_ANON_KEY` (ação do usuário)

**Tipos TypeScript**
- [x] `types/index.ts` — interfaces completas de todas as 18 entidades do PRD
- [x] `types/database.ts` — placeholder aguardando `supabase gen types typescript`

**Vercel / GitHub**
- [x] Repositório `fmindsia-fab/campovisto-ia` criado no GitHub
- [x] Remote adicionado e push para `main`
- [x] Projeto conectado na Vercel
- [x] Variáveis de ambiente configuradas na Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Commits
```
5f373f8  feat: M0 — project setup, Next.js, Supabase, shadcn/ui, TypeScript strict, Vercel-ready
151febe  fix: TypeScript strict types for Supabase SSR cookie callbacks
```

---

## ✅ M1 — Design System & Layout Base — CONCLUÍDO

**Branch:** `feat/design-system` | **Commit:** `a0f64f1`

**Build:** ✅ `npm run build` — exit code 0, 15 rotas, zero erros TypeScript

### Entregas

**Tema & Tokens**
- [x] Cores definidas em `tailwind.config.ts`: brand-green `#16a34a`, brand-purple `#7c3aed`, brand-blue `#2563eb`
- [x] Fonte Inter configurada em `app/layout.tsx`
- [x] `globals.css` com CSS variables do shadcn — primary = green (`142.1 76.2% 36.3%`)

**Layout da Aplicação**
- [x] `components/shared/app-layout.tsx` — wrapper com sidebar + topbar + main
- [x] `components/shared/sidebar.tsx` — navegação lateral com `usePathname`, highlight de rota ativa, logo + 7 itens + settings no rodapé
- [x] `components/shared/topbar.tsx` — sino de notificação + avatar (logo mobile responsivo)
- [x] `components/shared/page-header.tsx` — título, descrição e slot de ação
- [x] `components/shared/empty-state.tsx` — ícone, título, descrição e ação opcional
- [x] `components/shared/loading-skeleton.tsx` — `Skeleton`, `CardSkeleton`, `ListSkeleton`, `StatGridSkeleton`

**Componentes de Cards**
- [x] `components/shared/stat-card.tsx` — card de métrica com ícone, valor, descrição
- [x] `components/shared/entity-card.tsx` — card genérico com badge, meta e onClick

**Navegação funcional (mock)**
- [x] Todas as rotas da `(app)/` criadas com `PageHeader` + `EmptyState` reais
- [x] Sidebar com links ativos e estados hover/selected
- [x] Rotas: `/dashboard`, `/clients`, `/properties`, `/inspections`, `/reports`, `/activities`, `/calendar`, `/settings`
- [x] `app/(app)/layout.tsx` atualizado para usar `AppLayout`

**Páginas de erro e estado**
- [x] `app/not-found.tsx` — 404 com link para dashboard
- [x] `app/error.tsx` — erro com botão de reset (`'use client'`)
- [x] `app/loading.tsx` — spinner centralizado

### Commits
```
a0f64f1  feat(M1): design system & layout base
```

---

## ✅ M2 — Autenticação — CONCLUÍDO

**Branch:** `feat/auth` → mergeado em `main` | **Commit:** `1194e9a`

**Build:** ✅ `npm run build` — exit code 0, 16 rotas, zero erros TypeScript

### Entregas

**UI**
- [x] `app/(auth)/login/page.tsx` + `login-form.tsx` — formulário e-mail + senha com feedback de erro
- [x] `app/(auth)/signup/page.tsx` + `signup-form.tsx` — formulário de cadastro com confirmação
- [x] `app/(auth)/forgot-password/page.tsx` + form — solicitar reset de senha
- [x] `app/(auth)/reset-password/page.tsx` + form — nova senha via link
- [x] `app/(auth)/layout.tsx` — split-screen: painel verde com branding à esquerda, formulário à direita

**Backend — Banco**
- [x] Migration `001_auth_roles.sql` executada no Supabase:
  - Tabela `profiles` (id, full_name, avatar_url, phone, onboarding_step, created_at)
  - Tabela `roles` (id, name, description)
  - Tabela `user_roles` (user_id, role_id) — many-to-many
  - Seed: 5 roles (`admin`, `field_operator`, `drone_pilot`, `human_reviewer`, `client`)
  - Trigger `on_auth_user_created` — cria profile + atribui `field_operator` automaticamente
- [x] RLS em `profiles`, `roles` e `user_roles`

**Backend — Integração**
- [x] `lib/auth/actions.ts` — `signIn`, `signUp`, `signOut`, `forgotPassword`, `resetPassword`
- [x] `middleware.ts` — redireciona para `/login` se não autenticado, `/dashboard` se autenticado em rota pública
- [x] `lib/auth/get-current-user.ts` — retorna user + profile + roles
- [x] `lib/auth/has-role.ts` — helper de verificação de roles
- [x] `components/shared/topbar.tsx` — dropdown com iniciais, e-mail, link settings e botão sair
- [ ] `app/(app)/settings/profile/page.tsx` — editar perfil (adiado para M14)

**Vercel**
- [x] `NEXT_PUBLIC_SITE_URL=https://campovisto-ia.vercel.app` adicionado na Vercel

### Commits
```
1194e9a  feat(M2): authentication — Supabase Auth, roles system, protected routes
```

---

## ✅ M3 — Clientes & Propriedades — CONCLUÍDO

**Branch:** `feat/clients-properties` → mergeado em `main` | **Commits:** `bfcadd7`, `82c4957`, `5c692d7`, `86d0988`, `4ae7120`

**Build:** ✅ Deploy na Vercel — CRUD completo verificado em produção

### Entregas

**UI — Clientes**
- [x] `app/(app)/clients/page.tsx` — lista com busca e botão criar
- [x] `components/clients/client-card.tsx` — card com nome, cidade, contagem de propriedades, edit/delete
- [x] `components/clients/client-form.tsx` — modal create/edit
- [x] `app/(app)/clients/[id]/page.tsx` — detalhe do cliente com lista de propriedades
- [x] `app/(app)/clients/[id]/client-properties-list.tsx` — Client Component isolado
- [x] `app/(app)/clients/[id]/add-property-button.tsx` — botão + formulário inline

**UI — Propriedades**
- [x] `app/(app)/properties/page.tsx` — lista geral com busca
- [x] `components/properties/property-card.tsx` — card com nome, cliente, tipo, edit/delete
- [x] `components/properties/property-form.tsx` — modal create/edit com Select de tipo de atividade
- [x] `app/(app)/properties/[id]/page.tsx` — detalhe da propriedade (vistorias no M4)

**Backend — Banco**
- [x] Migration `002_clients_properties.sql` executada no Supabase
- [x] Migration `003_fix_rls_recursion.sql` — função `has_role()` security definer corrigindo loop infinito
- [x] RLS em `clients` e `properties`

**Backend — Server Actions**
- [x] `lib/clients/actions.ts` — createClient_, updateClient, deleteClient, getClients, getClient
- [x] `lib/properties/actions.ts` — createProperty, updateProperty, deleteProperty, getProperties, getProperty

### Commits
```
bfcadd7  feat(M3): clients & properties — CRUD, list, detail pages, RLS, migration
82c4957  fix: Server Component cannot pass event handlers — extract ClientPropertiesList
5c692d7  fix: remove revalidatePath from actions, use router.refresh() on client
86d0988  fix(M3): add error feedback on delete, expose RLS errors via alert
4ae7120  fix(M3): remove revalidatePath leftovers, fix ActivityType to string
```

---

## ✅ M4 — Vistorias & Upload de Imagens — CONCLUÍDO

**Branch:** `main` | **Commits:** `1ed83c1`, `afc308c`, `5c90c89`, `41a4c22`

**Build:** ✅ Deploy na Vercel — CRUD e upload verificados em produção

### Entregas

**UI — Vistorias**
- [x] `app/(app)/inspections/page.tsx` — lista com filtro por status
- [x] `components/inspections/inspection-card.tsx` — card com propriedade, data, status, edit/delete
- [x] `components/inspections/inspection-form.tsx` — modal create/edit
- [x] `app/(app)/inspections/[id]/page.tsx` — detalhe com painel de próximas etapas
- [x] `app/(app)/inspections/[id]/inspection-image-section.tsx` — Client Component de galeria + upload

**UI — Upload & Galeria**
- [x] `components/inspections/image-uploader.tsx` — drag & drop, preview, múltiplos arquivos, insert via browser client
- [x] `components/inspections/image-card.tsx` — thumbnail com tipo, observações, edit inline, delete

**UI — Propriedade**
- [x] `app/(app)/properties/[id]/page.tsx` — lista vistorias reais da propriedade
- [x] `app/(app)/properties/[id]/add-inspection-button.tsx` — botão + modal inline

**Backend — Banco**
- [x] Migration `004_inspections.sql` — tabelas `inspections` e `inspection_images` com RLS
- [x] RLS corrigida para usar `auth.uid() is not null`

**Backend — Storage**
- [x] Buckets `drone-images` e `field-photos` criados com políticas SELECT + INSERT para authenticated

**Backend — Actions**
- [x] `lib/inspections/actions.ts` — create, update, delete, getInspections, getInspection
- [x] `lib/inspection-images/actions.ts` — updateImageMeta, deleteImage, getInspectionImages

### Commits
```
1ed83c1  feat(M4): inspections & image upload — CRUD, Supabase Storage, gallery, field observations
afc308c  fix(M4): resolve ESLint warnings blocking Vercel build
5c90c89  fix(M4): remove unused imports and fix ternary expressions for Vercel build
41a4c22  fix(M4): insert inspection_images via browser client to respect auth session
```

---

## ✅ M5 — Editor Visual de Anotações — CONCLUÍDO

**Branch:** `feat/image-editor` | **Commits:** `c957077` + anteriores M5

**Build:** ✅ Deploy na Vercel — editor full-screen verificado em produção

### Entregas

**UI — Editor**
- [x] `app/(editor)/layout.tsx` — route group sem sidebar, h-screen full-screen
- [x] `app/(editor)/inspections/[id]/images/[imageId]/editor/page.tsx` — Server Component: busca imagem, anotações, URL pública
- [x] `app/(editor)/inspections/[id]/images/[imageId]/editor/annotation-editor.tsx` — Client Component com estado completo
- [x] `components/editor/annotation-canvas.tsx` — canvas React Konva com imagem + marcadores numerados coloridos
- [x] `components/editor/marker-panel.tsx` — painel lateral com lista de marcadores, badge de prioridade
- [x] `components/editor/marker-form.tsx` — formulário por marcador: categoria, descrição, prioridade, confiança
- [x] Toolbar: voltar, zoom in/out, adicionar marcador, salvar
- [x] Cores dos marcadores por prioridade: vermelho (alta), âmbar (média), verde (baixa)
- [x] Marcador selecionado destacado com borda branca + sombra

**Backend — Banco**
- [x] Migration `005_annotations.sql` — tabela `image_annotations` com check constraints e RLS
- [x] `MarkerData` adicionado a `types/index.ts`

**Backend — Actions**
- [x] `lib/annotations/actions.ts` — `saveAnnotations` (delete + reinsert), `getAnnotations`

### Commits
```
c957077  feat(M5): annotation editor — move to (editor) route group, fix MarkerData import
```

---

## ✅ M6 — Análise de IA & Revisão Humana — CONCLUÍDO

**Branch:** `main` | **Commits:** `91e8936` + série `feat(M6)`/`fix(M6)`

**Build:** ✅ Deploy na Vercel — fluxo de análise e revisão verificado em produção

### Entregas

**UI**
- [x] `components/ai/analysis-request-button.tsx` — botão "Solicitar análise por IA" (em vez de botão inline na página de detalhe)
- [ ] `components/ai/analysis-loading.tsx` — não criado como componente isolado (loading tratado inline no botão/estado do client component)
- [x] `components/ai/analysis-result.tsx` — exibe resultado: elementos visíveis, pontos de atenção, limitações, texto sugerido
- [x] Badge de status visível: `Rascunho` / `Revisão Pendente` / `Aprovado` / `Rejeitado` (via `STATUS_CONFIG` em `analysis-result.tsx`)
- [x] Revisão humana (aprovar/rejeitar/editar texto) — implementada dentro de `analysis-result.tsx`, não como `human-review-panel.tsx` separado
- [x] Bloqueio do botão "Gerar Relatório" — `generate-report-button.tsx` só habilita com análise aprovada

**Backend — Banco**
- [x] Migration `006_ai_analyses.sql` — tabela `ai_analyses` com todos os campos planejados (status inclui `review_pending` além de draft/approved/rejected)
- [x] Migration `007_add_spectral_image_types.sql`, `009_annotations_spectral_categories.sql` — extensões (tipos de imagem multiespectral NDVI/NDRE/EVI/SAVI/NDWI, não previstas no plano original mas adicionadas ao escopo M6)
- [x] RLS em `ai_analyses` — update restrito a `human_reviewer`/`admin` (migration `010_ai_analyses_reviewer_rls.sql`, corrigindo policy antiga que aceitava qualquer autenticado)
- [x] Migration `011_grant_admin_existing_users.sql` — concede `admin` a usuários já existentes, já que a UI de gestão de papéis só chega no M14; sem isso ninguém conseguiria aprovar análises após a correção de RLS acima

**Backend — API & Actions**
- [x] `app/api/ai/analyze-image/route.ts` — POST handler
- [x] `lib/ai/openai.ts` — cliente OpenAI Vision (Gemini não usado — decisão de implementação)
- [x] Prompt de sistema com suporte a contagem de gado/pecuária e tipos espectrais
- [x] `lib/ai-analyses/actions.ts` — `approveAnalysis`, `rejectAnalysis`, `updateSuggestedText` (equivalentes a approve/reject/update-text do plano); todas agora chamam `requireReviewer()` — retornam erro se o usuário não tiver papel `human_reviewer`/`admin`
- [x] `components/ai/analysis-result.tsx` — painel de revisão (aprovar/rejeitar/editar) só é exibido a quem tem papel de revisor (`canReview`); demais usuários veem "Aguardando revisão por um revisor humano ou administrador"

### Commits
```
91e8936  feat(M6): AI analysis — OpenAI Vision, draft/approve workflow, human review
977319e  feat(M6): add multiespectral image types (NDVI/NDRE/EVI/SAVI/NDWI)
+ demais fix(M6)/feat(M6) de ajuste de prompt, tradução e UI
```

### ✅ Correção aplicada (2026-07-02)
Falha crítica identificada em análise de código — qualquer usuário autenticado conseguia aprovar/rejeitar a própria análise de IA, sem checagem de papel `human_reviewer`/`admin` (nem no RLS, nem nas Server Actions). **Corrigido:**
- Migration `010_ai_analyses_reviewer_rls.sql` — RLS de update em `ai_analyses` agora exige `has_role('human_reviewer')` ou `has_role('admin')`
- Migration `011_grant_admin_existing_users.sql` — concede `admin` a usuários existentes (não há UI de papéis até M14)
- `lib/ai-analyses/actions.ts` — `approveAnalysis`, `rejectAnalysis`, `updateSuggestedText` validam papel via `requireReviewer()` antes de tocar o banco
- `components/ai/analysis-result.tsx` + `app/(app)/inspections/[id]/images/[imageId]/page.tsx` — painel de revisão só aparece para quem tem permissão
- Build (`npm run build`) verificado: 0 erros, 0 warnings

### ✅ Correção aplicada (2026-07-02) — bug de exibição do tipo de imagem
Testado em produção: o campo "Tipo" na página de detalhe da imagem mostrava o valor cru salvo no banco (ex. `pasture`) em vez do label em português (`Pastagem`). Causa raiz: `components/inspections/image-type-selector.tsx` tinha `'use client'` no topo e exportava, junto do componente interativo, as constantes `RGB_TYPES`/`SPECTRAL_TYPES`/`ALL_IMAGE_TYPE_LABELS`. Ao importar essas constantes num Server Component (`app/(app)/inspections/[id]/images/[imageId]/page.tsx`), o Next.js as trata como client reference, e o lookup falha silenciosamente, caindo no fallback do valor bruto. **Corrigido:** constantes extraídas para `components/inspections/image-types.ts` (sem `'use client'`); `image-type-selector.tsx` mantém só o componente interativo e reexporta as constantes para compatibilidade. Build verificado: 0 erros, 0 warnings (bundle da página de detalhe até reduziu de 6.88kB para 5.74kB).

---

## ✅ M7 — Relatórios & Exportação PDF — CONCLUÍDO

**Branch:** `main` | **Commits:** `2b19355` + série `fix(M7)` de redesign/print + `828c2b8` (revisão de código M1–M7)

**Build:** ✅ Deploy na Vercel — preview e exportação PDF verificados em produção

### Entregas

**UI — Preview do Relatório**
- [x] `app/(app)/reports/page.tsx` — lista de relatórios
- [x] `app/(app)/reports/[id]/page.tsx` — prévia do relatório (em vez de rota aninhada em `inspections/[id]/report`)
- [x] `app/(app)/inspections/[id]/generate-report-button.tsx` — geração do relatório a partir da vistoria
- [x] `components/reports/report-preview.tsx` — componente único de preview cobrindo capa, seções e imagens (em vez de `report-cover.tsx`/`report-section.tsx`/`report-image-grid.tsx` separados)
- [x] Pontos de atenção — substituídos por cards de resumo por categoria (`fix(M7): replace annotation table with category summary cards`), no lugar de `attention-points-list.tsx` em formato de lista
- [x] Disclaimer de análise preliminar incluído no template de impressão (em vez de componente `report-disclaimer.tsx` isolado)
- [x] Botão "Exportar PDF" — `app/(app)/reports/[id]/print-button.tsx` (bloqueio garantido no servidor: `createReport` só cria o relatório se houver análise aprovada — ver correção abaixo)
- [x] Rota de impressão isolada `app/(print)/reports/[id]/print/page.tsx` — route group próprio para escapar do layout `(editor)` com `overflow-hidden` (ajuste não previsto no plano original)

**Backend — Banco**
- [x] Migration `008_reports.sql` — tabela `reports` completa; **`report_sections` não foi criada** (conteúdo do relatório é montado a partir dos dados existentes — vistoria, imagens, anotações, análises — em vez de seções editáveis persistidas)
- [x] RLS em `reports`

**Backend — Geração de PDF**
- [x] Geração de PDF via impressão de página dedicada (rota `(print)` + botão de print do navegador/`window.print`), no lugar de endpoint `app/api/reports/generate-pdf` com Playwright/Puppeteer server-side
- [x] `lib/reports/actions.ts` — `createReport`, `getReports`, `getReport`, `getReportFullData`, `getReportByInspection`, `deleteReport` (cobre `reports/create`; `update-section` e `get-download-url` não se aplicam pois não há seções editáveis nem PDF armazenado no Storage — download é feito via print-to-PDF do navegador). `createReport` agora valida no servidor se existe `ai_analyses.status = 'approved'` para a vistoria e grava `reports.status = 'approved'` na criação
- [ ] Upload do PDF gerado para bucket `report-pdfs` — não implementado; PDF é gerado client-side via impressão, não persistido no Storage (`reports.pdf_path` existe na coluna mas nunca é preenchido)

### Commits
```
2b19355  feat(M7): add report generation, preview and PDF export
9637587  fix(M7): redesign report layout + fix print sidebar + add strengths/weaknesses section
172d6a7  fix(M7): fix print cutting to 1 page — remove overflow-hidden on print
ffa8ddf  fix(M7): fix multi-page PDF + redesign cover + isolated print route
fdbe029  fix(M7): replace annotation table with category summary cards
f5ad28d  fix(M7): replace Georgia serif with system sans-serif font to fix ligature rendering in PDF
33f470e  fix(M7): move print route to (print) group to escape (editor) overflow-hidden layout
828c2b8  fix: resolve all bugs found in code review (M1-M7)
```

> **Nota de arquitetura:** a abordagem de PDF diverge do planejado em `CLAUDE.md`/PRD (Playwright/Puppeteer server-side + bucket `report-pdfs`). Foi implementado via rota de impressão dedicada + print-to-PDF do navegador. **Decisão confirmada com o usuário em 2026-07-02: manter como está por ora — reavaliar em M15** se geração server-side com upload para Storage é necessária antes do deploy final.

### ✅ Correções aplicadas (2026-07-02)
Duas falhas identificadas em análise de código, ambas corrigidas:
- **`createReport` sem validação server-side** — agora consulta `ai_analyses` e recusa a criação (`error: 'Vistoria sem nenhuma análise de IA aprovada — não é possível gerar relatório'`) se não houver nenhuma análise com `status = 'approved'` para a vistoria. Antes, o bloqueio existia só na renderização condicional do botão na UI.
- **Badge de status sempre "Rascunho"** — `createReport` agora grava `status: 'approved'` na criação (coerente: um relatório só pode existir quando já há análise aprovada), então o badge em `app/(app)/reports/page.tsx` reflete a realidade.
- Build (`npm run build`) verificado após as mudanças: 0 erros, 0 warnings.

---

## ✅ M8 — Atividades & Kanban — CONCLUÍDO

**Branch:** `main`

**Objetivo:** Após a vistoria, pontos de atenção viram atividades gerenciadas em Kanban com colunas Planejada, Iniciada e Finalizada.

### Entregas

**UI**
- [x] `app/(app)/activities/page.tsx` — Server Component que busca atividades, perfis e propriedades e renderiza o board
- [x] `components/activities/activities-board.tsx` — Client Component com `DndContext`, filtros e estado do board (não previsto como arquivo separado no plano original, mas necessário para isolar o client-side do Kanban)
- [x] `components/activities/kanban-column.tsx` — coluna com header, contagem e `useDroppable`
- [x] `components/activities/activity-card.tsx` — card com título, prioridade (borda colorida), prazo (destaque se atrasado), propriedade e responsável, via `useDraggable`
- [x] `components/activities/activity-form.tsx` — modal create/edit: título, descrição, categoria, prioridade, responsável, prazo; aceita vínculo opcional com vistoria/relatório/marcador via prop `initial`
- [x] `components/activities/activity-detail.tsx` — **implementado como Dialog, não como drawer lateral** (o projeto só tem o componente `dialog` do shadcn/ui instalado; adicionar `sheet` seria complexidade extra não essencial para o MVP). Contém detalhes + comentários com envio inline
- [x] Drag & drop entre colunas via `@dnd-kit/core` (`DndContext`/`useDraggable`/`useDroppable`), com atualização otimista + rollback em caso de erro
- [x] Filtros no Kanban: propriedade, prioridade, responsável, período (Atrasadas / Próximos 7 dias / Sem prazo) — filtragem client-side sobre os dados já carregados (dataset pequeno no estágio atual do MVP, evita queries server-side combinatórias)
- [x] Criação rápida de atividade a partir de ponto de atenção do relatório — `components/reports/quick-activities-panel.tsx`, integrado em `app/(app)/reports/[id]/page.tsx` (oculto na impressão via `print:hidden`). Pré-preenche categoria/prioridade/descrição e vincula `inspection_id`/`report_id`/`annotation_id`. **Não implementado a partir do editor de marcadores** (`marker-panel.tsx`), pois lá as anotações ainda não têm `id` persistido antes de salvar — mover para o relatório (onde a anotação já existe no banco) evita essa complexidade

**Backend — Banco**
- [x] Migration `012_activities.sql` (numeração sequencial ao invés de `007`, já ocupado por spectral image types): tabela `activities` com todos os campos planejados + `assigned_to` referenciando `profiles(id)` (em vez de `auth.users(id)`) para permitir embed automático via PostgREST; tabela `activity_comments` com `user_id` também referenciando `profiles(id)` pelo mesmo motivo
- [x] RLS em ambas as tabelas, seguindo o padrão já usado em `inspections`/`reports` (`auth.role() = 'authenticated'` para select/insert/update; delete restrito a `admin`/`field_operator` via `has_role()`)

**Backend — Actions**
- [x] `lib/activities/actions.ts` — `createActivity`, `updateActivity`, `deleteActivity`, `getActivities`, `getActivity`, `getAssignableProfiles`
- [x] `updateActivityStatus` — move entre colunas, grava `completed_at` ao entrar em `done` e limpa ao sair
- [x] `lib/activity-comments/actions.ts` — `createComment`, `getComments`

### Observação
`getAssignableProfiles()` depende da RLS de `profiles`: usuários sem papel `admin` só enxergam o próprio perfil (dado que a gestão de equipe é escopo do M14). Isso limita quem pode ser listado como responsável até o M14 chegar — comportamento esperado, não é bug.

Build (`npm run build`) verificado: 0 erros, 0 warnings.

---

## ✅ M9 — Calendário — CONCLUÍDO

**Branch:** `main`

**Objetivo:** Usuário visualiza em calendário visitas agendadas, prazos de relatórios, atividades e revisitas.

### Entregas

**UI**
- [x] `app/(app)/calendar/page.tsx` — Server Component que busca eventos e renderiza o calendário
- [x] `components/calendar/calendar-view.tsx` — calendário **construído do zero com Tailwind** (grade de mês + colunas de semana), em vez de shadcn Calendar (react-day-picker, focado em seleção de data única, não em grade de eventos) ou react-big-calendar (dependência pesada, fora do stack aprovado em `CLAUDE.md`)
- [x] `components/calendar/event-chip.tsx` — chip colorido por tipo de evento
- [x] `components/calendar/event-popover.tsx` — **implementado como Dialog** (mesmo padrão de `activity-detail.tsx`, já que o projeto não tem componente `popover` do shadcn instalado), com link pra entidade vinculada (vistoria/atividade/relatório)
- [x] `components/calendar/event-form.tsx` — modal para criar/editar evento manual (`report_deadline`/`revisit`); eventos do tipo `visit`/`activity` são somente leitura aqui pois são gerados automaticamente
- [x] Legenda de tipos: Visita (verde), Prazo de Relatório (roxo), Atividade (azul), Revisita (laranja)
- [x] Eventos vencidos destacados visualmente (anel vermelho no chip) — aplicado a `report_deadline`/`activity`/`revisit`, não a `visit` (uma visita passada é histórico, não "atrasada")

**Backend — Banco**
- [x] Migration `013_calendar.sql` (numeração sequencial; `008` já usado por reports): tabela `calendar_events` com todos os campos planejados
- [x] RLS seguindo o mesmo padrão das demais tabelas
- [x] Backfill incluído na própria migration: gera eventos `visit`/`activity` para vistorias e atividades já existentes antes desta migration (senão só registros novos apareceriam no calendário)

**Backend — Actions**
- [x] `lib/calendar/actions.ts` — `createEvent`, `updateEvent`, `deleteEvent`, `getEvents`
- [x] Criação automática de evento ao criar vistoria (`syncInspectionEvent`, chamado em `createInspection`) — **também sincroniza ao editar a data da visita** (`updateInspection`), não só na criação
- [x] Criação automática de evento ao criar atividade com prazo (`syncActivityEvent`, chamado em `createActivity`) — **também sincroniza ao editar prazo/título** (`updateActivity`), incluindo remoção do evento se o prazo for removido

### Observação
Diferente do padrão "interface primeiro, backend depois" do topo deste documento, aqui UI e backend foram entregues juntos no mesmo commit, seguindo o padrão real já observado nos milestones M6–M8 (a intenção original do projeto era interface-mock-primeiro, mas a execução real consolidou fatias verticais completas por milestone).

Build (`npm run build`) verificado: 0 erros, 0 warnings.

---

## ✅ M10 — Dashboard & Notificações — CONCLUÍDO

**Branch:** `main`

**Objetivo:** Painel inicial com resumo operacional e sistema de notificações internas para alertas de prazo e pendências.

### Entregas

**UI — Dashboard**
- [x] `app/(app)/dashboard/page.tsx` — página principal pós-login, queries via Server Component (sem `useEffect`)
- [x] Stat cards: total clientes, propriedades, vistorias em andamento, relatórios gerados
- [x] Stat cards de atividades: planejadas, iniciadas, finalizadas, atrasadas
- [x] Lista "Vistorias recentes" (últimas 5)
- [x] Lista "Atividades urgentes" (vencidas ou vencendo em 3 dias)
- [x] Lista "Análises pendentes de revisão" — `getPendingAnalyses()` adicionado a `lib/ai-analyses/actions.ts`

**UI — Notificações**
- [x] Ícone de sino na topbar com badge de contagem não lida — substituiu o sino estático de `topbar.tsx`
- [x] `components/shared/notification-dropdown.tsx` — dropdown com lista de notificações, busca sob demanda ao abrir
- [x] `components/shared/notification-item.tsx` — item com ícone de tipo, texto, data, link
- [x] Marcar como lida (individual e todas)

**Backend — Banco**
- [x] Migration `014_notifications.sql` (numeração sequencial; `009` já usado por spectral image types): tabela `notifications` com os 5 tipos previstos no `types/index.ts` (`activity_overdue`, `analysis_pending_review`, `report_ready`, `activity_due_soon`, `invite` — os dois últimos reservados para M14)
- [x] RLS: usuário só lê/cria/atualiza/deleta as próprias notificações

**Backend — Actions**
- [x] `lib/notifications/actions.ts` — `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`
- [x] Notificação de "Relatório pronto para download" — disparada imediatamente em `createReport`
- [x] Notificação de "Atividade vencida" e "Análise de IA aguardando revisão há +24h" — geradas de forma **preguiçosa (lazy)** via `syncSystemNotifications()`, chamada toda vez que o usuário abre o dropdown ou carrega o dashboard, em vez de um cron job/trigger em background (não há infraestrutura de jobs agendados no MVP — Vercel serverless não roda processos persistentes)

### ⚠️ Simplificação de escopo: notificações são por usuário, não multi-destinatário
O sistema notifica **o usuário logado sobre os próprios itens pendentes** (atividades atribuídas a ele, análises pendentes se ele tiver papel `human_reviewer`/`admin`), computado sob demanda. Ele **não** resolve "quem mais deveria ser avisado" (ex.: avisar todos os admins quando uma análise fica pendente), porque isso exigiria uma lista de destinatários por papel — funcionalidade que só faz sentido combinada à gestão de equipe do M14. Reavaliar notificações multi-destinatário (e envio por e-mail via Resend) quando o M14 chegar.

Build (`npm run build`) verificado: 0 erros, 0 warnings.

---

## 🔍 Análise crítica pós-M8/M9/M10 (2026-07-02)

Revisão de código feita antes de encerrar o dia, para garantir que M8–M10 estão sólidos antes de avançar. Três bugs reais encontrados e corrigidos:

### ✅ Corrigido — notificação de atividade atrasada nunca disparava para a 2ª atividade em diante
`syncSystemNotifications()` usava o mesmo `link` (`/activities`) para **todas** as notificações do tipo `activity_overdue`. A checagem de deduplicação em `notifyUser()` (`.eq('link', link)`) tratava a segunda atividade atrasada como duplicata da primeira e nunca criava a notificação dela — só a primeira atividade atrasada de cada usuário jamais geraria alerta. Corrigido: link agora inclui o id da atividade (`/activities?highlight=${activity.id}`), tornando cada notificação única.

### ✅ Corrigido — bug sistemático de fuso horário em comparações de data
Vários pontos comparavam datas "bare" (`YYYY-MM-DD`, colunas `date` do Postgres) usando `new Date(dataString)` (interpretado como UTC pelo JS) contra "hoje" calculado via `new Date().toDateString()` ou `new Date().toISOString()` (fuso local do runtime) — uma mistura inconsistente que causava marcações prematuras de "atrasado" horas antes do prazo real vencer, dependendo do horário do dia. Afetava: `lib/notifications/actions.ts`, `app/(app)/dashboard/page.tsx`, `components/calendar/event-chip.tsx`, `components/activities/activities-board.tsx` (filtro de período) e o valor padrão de data em `components/inspections/inspection-form.tsx`.

Corrigido com duas camadas:
1. Centralizado em `lib/utils.ts`: `todayISODate()` / `addDaysISODate(n)`, retornando string `YYYY-MM-DD`.
2. **Fuso fixado explicitamente em `America/Sao_Paulo`** (via `Intl.DateTimeFormat`), em vez de depender do fuso "ambiente" do runtime — necessário porque Server Components/Server Actions rodam na infraestrutura serverless da Vercel, que por padrão executa em **UTC**, não no fuso do usuário brasileiro. Sem isso, a comparação ficaria consistente internamente mas ainda usaria o dia calendário errado (UTC) durante a noite no Brasil.
3. Comparações de data passaram a ser feitas como comparação de **strings** (`'YYYY-MM-DD' < 'YYYY-MM-DD'`), que é equivalente à comparação cronológica e evita todo o problema de parsing de `Date` para datas sem hora.

### ✅ Corrigido — cascade delete quebrado entre `activities` e `activity_comments`
`activities` permite exclusão por `admin` OU `field_operator`, mas `activity_comments` (com FK `ON DELETE CASCADE` para `activities`) só permitia o autor do comentário ou um `admin`. Um `field_operator` excluindo uma atividade com comentário de outra pessoa (ex.: de um admin) fazia o cascade falhar a checagem de RLS da tabela filha, e o Postgres recusava a exclusão inteira. Migration `015_fix_cascade_delete_rls.sql` adiciona `field_operator` à policy de delete de `activity_comments`, alinhando com a policy de `activities`.

**Verificado e descartado como bug:** o mesmo tipo de incompatibilidade foi checado para `inspections → reports` e `inspections → calendar_events` (ambos com FK cascade) — a policy de delete de `inspections` já é `admin`/`field_operator` (migration 004), igual às tabelas filhas. Nenhuma correção necessária aí.

### Build final
`npm run build` — 0 erros, 0 warnings. **Pendência: rodar a migration `015_fix_cascade_delete_rls.sql` no Supabase.**

---

## M11 — Busca & Filtros

**Branch:** `feat/search`

**Objetivo:** Usuário encontra rapidamente clientes, propriedades, vistorias, relatórios e atividades via busca global e filtros por página.

### Entregas

**UI**
- [x] `components/shared/search-bar.tsx` — barra de busca global na topbar com atalho de teclado (`Cmd+K`)
- [x] `app/(app)/search/page.tsx` — página de resultados agrupados por entidade
- [x] Filtros nos módulos existentes:
  - Clientes: nome (cidade/responsável cobertos pelo autocomplete de cidade já existente)
  - Propriedades: nome (cliente/tipo de atividade ainda sem filtro dedicado)
  - Vistorias: status, propriedade, operador, período
  - Atividades: propriedade, prioridade, responsável, período (status = colunas do Kanban)
  - Relatórios: status, propriedade, período

**Backend**
- [x] `lib/search/actions.ts` — helper de busca com `ilike` e filtros combinados (server action, não `lib/supabase/search.ts`)
- [x] `app/api/search/route.ts` — endpoint de busca global com debounce (client-side)
- [ ] Queries otimizadas com índices nas colunas de nome/data mais usadas — pendente; MVP usa `ilike` sem índice dedicado, ok na escala atual

### Commit final
```
feat: search — global search bar, filters on all list pages, search API
```

---

## M12 — Onboarding

**Branch:** `feat/onboarding`

**Objetivo:** Novo usuário é guiado em 6 passos para completar o fluxo principal da plataforma pela primeira vez.

### Entregas

**UI**
- [x] `app/onboarding/page.tsx` — fluxo multi-step pós-cadastro (rota própria, não em `(auth)`: precisa de mais espaço que o card de login)
- [x] `components/onboarding/onboarding-stepper.tsx` — indicador de progresso (6 passos)
- [x] Passo 1: Boas-vindas + apresentação do CampoVisto.IA
- [x] Passo 2: Cadastrar primeiro cliente/produtor
- [x] Passo 3: Cadastrar primeira propriedade
- [x] Passo 4: Criar primeira vistoria
- [x] Passo 5: Fazer upload da primeira imagem
- [x] Passo 6: Tudo pronto — link para a vistoria criada
- [x] Botão "Pular onboarding" em cada passo
- [x] Banner "Retomar onboarding" no dashboard se incompleto

**Backend**
- [x] Campo `onboarding_completed_at` e `onboarding_step` em `profiles`
- [x] Server Actions `updateOnboardingStep` / `completeOnboarding` em `lib/profiles/actions.ts`
- [x] Redirecionamento automático para onboarding no primeiro login (via `signIn`)

### Commit final
```
feat: onboarding — 6-step guided flow, skip option, resume from dashboard
```

---

## M13 — Planos Free/Premium & Scaffold Stripe

**Branch:** `feat/plans`

**Objetivo:** Plataforma aplica limites do plano Free, exibe prompt de upgrade nos pontos de bloqueio e tem scaffold do Stripe para billing futuro.

### Entregas

**UI**
- [ ] `app/(app)/settings/plan/page.tsx` — página de plano atual com uso e limites
- [ ] `components/plans/plan-comparison.tsx` — tabela Free vs Premium com features
- [ ] `components/plans/upgrade-modal.tsx` — modal disparado ao atingir limite (com CTA de upgrade)
- [ ] Badge de plano no avatar/topbar
- [ ] Indicador de uso (ex: "2/3 vistorias usadas")

**Backend — Banco**
- [ ] Migration `010_plans.sql`:
  - Tabela `plans` (id, name, max_properties, max_inspections_per_month, max_images_per_inspection, ai_analysis, pdf_export, kanban, calendar, notifications, price_monthly)
  - Tabela `subscriptions` (id, user_id, plan_id, status, stripe_customer_id, stripe_subscription_id, current_period_end)
  - Tabela `usage_limits` (id, user_id, month, properties_count, inspections_count)
  - Seed: planos `free` e `premium`
- [ ] RLS

**Backend — Lógica de limites**
- [ ] `lib/plans/check-limit.ts` — helper que checa se usuário pode executar ação
- [ ] Guards nos Server Actions de criação de propriedade, vistoria, imagem, análise de IA e PDF
- [ ] Retorno de erro tipado `PLAN_LIMIT_REACHED` para o frontend exibir o upgrade modal

**Backend — Scaffold Stripe**
- [ ] `lib/stripe/client.ts` — Stripe SDK configurado
- [ ] `app/api/stripe/webhook/route.ts` — webhook handler (stub para `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- [ ] Server Action `stripe/create-checkout-session` — stub funcional

### Commit final
```
feat: plans — Free/Premium limits, upgrade prompts, Stripe scaffold
```

---

## M14 — Configurações & Permissões

**Branch:** `feat/settings`

**Objetivo:** Usuário gerencia perfil e preferências. Admin gerencia equipe, papéis e permissões.

### Entregas

**UI**
- [ ] `app/(app)/settings/page.tsx` — hub de configurações com abas
- [ ] Aba Perfil: nome, telefone, avatar (upload), senha
- [ ] Aba Notificações: preferências de alertas internos
- [ ] Aba Equipe (admin only): lista de usuários com roles, convidar novo usuário por e-mail, desativar usuário
- [ ] `components/settings/role-assignment.tsx` — checkboxes de roles por usuário
- [ ] Convite por e-mail: form + envio via Resend

**Backend**
- [ ] Server Action `profiles/update` — nome, telefone, avatar
- [ ] Server Action `auth/change-password`
- [ ] Upload de avatar para bucket `avatars` (criar bucket)
- [ ] Server Action `team/invite-user` — envia e-mail de convite via Resend
- [ ] Server Action `team/update-user-roles`
- [ ] Server Action `team/deactivate-user`
- [ ] `lib/resend/templates/invite.tsx` — template de e-mail de convite
- [ ] Guards de permissão: rotas de admin protegidas por role check

### Commit final
```
feat: settings — profile, team management, role assignment, email invites via Resend
```

---

## M15 — Polimento, Auditoria & Deploy

**Branch:** `feat/polish` → merge para `main`

**Objetivo:** Produto revisado, seguro, responsivo e em produção.

### Entregas

**Responsividade & UX**
- [ ] Audit completo: desktop, tablet (768px) e mobile (375px) em todas as telas
- [ ] Sidebar colapsável no mobile
- [ ] Formulários e modais responsivos
- [ ] Editor de anotações com fallback touch-friendly

**Estados & feedback**
- [ ] Loading skeletons em todas as listas e páginas de detalhe
- [ ] Empty states em todas as listas (com CTA para criar primeiro item)
- [ ] Toast de feedback em todas as Server Actions (sucesso/erro)
- [ ] Error boundaries nos módulos críticos

**Segurança & Qualidade**
- [ ] Auditoria de segurança Supabase (`/supabase-security-audit`):
  - RLS habilitado e testado em todas as tabelas
  - Storage policies revisadas
  - `service_role` não exposto no frontend
  - Inputs sanitizados em todos os forms
- [ ] Code review completo (`/code-review`)
- [ ] Variáveis de ambiente documentadas em `.env.example`
- [ ] `console.log` e código de debug removidos

**Deploy & Verificação**
- [ ] Build de produção sem erros: `npm run build`
- [ ] Deploy na Vercel: `main` branch
- [ ] Smoke test em produção: criar conta → onboarding → vistoria → análise → relatório → atividade
- [ ] Domínio configurado (se disponível)
- [ ] Limites de serverless validados para PDF e chamadas de IA

### Commit final
```
feat: polish — responsive, empty states, security audit, production deploy
```

---

## Regras gerais do plano

- **Interface primeiro:** dentro de cada milestone, construir UI com dados mock antes de conectar o backend real
- **Sem pular milestones:** cada entrega deve ser testada antes de avançar
- **Sem complexidade antecipada:** não implementar funcionalidades de milestones futuros para "deixar pronto"
- **Módulos futuros isolados:** multiempresa, GIS, contagem animal e análise avançada de lavoura não devem aparecer no código do MVP
- **IA é sempre draft:** nenhum texto de IA vai para relatório sem `status: approved` por humano
- **PDF é bloqueado:** exportação PDF só disponível após análise aprovada no plano Premium
