# PROJECT ARCHITECTURE: CampoVisto.IA

## 1. CONTEXT & PROBLEM

Produtores rurais, pecuaristas, agrônomos, consultores técnicos, revendas agropecuárias e gestores de propriedades têm dificuldade em acompanhar visualmente toda a área rural de forma frequente, organizada, documentada e comparável ao longo do tempo.

Na pecuária, muitos pontos de atenção podem passar despercebidos na rotina da propriedade, como falhas de pastagem, solo exposto, trilhas de gado, áreas com possível pisoteio intenso, regiões alagadas, pontos de erosão, cercas danificadas, bebedouros, áreas de sombra, distribuição do rebanho e possíveis diferenças entre piquetes. Além disso, atividades como contagem de animais, observação da distribuição do lote, avaliação visual do rebanho e acompanhamento da evolução da pastagem ainda dependem muito de inspeção manual, memória do produtor e registros soltos.

Na agricultura, lavouras podem apresentar falhas de plantio, manchas de desenvolvimento irregular, áreas com possível estresse, plantas daninhas, pragas, doenças, problemas de drenagem, erosão, compactação ou diferenças visuais entre talhões. Porém, sem imagens organizadas, histórico por área e relatórios comparativos, o produtor ou consultor pode ter dificuldade para identificar padrões, priorizar ações e registrar a evolução da lavoura.

Mesmo quando há uso de drone, as imagens normalmente ficam espalhadas em galerias, pastas, cartões de memória, Google Drive ou conversas de WhatsApp. Falta uma ferramenta simples que transforme essas imagens em informação útil, com marcações visuais, observações de campo, pontos de atenção, relatório profissional, acompanhamento de atividades e histórico da propriedade.

Esse problema gera perda de tempo, baixa padronização das vistorias, dificuldade para comparar visitas, pouca documentação técnica, falhas na comunicação entre operador de campo, produtor, agrônomo e equipe de gestão, além do risco de pequenos problemas evoluírem para prejuízos maiores.

O CampoVisto.IA nasce para resolver essa lacuna: transformar imagens aéreas, fotos de campo e observações operacionais em relatórios visuais claros, organizados e revisados por humano, com apoio de inteligência artificial.

No primeiro momento, o objetivo é entregar uma solução prática para vistoria visual rural com drone, permitindo organizar imagens, destacar pontos de atenção, gerar relatórios e criar atividades recomendadas. No longo prazo, a visão é evoluir para uma plataforma completa de inteligência visual para pecuária e agricultura, com recursos como contagem animal, análise de pastagem, acompanhamento de rebanho, análise de lavouras, identificação preliminar de falhas, pragas, doenças, comparação histórica, integração com mapas, NDVI e modelos próprios de visão computacional.

## 2. PROPOSED SOLUTION

O CampoVisto.IA será uma plataforma de inteligência visual para o campo, criada para transformar imagens de drone, fotos de campo, observações operacionais e dados da propriedade em relatórios visuais, atividades práticas e histórico organizado para tomada de decisão rural.

A solução será construída inicialmente como uma ferramenta de vistoria rural com drone, focada em organizar imagens aéreas, permitir marcações visuais, registrar observações de campo, gerar análises preliminares assistidas por IA e produzir relatórios revisados por humano. O objetivo do MVP é resolver um problema prático: transformar imagens soltas de drone em um relatório claro, visual e acionável para produtores, pecuaristas, agrônomos, consultores e revendas agropecuárias.

No fluxo principal, o usuário poderá cadastrar clientes/produtores, propriedades rurais, vistorias, imagens, observações de campo, pontos de atenção, relatórios e atividades recomendadas. Cada vistoria poderá conter imagens classificadas por tipo, como visão geral, pastagem, rebanho, solo exposto, água, cerca, bebedouro, lavoura, estrutura, área úmida ou outro ponto relevante.

O sistema permitirá adicionar marcações numeradas sobre as imagens, com categorias, descrições, prioridade, nível de confiança e vínculo com atividades práticas. Por exemplo: verificar cerca, revisar bebedouro, avaliar área com solo exposto, acompanhar pastagem, validar possível erosão, revisar área alagada, verificar distribuição do rebanho ou programar nova visita técnica.

