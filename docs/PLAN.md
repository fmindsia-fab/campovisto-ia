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
| M5 | Editor Visual de Anotações | `feat/image-editor` | Canvas, marcadores, exportação |
| M6 | Análise de IA & Revisão Humana | `feat/ai-analysis` | Gemini/OpenAI + fluxo de aprovação |
| M7 | Relatórios & Exportação PDF | `feat/reports` | Geração e exportação |
| M8 | Atividades & Kanban | `feat/activities` | Kanban Planejada/Iniciada/Finalizada |
| M9 | Calendário | `feat/calendar` | Visitas, prazos, eventos |
| M10 | Dashboard & Notificações | `feat/dashboard` | Painel operacional, alertas |
| M11 | Busca & Filtros | `feat/search` | Busca global, filtros por página |
| M12 | Onboarding | `feat/onboarding` | Fluxo guiado para novos usuários |
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

## M5 — Editor Visual de Anotações

**Branch:** `feat/image-editor`

**Objetivo:** Usuário abre uma imagem da vistoria e adiciona marcadores numerados com categoria, descrição, prioridade e nível de confiança.

### Entregas

**UI — Editor**
- [ ] `app/(app)/inspections/[id]/images/[imageId]/editor/page.tsx` — página full-screen do editor
- [ ] `components/editor/annotation-canvas.tsx` — canvas React Konva com imagem de fundo
- [ ] `components/editor/marker-dot.tsx` — marcador numerado ciruclar clicável
- [ ] `components/editor/marker-panel.tsx` — painel lateral: lista de marcadores + botão "Adicionar"
- [ ] `components/editor/marker-form.tsx` — formulário por marcador: categoria, descrição, prioridade (alta/média/baixa), confiança (confirmado/provável/incerto)
- [ ] `components/editor/category-selector.tsx` — seletor com ícones: bovino, pastagem, solo exposto, trilha de gado, área úmida, cerca, bebedouro, sombra, lavoura, estrutura, ponto de atenção
- [ ] Toolbar do editor: adicionar marcador, mover, zoom in/out, desfazer, salvar, exportar
- [ ] Estado de marcadores no canvas sincronizado com painel lateral
- [ ] Exportação da imagem anotada como PNG/JPEG

**Backend — Banco**
- [ ] Migration `004_annotations.sql`:
  - Tabela `image_annotations` (id, image_id, marker_number, x_percent, y_percent, category, description, priority, confidence, created_at)
- [ ] RLS

**Backend — Actions & Storage**
- [ ] Server Action `annotations/save` — upsert de todos os marcadores da imagem
- [ ] Server Action `annotations/delete`
- [ ] Server Action `annotations/export-image` — salva imagem anotada no bucket `annotated-images`
- [ ] Query para carregar anotações de uma imagem

### Commit final
```
feat: image annotation editor — React Konva canvas, numbered markers, categories, export
```

---

## M6 — Análise de IA & Revisão Humana

**Branch:** `feat/ai-analysis`

**Objetivo:** Usuário solicita análise preliminar via IA para uma imagem, visualiza o resultado como rascunho e o revisor humano aprova ou rejeita antes de entrar no relatório.

### Entregas

**UI**
- [ ] Botão "Solicitar análise por IA" na página de detalhe da imagem
- [ ] `components/ai/analysis-loading.tsx` — estado de loading com mensagem de contexto
- [ ] `components/ai/analysis-result.tsx` — exibe resultado draft: elementos visíveis, pontos de atenção, limitações, texto sugerido
- [ ] Badge de status visível: `Rascunho IA` / `Revisão Pendente` / `Aprovado` / `Rejeitado`
- [ ] `components/ai/human-review-panel.tsx` — interface para o revisor: aprovar, rejeitar, editar texto sugerido, adicionar observação
- [ ] Bloqueio visual: se análise não aprovada, botão "Gerar Relatório" fica desabilitado com tooltip explicativo

**Backend — Banco**
- [ ] Migration `005_ai_analyses.sql`:
  - Tabela `ai_analyses` (id, image_id, inspection_id, visible_elements jsonb, attention_points jsonb, limitations jsonb, suggested_text text, raw_response jsonb, status, reviewed_by, reviewed_at, reviewer_notes, created_at)
- [ ] RLS: criação por `field_operator`/`drone_pilot`; aprovação apenas por `human_reviewer`/`admin`

**Backend — API & Actions**
- [ ] `app/api/ai/analyze-image/route.ts` — POST handler
  - Recebe `imageUrl`, `fieldObservations`, `imageType`
  - Chama Gemini API ou OpenAI Vision
  - Retorna JSON estruturado
  - Salva no banco com `status: draft`
