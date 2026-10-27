---
name: codebase-memory
description: Codebase intelligence, semantic memory, and dependency blast-radius analysis inspired by DeusData/codebase-memory-mcp and colbymchenry/codegraph.
metadata:
  icon: network
---

# Codebase Memory & Impact Graph
*Inspired by [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) & [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)*

This skill provides AI coding agents with persistent codebase intelligence, symbol relationships, and impact analysis so they can modify code with high confidence and minimal token overhead.

---

## 1. The Three Layers of Codebase Memory

1. **Structural Dependency Layer (`.agents/memory/CODEGRAPH.json`)**:
   - Pre-indexed graph of every file in `src/`, mapping imports, exports, and file-level relationships.
   - Run `node scripts/generate-codegraph.mjs` to re-sync whenever files are added or renamed.
2. **Architectural Semantic Layer (`.agents/memory/DECISION_RECORDS.md`)**:
   - Architecture Decision Records (ADRs) that explain *why* components are structured the way they are.
   - Connects business context and technical constraints directly to code symbols.
3. **Continuous Agent Evolution Layer (`.agents/AGENT_MEMORY.md`)**:
   - Running ledger of completed improvements, known gotchas, and prioritized backlog tasks.
   - Guarantees continuity across multiple agent sessions and scheduled runs.

---

## 2. Blast Radius & Impact Analysis Protocol

Before refactoring or altering any component or exported function:

1. **Check Exporters & Importers in `.agents/memory/CODEGRAPH.json`**:
   - Locate the target file key (e.g. `src/components/architecture/ArchNode.tsx`).
   - Identify all inward dependency edges (files where `target` equals this component).
2. **Review Connected Test Suites**:
   - Check `tests/portfolio.test.mjs` to see what subtests assert behavior on the target component.
3. **Execute Safe Changes**:
   - If an interface or prop definition changes, update all consumers in the blast radius simultaneously.
4. **Post-Change Graph Refresh**:
   ```bash
   node scripts/generate-codegraph.mjs
   ```

---

## 3. Persistent Memory Maintenance

Whenever you complete a coding cycle:
1. Append an entry to Section 2 ("Memory & Continuous Learning Log") in `.agents/AGENT_MEMORY.md`.
2. Check off or add backlog items in Section 3 ("Prioritized Improvement Backlog").
3. Document any newly created architectural conventions in `.agents/memory/DECISION_RECORDS.md`.