A inteligência artificial será usada como apoio para interpretar imagens e observações, gerar análises preliminares, identificar elementos visíveis, sugerir pontos de atenção, estruturar textos para relatório e organizar informações. Porém, toda análise da IA deverá passar por revisão humana obrigatória antes de ser entregue ao produtor. A plataforma não deve apresentar a IA como substituta de agrônomos, zootecnistas, técnicos ou responsáveis de campo.

A entrega principal do MVP será um Relatório Visual de Vistoria Rural, com dados da propriedade, objetivo da visita, imagens anotadas, pontos observados, limitações da análise, recomendações de validação em campo, atividades sugeridas e conclusão preliminar. O relatório poderá ser exportado em PDF com aparência profissional e enviado ao produtor.

Além do relatório, o CampoVisto.IA terá uma estrutura simples de acompanhamento por atividades. Após a vistoria, os pontos de atenção poderão virar tarefas em um Kanban com status como Planejada, Iniciada e Finalizada. Também haverá calendário para organizar visitas, prazos de entrega de relatórios, revisitas e atividades recomendadas. Notificações internas poderão destacar atividades vencidas ou próximas do prazo.

A plataforma também será preparada para planos Free e Premium. A versão Free terá uso limitado para demonstração, testes e entrada de novos usuários. A versão Premium liberará recursos completos, como mais propriedades, mais vistorias, mais imagens, exportação profissional em PDF, análise assistida por IA, Kanban, calendário, notificações, histórico e funcionalidades avançadas.

No longo prazo, o CampoVisto.IA deverá evoluir para uma ferramenta completa de inteligência visual para pecuária e agricultura. Na pecuária, poderá incluir contagem assistida e automática de animais, análise visual de distribuição do rebanho, classificação visual de pastagens, identificação de solo exposto, trilhas de gado, áreas de sombra, água, cercas, bebedouros e comparação histórica por piquete ou propriedade. Na agricultura, poderá evoluir para análise de lavouras, identificação preliminar de falhas de plantio, manchas, plantas daninhas, pragas, doenças, áreas alagadas, problemas visuais de desenvolvimento e integração futura com NDVI, mapas georreferenciados e modelos próprios de visão computacional.

A proposta central do CampoVisto.IA é unir drone, IA, observações de campo, relatórios e gestão de atividades em uma única plataforma. O produto deve ajudar o usuário a enxergar melhor a propriedade, registrar evidências visuais, priorizar ações e acompanhar a evolução do campo ao longo do tempo.

## 3. FUNCTIONAL REQUIREMENTS

- Login e Autenticação
- Kanban
- Dashboards
- Multi usuário
- Multi empresa
- Permissões por usuário
- Parte premium (paga)
- Calendário
- Notificações
- Chat / Mensagens
- Relatórios e Exportação
- Integrações (API)
- Upload de Arquivos
- Busca e Filtros
- Landing Page
- Onboarding do Usuário

Todas as funcionalidades foram selecionadas para que o CampoVisto.IA nasça com visão estrutural de plataforma completa. Porém, nem todas devem ser implementadas com profundidade na primeira versão. O desenvolvimento deve seguir uma arquitetura modular, começando pelo fluxo principal do MVP e deixando os módulos avançados preparados para evolução futura.

Fluxo principal do MVP:
cadastro de usuário → cadastro de cliente/produtor → cadastro de propriedade → criação de vistoria → upload de imagens → observações de campo → marcações visuais → análise preliminar assistida por IA → revisão humana → geração de relatório visual → criação de atividades recomendadas → acompanhamento em Kanban/calendário.

### Funcionalidades obrigatórias no MVP

**1. Login e autenticação**
Permitir acesso seguro à plataforma para usuários autorizados, com autenticação via Supabase Auth. O sistema deve estar preparado para diferentes perfis de acesso.

**2. Cadastro de clientes/produtores**
Permitir cadastrar produtores rurais, pecuaristas, consultores, agrônomos, revendas ou empresas atendidas, com dados básicos como nome, telefone, e-mail, cidade, observações e responsável pelo relacionamento.

