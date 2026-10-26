# Design System Contract: Swiss Technical Editorial

## 1. Aesthetic Genre & Direction
- **Genre:** Swiss Technical Editorial (influenced by Oxide Computer, Linear, and Stripe Press).
- **Core Philosophy:** High-density, credible technical communication. Zero ornamental filler, zero dev-cosplay gimmicks. Crisp contrast, intentional negative space, architectural clarity.

## 2. Typography Discipline (Hallmark 2+1 Rule)
- **Primary Display Sans:** Plus Jakarta Sans (semi-bold / bold weights for section headlines and system titles).
- **Body Sans:** Inter (regular / medium weights for analytical prose, ADR descriptions, and timeline documentation).
- **Monospace:** JetBrains Mono.
  - **Mandatory Rule:** `font-variant-numeric: tabular-nums` MUST be applied to all metrics, latencies, throughput counters, data badges, and SVG diagram labels to eliminate layout shifts during state transitions.

## 3. Global Hard Bans
1. **Zero Em-Dashes and En-Dashes:**
   - Absolute ban on `\u2014` (`—`), `\u2013` (`–`), and `&mdash;` in all source files, UI copy, JSON schemas, metadata, and ADR text. Use colons, semicolons, parentheses, or clean sentence restructuring.
2. **Zero Bouncing Mouse Scroll Indicators:**
   - Banned: "Scroll to view more", animated scroll wheel SVGs, bouncing arrows at the bottom of hero sections. Layouts must achieve natural visual peering above the fold.
3. **Zero Dev-Cosplay Syntax:**
   - Banned: `<MeenaKannan.dev />` tag branding. (Use clean typographic wordmark: `Meena Kannan` with title `Principal Systems & Cloud Architect`).
   - Banned: `//` prefixed navigation labels (`// home`, `// about`, etc.). Use clean labels: `Home`, `About`, `Architecture`, `Projects`, `Experience`, `Contact`.
   - Banned: Static status pills (`CLUSTER ONLINE • PROD READY`).
   - Banned: Simulated fake `whoami` CLI terminal engines and pseudo bash shells.

## 4. Color Palette & Token Hierarchy
- **Base Background:** `#06090e` (Obsidian Deep)
- **Elevated Canvas:** `#0b1120` (Dark Slate Editorial)
- **Surface Layer:** `#111c33` (Card and Workbench Container)
- **Border Default:** `rgba(255, 255, 255, 0.08)` / `#1e293b`
- **Border Active / Focus:** `rgba(56, 189, 248, 0.4)` / `rgba(16, 185, 129, 0.4)`
- **Text Primary:** `#f8fafc` (Slate 50)
- **Text Secondary:** `#94a3b8` (Slate 400)
- **Text Muted / Mono:** `#64748b` (Slate 500)
- **Semantic Accents:**
  - Emerald (`#10b981`): Healthy state, verified transactions, low-latency paths.
  - Cyan (`#06b6d4` / `#38bdf8`): Ingress protocols, network edge, control plane.
  - Amber (`#f59e0b`): Throttling, retry loops, WAL replication buffers.
  - Rose (`#f43f5e`): DLQ routing, backpressure shed, circuit breaker trip.

## 5. ByteByteGo SVG Diagram Specifications
- **Standard Viewport:** `viewBox="0 0 960 540"` with responsive vector scaling (`w-full h-auto`).
- **Containers:** Dashed security boundary boxes (`strokeDasharray="6 4"`, stroke width `1.5`).
- **Semantic Component Glyphs:**
  - Database: Multi-disc 3D storage cylinder with ACID/WAL ledger indicators.
  - Streaming Broker: Partitioned queue pipe with offset indices (Partitions 0..2).
  - Gateway / Ingress: Hexagonal perimeter shield with rate limiter token bucket.
  - Cache / In-Memory: Segmented memory grid with TTL markers.
- **Numbered Sequence Callouts:** Circular step badges (`1`, `2`, `3`, `4`) with monospace protocol metadata badges (`mTLS`, `gRPC`, `Debezium CDC`, `Idempotency-Key`).
- **Dual-State Simulation:** Every workbench must support interactive toggling between [Normal Flow] and [Failure / Backpressure Simulation].
- **Inline Node Inspector:** Clicking any architectural node displays runtime specs with tabular numbers without layout jitter.
