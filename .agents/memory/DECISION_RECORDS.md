# Architecture Decision Records (ADRs) & Codebase Knowledge
**Inspired by:** [`DeusData/codebase-memory-mcp`](https://github.com/DeusData/codebase-memory-mcp) & [`colbymchenry/codegraph`](https://github.com/colbymchenry/codegraph)  
**Maintained For:** Meena Kannan Portfolio Full-Stack  

This document serves as the persistent semantic memory layer for AI coding agents. It connects architectural rationale directly to components, state models, and routes.

---

## ADR-001: Zero Stock Imagery in Favor of Interactive ByteByteGo Diagrams
* **Status:** Accepted & Enforced
* **Target Components:** [`SystemDesignCanvas.tsx`](file:///src/components/architecture/SystemDesignCanvas.tsx), [`ArchNode.tsx`](file:///src/components/architecture/ArchNode.tsx), [`AnimatedConnection.tsx`](file:///src/components/architecture/AnimatedConnection.tsx)
* **Context:** Senior/Principal engineering portfolios that rely on generic Unsplash stock photos look artificial and templated ("AI-slop"). 
* **Decision:** Replaced all third-party stock photos with native, interactive SVG architecture workbenches modeled after ByteByteGo system design standards.
* **Blast Radius:** `ProjectsShowcase.tsx` and `ArchitectureLab.tsx`. Modifying canvas coordinates requires updating `src/data/byteByteGoConfigs.ts` and `src/data/architectureSystems.ts`.

---

## ADR-002: Dynamic Acyclic Graph (DAG) Task Engine for Agentic Workflows
* **Status:** Accepted & Enforced
* **Target Components:** [`AgenticWorkflowDiagram.tsx`](file:///src/components/architecture/AgenticWorkflowDiagram.tsx)
* **Context:** Need to visually demonstrate Meena's capabilities in architecting multi-agent orchestrator-worker workflows.
* **Decision:** Implemented an acyclic dependency graph simulation showing goal breakdown, plan generation, and worker fanout with live token streaming counters.
* **Blast Radius:** Embedded inside `AboutTerminal.tsx`. Requires strict adherence to reduced-motion media queries.

---

## ADR-003: Double-Buffered Matrix Rain & Minimal DOM Footprint
* **Status:** Accepted & Enforced
* **Target Components:** [`MatrixBackground.tsx`](file:///src/components/MatrixBackground.tsx), [`TerminalHero.tsx`](file:///src/components/portfolio/TerminalHero.tsx)
* **Context:** Canvas animations frequently throttle main-thread performance and violate accessibility guidelines for users with vestibular sensitivity.
* **Decision:** Canvas drops are rendered with requestAnimationFrame, capped at 30fps with automatic paused rendering on tab blur or `prefers-reduced-motion: reduce`.
* **Blast Radius:** Global layout in `src/pages/Layout.tsx`.

---

## ADR-004: Anti-Scraping Dynamic Contact Obfuscation
* **Status:** Accepted & Enforced
* **Target Components:** [`ContactTerminal.tsx`](file:///src/components/portfolio/ContactTerminal.tsx)
* **Context:** Cloudflare email obfuscation or plain-text mailto links trigger spam bots and scraper flags.
* **Decision:** Email is dynamically generated in client memory and combined with an accessible one-click copy toast notification.
* **Blast Radius:** Verified in `tests/portfolio.test.mjs`.

---

## ADR-005: Static Pre-rendering & SEO Landmarks
* **Status:** Accepted & Enforced
* **Target Files:** [`scripts/prerender.mjs`](file:///scripts/prerender.mjs), [`index.html`](file:///index.html)
* **Context:** Single-Page Applications (SPAs) often fail social preview crawlers and initial landmark screen-reader scans.
* **Decision:** Build pipeline executes `node scripts/prerender.mjs` post-build, injecting OpenGraph metadata, JSON-LD structured schemas, and semantic landmark elements into the final `dist/index.html`.


---

## ADR-006: ByteByteGo AI & Distributed Systems Architecture Codex
* **Status:** Accepted & Enforced
* **Target Components:** [`ByteByteGoAiCodex.tsx`](file:///src/components/architecture/ByteByteGoAiCodex.tsx), [`ArchitectureLab.tsx`](file:///src/components/portfolio/ArchitectureLab.tsx)
* **Context:** Modern Lead/Principal Architects must demonstrate deep mastery over Agentic AI, Large Reasoning Models (LRMs), Vector Search, RAG, and the Model Context Protocol (MCP).
* **Decision:** Implemented a dedicated 3-column visual codex matching ByteByteGo's editorial infographic standards. Features dual-mode rendering (Terminal Dark / Studio Canvas) and vector SVG schematics.
* **Blast Radius:** Integrated inside `ArchitectureLab.tsx`. Tested with zero regression to existing layout.