**3. Cadastro de propriedades rurais**
Cada cliente poderá ter uma ou mais propriedades cadastradas. A propriedade deverá conter nome, localização aproximada, tipo de atividade rural, observações gerais e vínculo com o cliente.

**4. Cadastro de vistorias**
Permitir criar vistorias vinculadas à propriedade, informando data da visita, operador responsável, objetivo da vistoria, status e observações gerais de campo.

**5. Upload de arquivos e imagens**
Permitir upload de imagens de drone, fotos de campo e arquivos relacionados à vistoria. Cada imagem deverá ser vinculada a uma vistoria e poderá receber classificação manual por tipo: visão geral, pastagem, rebanho, solo exposto, água, cerca, bebedouro, lavoura, estrutura, área úmida ou outro.

**6. Observações de campo por imagem**
Cada imagem deverá permitir observações manuais feitas pelo operador de campo. Essas informações serão usadas para contextualizar a análise e evitar que a IA interprete imagens sem base operacional.

**7. Editor visual de marcações**
O sistema deverá permitir adicionar marcadores numerados sobre as imagens, com categoria, descrição, prioridade, nível de confiança e vínculo com pontos de atenção. Exemplos de categorias: bovino, pastagem, solo exposto, trilha de gado, área úmida, cerca, bebedouro, sombra, lavoura, estrutura e ponto de atenção.

**8. Análise preliminar assistida por IA**
O sistema deverá estar preparado para enviar imagem e observações para uma IA multimodal, como Gemini ou OpenAI Vision, retornando análise preliminar em JSON estruturado. A IA poderá identificar elementos visíveis, possíveis pontos de atenção, limitações da análise e sugestão de texto para relatório.

**9. Revisão humana obrigatória**
Toda análise gerada por IA deverá passar por revisão humana antes de entrar no relatório final. O sistema não deve tratar a análise da IA como diagnóstico técnico definitivo.

**10. Relatórios e exportação**
Gerar Relatórios Visuais de Vistoria Rural com dados do cliente, propriedade, vistoria, imagens anotadas, pontos positivos, pontos de atenção, limitações da análise, atividades recomendadas e conclusão preliminar revisada por humano. O relatório deverá poder ser exportado em PDF.

**11. Busca e filtros**
Permitir buscar clientes, propriedades, vistorias, imagens, relatórios e atividades por nome, data, status, tipo, responsável, categoria e prioridade.

**12. Onboarding do usuário**
Criar um fluxo simples para orientar novos usuários a cadastrar uma propriedade, criar uma vistoria, subir imagens, adicionar marcações, gerar relatório e acompanhar atividades.

### Funcionalidades simples no MVP

**13. Dashboard operacional**
Criar painel inicial simples com indicadores como total de clientes, propriedades cadastradas, vistorias em andamento, relatórios gerados, atividades planejadas, iniciadas, finalizadas e atrasadas. O dashboard não deve ser complexo na primeira versão.

**14. Kanban de atividades recomendadas**
Após a vistoria e geração do relatório, o sistema deverá permitir criar atividades recomendadas para o produtor, agrônomo ou gestor da propriedade. As atividades serão organizadas em colunas simples: Planejada, Iniciada e Finalizada.

**15. Calendário de visitas e atividades**
Permitir visualizar visitas agendadas, prazos de entrega de relatórios, atividades recomendadas, revisitas e atividades vencidas ou próximas do prazo.

**16. Notificações internas**
O sistema deverá destacar atividades vencidas, próximas do prazo ou pendentes de revisão. No MVP, as notificações podem ser internas na plataforma. Integrações com WhatsApp e e-mail poderão entrar depois.

**17. Permissões básicas por usuário**
Criar controle inicial de permissões para perfis como administrador, operador de campo, revisor humano, produtor/cliente e consultor/agronomo.

**18. Planos Free e Premium**
A plataforma deverá estar preparada para modelo de planos. O plano Free terá limitações de uso e servirá para teste/demonstração. O plano Premium liberará mais propriedades, vistorias, imagens, relatórios PDF, análise assistida por IA, Kanban, calendário, notificações, histórico e recursos avançados.