- [ ] `lib/ai/gemini.ts` ou `lib/ai/openai.ts` — cliente de IA com prompt padrão
- [ ] Prompt de sistema: identifica elementos visíveis, pontos de atenção, limitações e texto para relatório
- [ ] Server Action `ai-analyses/approve` — altera status para `approved`, registra revisor e data
- [ ] Server Action `ai-analyses/reject` — altera status para `rejected` com nota
- [ ] Server Action `ai-analyses/update-text` — revisor edita texto sugerido

### Commit final
```
feat: AI analysis — Gemini/OpenAI Vision integration, draft/approve workflow, human review
```

---

## M7 — Relatórios & Exportação PDF

**Branch:** `feat/reports`

**Objetivo:** Usuário gera um Relatório Visual de Vistoria Rural a partir de uma vistoria com análise aprovada, visualiza a prévia e exporta em PDF profissional.

### Entregas

**UI — Preview do Relatório**
- [ ] `app/(app)/reports/page.tsx` — lista de relatórios com filtros
- [ ] `app/(app)/inspections/[id]/report/page.tsx` — prévia do relatório (modo leitura e edição)
- [ ] `components/reports/report-cover.tsx` — capa com logo, propriedade, data, operador
- [ ] `components/reports/report-section.tsx` — seção editável com título e corpo
- [ ] `components/reports/report-image-grid.tsx` — grid de imagens anotadas com marcadores listados abaixo
- [ ] `components/reports/attention-points-list.tsx` — lista de pontos com categoria, prioridade, descrição
- [ ] `components/reports/report-disclaimer.tsx` — aviso obrigatório de análise preliminar revisada por humano
- [ ] Botão "Exportar PDF" (só habilitado com análise aprovada)

**Backend — Banco**
- [ ] Migration `006_reports.sql`:
  - Tabela `reports` (id, inspection_id, title, status, generated_by, approved_by, pdf_path, created_at, updated_at)
  - Tabela `report_sections` (id, report_id, section_type, title, content, order_index)
- [ ] RLS

**Backend — Geração de PDF**
- [ ] `app/api/reports/generate-pdf/route.ts` — POST handler
  - Monta HTML/CSS completo do relatório
  - Chama Playwright/Puppeteer para gerar PDF
  - Faz upload para bucket `report-pdfs`
  - Atualiza `reports.pdf_path`
  - Retorna URL de download assinada
- [ ] `lib/pdf/report-template.ts` — template HTML do relatório com estilo inline
- [ ] Server Action `reports/create` — cria relatório a partir de uma vistoria aprovada
- [ ] Server Action `reports/update-section` — salva edições de seções
- [ ] Server Action `reports/get-download-url` — gera URL temporária assinada

### Commit final
```
feat: reports — preview, PDF generation with Playwright, Supabase Storage, download URL
```

---

## M8 — Atividades & Kanban

**Branch:** `feat/activities`

**Objetivo:** Após a vistoria, pontos de atenção viram atividades gerenciadas em Kanban com colunas Planejada, Iniciada e Finalizada.

### Entregas

**UI**
- [ ] `app/(app)/activities/page.tsx` — Kanban board com 3 colunas
- [ ] `components/activities/kanban-column.tsx` — coluna com header e lista de cards
- [ ] `components/activities/activity-card.tsx` — card com título, prioridade, prazo, responsável, vínculo com vistoria
- [ ] `components/activities/activity-form.tsx` — modal create/edit: título, descrição, categoria, prioridade, responsável, prazo, vínculo com imagem/marcador/relatório
- [ ] `components/activities/activity-detail.tsx` — drawer lateral com detalhes + comentários
- [ ] Drag & drop entre colunas (usando `@dnd-kit/core`)
- [ ] Filtros no Kanban: por propriedade, responsável, prioridade, período
- [ ] Criação rápida de atividade a partir de um marcador ou ponto de atenção do relatório

**Backend — Banco**
- [ ] Migration `007_activities.sql`:
  - Tabela `activities` (id, inspection_id, report_id, annotation_id, title, description, category, priority, status, assigned_to, due_date, completed_at, created_by, created_at)
  - Tabela `activity_comments` (id, activity_id, user_id, content, created_at)
- [ ] RLS

**Backend — Actions**
- [ ] Server Action `activities/create`, `update`, `delete`
- [ ] Server Action `activities/update-status` — move entre colunas
- [ ] Server Action `activity-comments/create`

### Commit final
```
feat: activities — Kanban board, drag & drop, create from markers, comments
```

---

## M9 — Calendário

**Branch:** `feat/calendar`

**Objetivo:** Usuário visualiza em calendário visitas agendadas, prazos de relatórios, atividades e revisitas.

### Entregas

