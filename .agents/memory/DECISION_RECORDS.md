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

---

## ADR-021: Distributed Event Sourcing & CQRS Snapshotting Sandbox
* **Status:** Accepted & Enforced
* **Target Components:** [`EventSourcingSandbox.tsx`](file:///src/components/architecture/EventSourcingSandbox.tsx), [`eventSourcing.ts`](file:///src/data/eventSourcing.ts), [`ArchitectureLab.tsx`](file:///src/components/portfolio/ArchitectureLab.tsx)
* **Context:** High-throughput transactional architectures require complete audit provenance, deterministic point-in-time replay, and independent scaling of write aggregates and read projections without distributed locking or data migration downtime.
* **Decision:** Implemented an interactive 5-paradigm sandbox demonstrating Append-Only Event Stores with UUIDv7 monotonic version checks and optimistic concurrency control, deterministic functional event folding ($State_t = foldl(applyEvent, InitialState, Events[0..t])$), periodic checkpoint snapshots every 100 events cutting hydration latency by 99% from 180ms to 1.8ms, CQRS read projections via Debezium CDC, and in-flight schema upcasting without destructive database migrations.
* **Blast Radius:** Mounted in `ArchitectureLab.tsx` under `#architecture-event-sourcing`; integrated into `InteractiveCli.tsx` with `eventsourcing` command and `[ $ eventsourcing ]` quick chip; indexed in `index.html` Sub-Section 21 and `public/chat/index.json`. Verified in test 25 of `tests/portfolio.test.mjs`.

---

## ADR-022: Distributed Dead-Letter Queue (DLQ) & Non-Blocking Retry Matrix
* **Status:** Accepted & Enforced
* **Target Components:** [`DlqRetrySandbox.tsx`](file:///src/components/architecture/DlqRetrySandbox.tsx), [`dlqRetryModels.ts`](file:///src/data/dlqRetryModels.ts), [`ArchitectureLab.tsx`](file:///src/components/portfolio/ArchitectureLab.tsx)
* **Context:** Mission-critical event streaming architectures require robust fault isolation, poison-pill quarantine, and zero head-of-line blocking on primary high-throughput partitions (15k TPS) during downstream service disruptions.
* **Decision:** Implemented an interactive 5-paradigm sandbox demonstrating Exponential Backoff with Decorrelated Jitter ($sleep = \min(cap, random(base, sleep \cdot 3))$), Non-Blocking Staggered Kafka Delay Topics (10s, 1m, 5m graduated escalation), Poison Pill Quarantine & Dead-Letter Parking Lot with sub-2ms bypass for deserialization errors, Idempotent Batch DLQ Replay with Circuit Guard and Redis leases, and Causal Watermarking Reconciliation preventing delayed events from corrupting current aggregate states.
* **Blast Radius:** Mounted in `ArchitectureLab.tsx` under `#architecture-dlq-retry`; integrated into `InteractiveCli.tsx` with `dlq`, `retry`, `poisonpill` commands and `[ $ dlq ]` quick chip; indexed in `index.html` Sub-Section 22 and `public/chat/index.json`. Verified in test 26 of `tests/portfolio.test.mjs`.

---

## ADR-023: Distributed Idempotency Key & Two-Phase Ingress Committer Sandbox
* **Status:** Accepted & Enforced
* **Target Components:** [`IdempotencySandbox.tsx`](file:///src/components/architecture/IdempotencySandbox.tsx), [`idempotencyModels.ts`](file:///src/data/idempotencyModels.ts), [`ArchitectureLab.tsx`](file:///src/components/portfolio/ArchitectureLab.tsx)
* **Context:** Financial transaction gateways, e-commerce checkout APIs, and high-frequency webhook listeners require strict exactly-once ingress guarantees to prevent duplicate order submissions, multiple balance deductions, and race conditions during network retries or client double-clicks.
* **Decision:** Implemented an interactive 5-paradigm sandbox demonstrating Redis Redlock with Monotonic Fencing Tokens to guard against distributed lease expiration during GC pauses, IETF RFC 9110 Sliding Window Ingress Gates returning sub-0.8ms cached 201 Created responses for duplicates while rejecting concurrent requests with HTTP 409 Conflict, Database Unique CAS Locks with atomic row reservation (`INSERT ... ON CONFLICT (key) DO NOTHING`), Webhook At-Least-Once Delivery Ledgers with payload signature checks, and Cryptographic Request Fingerprinting with SHA-256 payload canonicalization returning HTTP 422 Unprocessable Entity when mutated payloads attempt key reuse.
* **Blast Radius:** Mounted in `ArchitectureLab.tsx` under `#architecture-idempotency`; integrated into `InteractiveCli.tsx` with `idempotency`, `dedup`, `fencingtoken`, `idempotentkey`, `replayhammer` commands and `[ $ idempotency ]` quick chip; indexed in `index.html` Sub-Section 23 and `public/chat/index.json`. Verified in test 27 of `tests/portfolio.test.mjs`.


## ADR-024: Distributed Two-Phase Commit (2PC) vs Saga Execution & Dual-Write Invariant Matrix Sandbox
* **Status:** Accepted & Enforced
* **Target Components:** [`AtomicCommitSandbox.tsx`](file:///src/components/architecture/AtomicCommitSandbox.tsx), [`atomicCommitModels.ts`](file:///src/data/atomicCommitModels.ts), [`ArchitectureLab.tsx`](file:///src/components/portfolio/ArchitectureLab.tsx)
* **Context:** Mission-critical enterprise architectures spanning heterogeneous datastores (PostgreSQL, MySQL, CockroachDB, Kafka) require rigorous transactional consistency. While classical Two-Phase Commit (2PC) guarantees all-or-nothing atomicity, coordinator crashes freeze participant resources in an in-doubt state with held locks, throttling throughput below 450 TPS.
* **Decision:** Implemented an interactive 5-paradigm sandbox demonstrating Classical Two-Phase Commit (2PC) with coordinator crash simulation and in-doubt lock analysis, Skeen's non-blocking Three-Phase Commit (3PC) with PreCommit quorum progression, Choreographed Sagas with Transactional Outbox (PostgreSQL Debezium CDC) delivering 18,000+ TPS line rates without distributed locks, Dual-Write Invariant Reconciliation & Self-Healing Engine with sliding window CRC-32 hash comparison and automated compensation repair, and Google Spanner TrueTime Paxos-Assisted Atomic Commit with commit wait ($2 \cdot \epsilon$) enforcing global external consistency without single-coordinator failure bottlenecks.
* **Blast Radius:** Mounted in `ArchitectureLab.tsx` under `#architecture-atomic-commit`; integrated into `InteractiveCli.tsx` with `atomiccommit`, `twophasecommit`, `2pc`, `3pc`, `indoubt`, `coordinator` commands and `[ $ 2pc ]` quick chip; indexed in `index.html` Sub-Section 24 and `public/chat/index.json`. Verified in test 28 of `tests/portfolio.test.mjs`.