### Funcionalidades preparadas para evolução futura

**19. Multiempresa**
Permitir futuramente que consultorias, revendas, cooperativas ou prestadores de serviço com drone gerenciem seus próprios clientes, propriedades, usuários, vistorias e relatórios.

**20. Chat/Mensagens**
Preparar a arquitetura para comunicação interna ou mensagens relacionadas a vistorias, relatórios e atividades. No MVP, o chat interno não é prioridade e pode ser substituído por WhatsApp externo.

**21. Landing Page**
Preparar a criação de uma página pública para apresentação comercial do CampoVisto.IA, planos, benefícios, exemplos de relatórios e captação de leads. A landing page não deve bloquear o desenvolvimento do produto principal.

**22. Integrações API**
Preparar arquitetura para integrações futuras com Gemini, OpenAI Vision, WhatsApp, Google Calendar, mapas, NDVI, modelos próprios de visão computacional, armazenamento externo e sistemas de gestão rural.

**23. Recursos avançados de pecuária**
No futuro, a plataforma poderá incluir contagem automática de bovinos, análise de distribuição do rebanho, classificação visual de pastagem, identificação de trilhas de gado, áreas de solo exposto, bebedouros, cercas, sombras e comparação histórica por piquete ou propriedade.

**24. Recursos avançados de agricultura**
No futuro, a plataforma poderá incluir análise de lavouras, identificação preliminar de falhas de plantio, manchas, plantas daninhas, pragas, doenças, áreas alagadas, problemas visuais de desenvolvimento, NDVI, mapas georreferenciados e modelos próprios treinados com dataset validado.

**Regra de implementação:**
As funcionalidades selecionadas não significam implementação completa imediata. O Claude Code deve construir uma arquitetura preparada para crescimento, mas implementar primeiro o núcleo do MVP. Qualquer funcionalidade futura deve ser isolada em módulos, sem poluir o fluxo principal.

## 4. USER PERSONAS

O CampoVisto.IA terá diferentes tipos de usuários, pois a plataforma deve atender tanto o fluxo operacional de vistoria com drone quanto a visão futura de gestão visual para pecuária e agricultura.

**Regra principal de perfis:**
Um mesmo usuário poderá ter múltiplos perfis/funções ao mesmo tempo. O sistema não deve limitar um usuário a apenas um papel fixo.

Exemplo prático — Renato poderá ser, ao mesmo tempo:
- Operador de Campo
- Piloto de Drone
- Agrônomo/Consultor Técnico
- Analista/Revisor Humano

Isso é essencial porque, no início do projeto, poucas pessoas poderão acumular várias responsabilidades. A plataforma deve permitir marcar múltiplos perfis no cadastro do usuário e liberar permissões conforme a combinação de funções atribuídas.

**1. Administrador da Plataforma / FMinds**
Responsável por gerenciar a plataforma como um todo. Pode cadastrar e administrar usuários, empresas, clientes, propriedades, vistorias, imagens, relatórios, planos, permissões e configurações gerais. Esse perfil também acompanha métricas de uso, planos Free/Premium, limites de acesso, integrações, relatórios gerados e evolução dos módulos da plataforma.

**2. Operador de Campo**
Usuário responsável pela coleta prática dos dados em campo. Pode criar ou atualizar vistorias, fazer upload de imagens de drone, fotos de campo, vídeos e observações operacionais.

**3. Piloto de Drone**
Usuário responsável pela operação do drone e captura das imagens aéreas. Pode registrar dados do voo, imagens capturadas, condições básicas da coleta, tipo de imagem, observações visuais e pontos percebidos durante a visita.

**4. Analista / Revisor Humano**
Responsável por revisar as análises geradas pela IA antes da entrega ao produtor. Pode validar pontos de atenção, corrigir interpretações, ajustar textos do relatório, aprovar imagens anotadas e garantir que o documento final não contenha afirmações técnicas indevidas. Esse perfil é obrigatório porque o CampoVisto.IA não deve entregar diagnóstico automático sem validação humana.

**5. Agrônomo / Consultor Técnico**
Usuário especializado que pode analisar dados da propriedade, revisar pontos de atenção, criar recomendações técnicas e acompanhar atividades no Kanban. A IA deve apoiar esse profissional, mas não substituir sua responsabilidade técnica.