**UI**
- [ ] `app/(app)/calendar/page.tsx` — visão mensal e semanal
- [ ] `components/calendar/calendar-view.tsx` — calendário com shadcn Calendar ou react-big-calendar
- [ ] `components/calendar/event-chip.tsx` — chip colorido por tipo de evento
- [ ] `components/calendar/event-popover.tsx` — detalhes ao clicar (título, tipo, entidade vinculada, link)
- [ ] `components/calendar/event-form.tsx` — modal para criar/editar evento
- [ ] Legenda de tipos: Visita (verde), Prazo de Relatório (roxo), Atividade (azul), Revisita (laranja)
- [ ] Eventos vencidos destacados visualmente

**Backend — Banco**
- [ ] Migration `008_calendar.sql`:
  - Tabela `calendar_events` (id, title, event_type, start_date, end_date, all_day, inspection_id, activity_id, report_id, created_by, created_at)
- [ ] RLS

**Backend — Actions**
- [ ] Server Action `calendar-events/create`, `update`, `delete`
- [ ] Criação automática de evento ao criar vistoria (data da visita)
- [ ] Criação automática de evento ao criar atividade com prazo

### Commit final
```
feat: calendar — monthly/weekly view, event types, auto-create from inspections and activities
```

---

## M10 — Dashboard & Notificações

**Branch:** `feat/dashboard`

**Objetivo:** Painel inicial com resumo operacional e sistema de notificações internas para alertas de prazo e pendências.

### Entregas

**UI — Dashboard**
- [ ] `app/(app)/dashboard/page.tsx` — página principal pós-login
- [ ] Stat cards: total clientes, propriedades, vistorias em andamento, relatórios gerados
- [ ] Stat cards de atividades: planejadas, iniciadas, finalizadas, atrasadas
- [ ] Lista "Vistorias recentes" (últimas 5)
- [ ] Lista "Atividades urgentes" (vencidas ou vencendo em 3 dias)
- [ ] Lista "Análises pendentes de revisão"

**UI — Notificações**
- [ ] Ícone de sino na topbar com badge de contagem não lida
- [ ] `components/shared/notification-dropdown.tsx` — dropdown com lista de notificações
- [ ] `components/shared/notification-item.tsx` — item com ícone de tipo, texto, data, link
- [ ] Marcar como lida (individual e todas)

**Backend — Banco**
- [ ] Migration `009_notifications.sql`:
  - Tabela `notifications` (id, user_id, type, title, body, link, read_at, created_at)
- [ ] RLS: usuário só lê as próprias notificações

**Backend — Actions**
- [ ] Queries do dashboard via Server Components (sem useEffect)
- [ ] Server Action `notifications/mark-read`
- [ ] Criação de notificação nos eventos críticos:
  - Atividade vencida
  - Análise de IA aguardando revisão há mais de 24h
  - Relatório pronto para download

### Commit final
```
feat: dashboard — operational metrics, recent activity, internal notifications
```

---

## M11 — Busca & Filtros

**Branch:** `feat/search`

**Objetivo:** Usuário encontra rapidamente clientes, propriedades, vistorias, relatórios e atividades via busca global e filtros por página.

### Entregas

**UI**
- [ ] `components/shared/search-bar.tsx` — barra de busca global na topbar com atalho de teclado (`Cmd+K`)
- [ ] `app/(app)/search/page.tsx` — página de resultados agrupados por entidade
- [ ] Filtros nos módulos existentes:
  - Clientes: nome, cidade, responsável
  - Propriedades: nome, cliente, tipo de atividade
  - Vistorias: status, propriedade, operador, período
  - Atividades: status, prioridade, responsável, prazo, propriedade
  - Relatórios: status, propriedade, período

**Backend**
- [ ] `lib/supabase/search.ts` — helper de busca com `ilike` e filtros combinados
- [ ] `app/api/search/route.ts` — endpoint de busca global com debounce
- [ ] Queries otimizadas com índices nas colunas de nome/data mais usadas

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
- [ ] `app/(auth)/onboarding/page.tsx` — fluxo multi-step pós-cadastro
- [ ] `components/onboarding/onboarding-stepper.tsx` — indicador de progresso (6 passos)
- [ ] Passo 1: Boas-vindas + apresentação do CampoVisto.IA
- [ ] Passo 2: Cadastrar primeiro cliente/produtor
- [ ] Passo 3: Cadastrar primeira propriedade
- [ ] Passo 4: Criar primeira vistoria
- [ ] Passo 5: Fazer upload da primeira imagem
- [ ] Passo 6: Tudo pronto — links para editor e relatório
- [ ] Botão "Pular onboarding" em cada passo
- [ ] Banner "Retomar onboarding" no dashboard se incompleto

**Backend**
- [ ] Campo `onboarding_completed_at` e `onboarding_step` em `profiles`
- [ ] Server Action `profiles/update-onboarding-step`
- [ ] Redirecionamento automático para onboarding no primeiro login

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
