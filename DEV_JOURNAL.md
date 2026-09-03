# 📓 Diário de Desenvolvimento & Log de Execução (Dev Journal)

> **Projeto:** Plataforma de CRM Neutro (Multi-Nicho)  
> **Objetivo deste arquivo:** Registrar de forma contínua e transparente todas as etapas executadas, decisões tomadas, validações bem-sucedidas (o que deu certo), incidentes/erros encontrados (o que deu errado) e as soluções aplicadas.

---

## 📋 Sumário de Registros

1. [Sessão 01 (01-02/09/2026) - Planejamento Inicial, Especificação de Tracking e Relatório Preliminar](#registro-01---01-02092026---planejamento-inicial--relatório-preliminar)
2. [Sessão 02 (02/09/2026) - Auditoria Técnica Sênior e Refatoração Arquitetural v2.0](#registro-02---02092026---auditoria-técnica-sênior--refatoração-v20)
3. [Sessão 03 (02/09/2026) - Kickoff da Fase 1: Setup do Projeto & Modelagem do Banco](#registro-03---02092026---kickoff-da-fase-1-setup--modelagem)

---

## Registro 01 - 01-02/09/2026 - Planejamento Inicial & Relatório Preliminar

### 🎯 Objetivo da Etapa
* Mapear requisitos de um CRM Neutro (Multi-Nicho) e integrar suporte a Postbacks e dados de tráfego pago (Meta Ads, Google Ads).
* Gerar documento de especificação inicial.

### ✅ O que deu certo
* Estruturação clara das dores de negócios B2C e B2B em um CRM unificado.
* Mapeamento dos requisitos de First-Party Data, Postbacks e Server-Side Conversions (Meta CAPI e Google Offline Conversions).
* Criação do documento base `RELATORIO_PROJETO_CRM.md`.

### ⚠️ O que deu errado / Pontos Críticos Identificados
* **Ambiguidade de Stack:** Deixou em aberto a escolha entre NestJS/Fastify e Prisma/Drizzle.
* **Incompatibilidade Prisma + RLS:** Prisma tem limitações graves com PostgreSQL RLS dinâmico em filas assíncronas.
* **Acoplamento Contato x Oportunidade:** Falha de modelagem ao tratar o contato como o próprio card do funil, quebrando múltiplos pedidos ou vendas consultivas simultâneas.
* **Métrica de ROI:** Promessa de cálculo de ROI sem ingestão de custo de mídia (*Ad Spend*).
* **Restrições de Terceiros Ignoradas:** Janela de 24h da Meta Cloud API, bloqueio de cookies JS pelo Safari ITP e tempo de indexação de cliques do Google Ads.

---

## Registro 02 - 02/09/2026 - Auditoria Técnica Sênior & Refatoração v2.0

### 🎯 Objetivo da Etapa
* Realizar auditoria técnica sênior completa sobre o relatório, corrigir todos os 15 problemas apontados e sanar 5 lacunas críticas.

### ✅ O que deu certo
* **Decisão de Stack Definitiva:** Fechado em **Next.js 15 + React 19 + Tailwind** (Frontend) e **NestJS (Fastify Adapter) + Drizzle ORM + PostgreSQL 16 + Redis 7 / BullMQ + Socket.io** (Backend & Realtime).
* **Desacoplamento Relacional:** `Contact` (dados permanentes), `Deal` (oportunidade no funil) e `Order` (transações e pedidos).
* **Refatoração Arquitetural Completa:** Atualização do `RELATORIO_PROJETO_CRM.md` para a versão 2.0 com resolução formal dos 15 problemas e 5 lacunas.
* **Ajuste no Roadmap:** Entidades de vendas antecipadas para a Fase 1 para sustentar os Postbacks da Fase 2.

---

## Registro 04 - 02/09/2026 - Construção da API NestJS com Fastify Adapter & AsyncLocalStorage

### 🎯 Objetivo da Etapa
* Construir a API REST em `apps/api` usando NestJS e Fastify Adapter de alta performance.
* Implementar o isolamento multi-tenant via `AsyncLocalStorage` (ALS) sem o overhead de controllers `Scope.REQUEST`.
* Criar os módulos de Autenticação (JWT + RBAC), Contatos (Busca + E.164 + Custom Fields), Pipelines (Multi-funis + Estágios) e Deals (Visão Kanban + Rastreamento de Tráfego).

### ✅ O que deu certo
* **AsyncLocalStorage Tenant Storage:** Contexto de Tenant e Usuário encapsulado de forma transparente no ciclo de vida de cada requisição Fastify via hook `onRequest`.
* **DatabaseService Transacional com RLS:** Execução de todas as queries de negócio encapsuladas com `withTenantContext(tenantId, tx)` aplicando RLS no PostgreSQL.
* **Módulo de Autenticação (`AuthModule`):**
  * `POST /auth/register`: Registro atômico de Tenant (com slug único), Usuário (com hash bcrypt) e vínculo `OWNER` em `tenant_users`.
  * `POST /auth/login`: Autenticação e emissão de JWT contendo `tenantId`, `userId` e `role`.
  * `AuthGuard`: Validação de Bearer Token JWT com injeção automática no ALS (com suporte a fallback `x-tenant-id` para webhooks/dev).
* **Módulo de Contatos (`ContactsModule`):**
  * `GET /contacts` com busca textual inteligente (`name`, `email`, `phoneE164`, `document`).
  * `POST /contacts` e `PUT /contacts/:id` com suporte a `custom_fields` JSONB e rastreamento de última interação (`lastInboundInteractionAt`).
* **Módulo de Pipelines & Deals (`PipelinesModule` & `DealsModule`):**
  * `GET /pipelines`: Listagem hierárquica de funis com seus respectivos estágios ordenados.
  * `POST /pipelines`: Criação de novo funil com geração automática dos 4 estágios padrão.
  * `GET /deals/kanban?pipelineId=...`: Agrupamento em colunas/estágios com cálculo de métricas (`totalDeals`, `totalValueCents`), inner join com contatos e left join com `deal_tracking` (UTMs, `gclid`, `fbclid`, `ttclid`).
  * `PUT /deals/:id/stage` e `PUT /deals/:id/status`: Transição de estágios e fechamento (`OPEN`, `WON`, `LOST`).
* **Compilação Monorepo 100% Type-Safe:** `pnpm run build` bem-sucedido em todos os 3 pacotes (`@crm/shared`, `@crm/database`, `@crm/api`).

### ⚠️ O que deu errado / Incidentes
* **TypeScript TS2742 no `DatabaseService`:** O compilador alertou sobre inferência não portátil do tipo `rawDb`.
  * **Solução:** Exportado `export type AppDatabase = typeof db` em `@crm/database` e anotado explicitamente o getter `get rawDb(): AppDatabase` no serviço.

---
*(Este arquivo será atualizado a cada nova funcionalidade implementada, teste executado ou erro encontrado)*

## Sessão 05: Auditoria Técnica e Correção de Riscos Críticos
**Data:** 02 de Setembro de 2026

**O que foi feito:**
1. Realizada uma auditoria técnica profunda de todo o monorepo (44 arquivos) que resultou no documento `auditoria_tecnica.md` com 16 achados documentados.
2. Corrigido **C1 (Crítico):** Alteração no hook Fastify do `main.ts` para sempre aplicar `tenantStorage.run()` e modificação do `AuthGuard` para apenas mutar o `store` existente em vez de usar `enterWith()`, prevenindo vazamento de contexto entre tenants.
3. Corrigido **C2 (Crítico):** A rota de registro de Tenant foi refatorada. Toda verificação (e-mail, slug) passou para dentro de uma única transação e tratamos falhas de restrição única (erro 23505) adequadamente.
4. Corrigido **C3 (Crítico):** Nenhum payload da API era validado de verdade, permitindo tipos incorretos. Criado um `ZodValidationPipe` universal para o NestJS e aplicados schemas `zod` em todos os quatro controllers (`Auth`, `Contacts`, `Deals`, `Pipelines`).
5. Corrigido **A3 (Alto):** Adicionado `FORCE ROW LEVEL SECURITY` para todas as tabelas em `0000_enable_rls.sql`, protegendo o banco caso o owner rode as migrations sem permissões corretas.
6. Corrigido **A6 (Alto):** Rodei `pnpm approve-builds` para permitir a compilação nativa do módulo `bcrypt`, que poderia crachar o servidor em produção.

**O que deu certo:**
- A implementação com Zod + Pipe customizado não exigiu a troca do Fastify, mantendo a performance super rápida, sem inflar dependências adicionais com class-validator/class-transformer.
- A refatoração do `main.ts` com ALS corrigiu totalmente o potencial de *memory leak* e dados expostos.
- O build completo do Turborepo (NestJS TS) continua rápido (~4.6s) mesmo com validações pesadas em todos os controllers.

**O que deu errado/Dificuldades:**
- A compilação do `bcrypt` precisou de intervenção via shell para rodar `pnpm approve-builds` que travava em prompt interativo. Foi contornado enviando os inputs.

**Próximos passos possíveis:**
- Corrigir a falta de paginação e o filtro ausente do board Kanban (`M1`).
- Mudar para "type": "module" nas dependências internas ou deixar como CommonJS oficial.
- Iniciar o frontend (App/Web).