**6. Produtor Rural / Pecuarista**
Usuário final que recebe e consulta os relatórios visuais da propriedade. No MVP, o produtor poderá receber principalmente o relatório em PDF. Em fases futuras, poderá ter acesso a uma área própria dentro da plataforma.

**7. Gestor de Propriedade / Gerente de Fazenda**
Usuário responsável por acompanhar a execução das ações práticas dentro da propriedade. Pode visualizar atividades recomendadas, atualizar status, registrar andamento, anexar evidências e acompanhar prazos.

**8. Revenda Agropecuária / Parceiro Comercial**
Usuário ou empresa parceira que poderá usar o CampoVisto.IA como serviço agregado para atender produtores, organizar visitas, gerar relatórios visuais e acompanhar oportunidades comerciais.

**9. Empresa / Conta Multiempresa**
Perfil futuro para consultorias, revendas, cooperativas ou prestadores de serviço com drone que atendem múltiplos produtores e propriedades.

**10. Usuário Free**
Usuário com acesso limitado à plataforma, voltado para demonstração, teste e entrada inicial.

**11. Usuário Premium**
Usuário pagante com acesso ampliado às funcionalidades da plataforma.

**12. Técnico de Suporte / Operação Interna**
Usuário interno responsável por auxiliar clientes, resolver dúvidas e acompanhar falhas operacionais.

### Perfis obrigatórios no MVP
- Administrador
- Operador de Campo
- Piloto de Drone
- Revisor Humano
- Produtor/Cliente

### Perfis preparados para evolução futura
- Agrônomo/Consultor Técnico
- Gestor de Propriedade
- Revenda/Parceiro Comercial
- Conta Multiempresa
- Usuário Free / Premium
- Técnico de Suporte

### Regra técnica obrigatória
O sistema deve modelar papéis/perfis de forma flexível, permitindo que um mesmo usuário tenha múltiplos perfis. Não usar campo único como `user.role`. Preferir estrutura com `roles` e `user_roles`, permitindo relação muitos-para-muitos entre usuários e funções.

Modelagem esperada:
- `users`
- `roles`
- `user_roles`

As permissões devem ser calculadas pela soma dos perfis atribuídos ao usuário.

## 5. TECHNICAL STACK

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- Supabase
- Stripe
- Vercel
- Claude Code
- Node.js
- PostgreSQL
- TypeScript
- Resend (e-mails)

A stack tecnológica do CampoVisto.IA deve priorizar velocidade de desenvolvimento, baixo custo inicial, facilidade de manutenção e compatibilidade com evolução futura para IA, imagens, relatórios, planos pagos e integrações.

### Stack principal

**1. Next.js**
App Router, Server Components, Server Actions e API Routes. Base para frontend, backend leve, páginas autenticadas, páginas públicas, APIs internas e geração de prévias de relatório.

**2. React**
Interface da aplicação: telas de cadastro, dashboard, upload de imagens, editor visual, Kanban, calendário, prévia de relatório e área de planos.

**3. TypeScript**
Todo o projeto em TypeScript. Tipagens para todas as entidades: usuários, clientes, propriedades, vistorias, imagens, marcações, relatórios, atividades, planos e permissões.

**4. Tailwind CSS**
Estilização da interface, responsividade e consistência visual.

**5. shadcn/ui**
Biblioteca principal de componentes: botões, cards, formulários, modais, tabelas, abas, dropdowns, calendário, badges, alertas e componentes de layout.

**6. Supabase**
Backend principal do MVP: autenticação, banco PostgreSQL, storage de arquivos e políticas de segurança (Row Level Security).

**7. PostgreSQL (via Supabase)**
Banco de dados relacional. Entidades principais:
- users/profiles, roles, user_roles
- companies, clients, properties
- inspections, inspection_images, image_annotations
- ai_analyses, reports, report_sections
- activities, activity_comments
- calendar_events, notifications
- plans, subscriptions, usage_limits

**8. Supabase Storage**
Armazenamento de imagens originais de drone, fotos de campo, imagens com marcações exportadas, PDFs dos relatórios e anexos de atividades.

