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

## Registro 03 - 02/09/2026 - Kickoff da Fase 1: Setup & Modelagem

### 🎯 Objetivo da Etapa
* Configurar o ambiente do projeto (estrutura de monorepo com Turborepo e pnpm workspaces).
* Modelar os Schemas do Drizzle ORM para PostgreSQL 16 com isolamento RLS e entidades comerciais desacopladas.
* Compilar pacotes `@crm/shared` e `@crm/database` e gerar migrações SQL.

### ✅ O que deu certo
* **Monorepo Inicializado:** Turborepo + pnpm workspaces configurado com TypeScript Strict Mode.
* **Pacote Compartilhado (`@crm/shared`):** Enums (`UserRole`, `DealStatus`, `OrderStatus`, `NicheTemplate`) e tipos de tracking (`TrackingParams`, `PostbackPayload`) compilados com sucesso via `tsc`.
* **Pacote de Banco (`@crm/database`):**
  * Schemas Drizzle ORM modelados e desacoplados para 11 tabelas (`tenants`, `users`, `tenant_users`, `contacts`, `pipelines`, `pipeline_stages`, `deals`, `deal_tracking`, `products`, `orders`, `order_items`).
  * Helper `withTenantContext` implementado usando transações com `set_config('app.current_tenant_id', tenantId, true)`.
  * Script SQL de migração RLS criado com políticas `USING` e `WITH CHECK`.
  * Migrações SQL geradas com sucesso via `drizzle-kit generate` (`0000_light_bruce_banner.sql`).
* **Compilação 100% Type-Safe:** `pnpm run build` executou e validou todos os pacotes em 2.4s.

### ⚠️ O que deu errado / Incidentes
* **Sandbox Network Limit na primeira execução:** O `pnpm install` falhou inicialmente no modo sandbox sem rede (retornou `ENOTFOUND` para o registry npm). Resolvido executando com permissão de rede (`BypassSandbox: true`), instalando 45 pacotes em 3.5s.

---
*(Este arquivo será atualizado a cada nova funcionalidade implementada, teste executado ou erro encontrado)*
