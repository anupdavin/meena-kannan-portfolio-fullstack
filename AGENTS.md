# Agent Operating Guidelines & Engineering Best Practices

Welcome to the **Meena Kannan Full-Stack Architecture Portfolio** codebase. All AI coding agents operating in this repository (Antigravity, Cursor, Claude Code, Codex, etc.) must follow these protocols.

---

## 1. Core Operating Methodology
This repository adheres to the **Superpowers** disciplined engineering framework ([obra/superpowers](https://github.com/obra/superpowers)) and persistent codebase memory practices ([DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) & [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)).

### The 5-Step Agent Cycle
1. **Explore & Contextualize**:
   - Read [`.agents/AGENT_MEMORY.md`](file:///c:/Users/MeenaDavin/Documents/GitHub/meena-kannan-portfolio-fullstack/.agents/AGENT_MEMORY.md) to understand current progress, active backlog items, and past lessons.
   - Consult [`.agents/memory/CODEGRAPH.json`](file:///c:/Users/MeenaDavin/Documents/GitHub/meena-kannan-portfolio-fullstack/.agents/memory/CODEGRAPH.json) to calculate the dependency blast radius of any file you plan to change.
   - Review [`.agents/memory/DECISION_RECORDS.md`](file:///c:/Users/MeenaDavin/Documents/GitHub/meena-kannan-portfolio-fullstack/.agents/memory/DECISION_RECORDS.md) for architectural constraints.
2. **Formulate Reversible Plan**:
   - Break tasks into atomic, single-responsibility changes.
3. **Verify Existing State (TDD)**:
   - Run `npm test` before touching code.
4. **Implement High-Craft Changes**:
   - Strictly follow [`DESIGN.md`](file:///c:/Users/MeenaDavin/Documents/GitHub/meena-kannan-portfolio-fullstack/DESIGN.md) (Swiss Editorial, Terminal Dark, OLED blacks, WCAG AAA contrast, zero AI-slop).
5. **Quality Gate & Memory Persistence**:
   - Verify: `npm test && npm run lint && npm run build`
   - Refresh codegraph if exports changed: `node scripts/generate-codegraph.mjs`
   - Update [`.agents/AGENT_MEMORY.md`](file:///c:/Users/MeenaDavin/Documents/GitHub/meena-kannan-portfolio-fullstack/.agents/AGENT_MEMORY.md) with accomplishments and learnings.

---

## 2. Code Quality & Anti-Slop Rules
* **No Generic Comments**: Remove tautological comments like `// Render the button` or generic score-keeping tags.
* **No Unsplash Stock Photos**: All architecture visualizations must use native SVG / interactive canvas components.
* **Strict Design System Tokens**: Use the color and spacing tokens specified in `DESIGN.md`. Do not introduce arbitrary inline styles or mismatching colors.
* **Accessibility**: Every interactive element must support keyboard navigation (`tabIndex`, Enter/Space triggers) and `focus-visible` styling.

---

## 3. Key Available Commands
* `npm test`: Runs node test runner suite across unit, responsive, and architecture tests.
* `npm run lint`: Runs ESLint 9 across all files.
* `npm run build`: Typechecks (`tsc -b`), bundles with Vite, and runs the pre-renderer audit.
* `node scripts/generate-codegraph.mjs`: Re-indexes the codebase dependency graph.