**9. Vercel**
Hospedagem com deploy contínuo a partir do GitHub. Considerar limites de funções serverless para processamento de imagem, geração de PDF e chamadas de IA.

**10. Node.js**
Ambiente server-side do Next.js para API Routes, Server Actions, integrações, geração de relatórios e processamento de arquivos.

**11. Stripe**
Preparar modelo de planos Free e Premium, assinaturas, limites de uso e controle de acesso por plano. Billing completo não é obrigatório no MVP.

**12. Resend**
E-mails transacionais: convite de usuário, confirmação de cadastro, relatório gerado, atividade atrasada, alerta de prazo.

**13. IA multimodal**
Gemini API ou OpenAI Vision. Toda análise da IA é tratada como preliminar e revisável.

**14. Editor visual de imagens**
Canvas ou React Konva para marcações visuais sobre imagens (marcadores numerados, linhas de chamada, categorias, coordenadas salvas, exportação de imagem anotada).

**15. Relatórios PDF**
HTML/CSS com Playwright, Puppeteer ou equivalente. PDFs profissionais com marca CampoVisto.IA by FMinds.

### Tecnologias não obrigatórias no MVP
- **Prisma** — usar Supabase Client direto; avaliar futuramente se necessário
- **tRPC** — usar Server Actions + API Routes; avaliar futuramente se necessário

## 6. DESIGN LANGUAGE

O CampoVisto.IA deve ter interface profissional, limpa, responsiva e orientada a imagens, com foco em drone, campo, vistorias, pontos de atenção, relatórios e atividades práticas.

### Referências de produto e design
1. **DroneDeploy Agriculture** — organização de imagens de drone, mapas agrícolas, inspeções
2. **Climate FieldView** — plataforma agro orientada a dados, histórico, propriedades
3. **BemAgro** — uso de drones, imagens, IA e relatórios no agro brasileiro
4. **Embrapa / VANTs** — referência técnica para contagem animal e visão computacional
5. **AgriHub** — drones na pecuária, monitoramento de gado e pastagens
6. **ArcGIS** — referência futura para mapas e dados georreferenciados
7. **Linear** — interface limpa, objetiva, moderna, boa hierarquia visual
8. **Notion** — organização de informações, campos editáveis, histórico
9. **Trello / Pipefy** — Kanban de atividades
10. **Google Calendar** — calendário de visitas e prazos
11. **Google Drive / Dropbox** — organização de imagens e arquivos

### Direção visual
- Interface moderna, limpa e profissional
- Imagens de drone como protagonistas
- Cards para propriedades, vistorias, relatórios e atividades
- Hierarquia: propriedade → vistoria → imagens → análise → relatório → atividades
- Marcadores visuais numerados sobre imagens (categoria, descrição, prioridade, confiança)
- Desktop primary, tablet e mobile suportados
- Base visual neutra com destaques em verde, roxo ou azul (marca FMinds)
- Evitar: aparência de rede social, excesso de decoração rural, dashboard complexo no MVP

### Telas principais
1. Dashboard operacional (resumo simples)
2. Página da propriedade (histórico de vistorias, imagens recentes)
3. Página da vistoria (fluxo principal: imagens, observações, IA, revisão)
4. Galeria de imagens da vistoria
5. Editor visual de imagem (tela central do produto)
6. Prévia do relatório
7. Exportação em PDF
8. Kanban de atividades (Planejada / Iniciada / Finalizada)
9. Calendário
10. Área de planos (Free / Premium)

### Fluxo de experiência desejada
1. Cadastrar cliente/produtor
2. Cadastrar propriedade
3. Criar vistoria
4. Subir imagens
5. Adicionar observações de campo
6. Marcar pontos de atenção na imagem
7. Solicitar análise assistida por IA
8. Revisar manualmente
9. Gerar relatório
10. Criar atividades recomendadas
11. Acompanhar execução no Kanban e calendário

## 7. PROCESS

- Break app build into logical milestones (steps)
- Each milestone should be a deliverable increment
- Prioritize core functionality first, then iterate
- Test each milestone before moving to the next
