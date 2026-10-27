import React, { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Split,
  Sliders,
  BarChart3,
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { ARCHITECTURE_EVOLUTIONS } from '@/data/architectureEvolutions'
import type { ArchitectureEvolutionItem } from '@/data/architectureEvolutions'

export const ArchitectureEvolutionDiff: React.FC = () => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>(ARCHITECTURE_EVOLUTIONS[0].id)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider' | 'deltas'>('side-by-side')
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null)

  const activeItem: ArchitectureEvolutionItem =
    ARCHITECTURE_EVOLUTIONS.find((item) => item.id === selectedSystemId) || ARCHITECTURE_EVOLUTIONS[0]

  const handleCopyRfc = () => {
    const markdown = `# Architecture Evolution RFC: ${activeItem.systemName}
## Focus: ${activeItem.headline}
- **Category:** ${activeItem.category}
- **Governing ADR:** ${activeItem.adrReference}
- **Migration Strategy:** ${activeItem.migrationStrategy}

---

### 1. Legacy Architecture (${activeItem.legacyArchitecture.title})
- **Architecture Type:** ${activeItem.legacyArchitecture.architectureType}
- **Scale Bottleneck:** ${activeItem.legacyArchitecture.bottleneck}
- **Anti-Patterns Eliminated:**
${activeItem.legacyArchitecture.antiPatterns.map((p) => `  * [DEPRECATED] ${p}`).join('\n')}

**Legacy Telemetry Baseline:**
${Object.entries(activeItem.legacyArchitecture.telemetry)
  .map(([k, v]) => `  * ${k}: ${v}`)
  .join('\n')}

\`\`\`java
${activeItem.legacyArchitecture.codeSnippet}
\`\`\`

---

### 2. Modern Architecture (${activeItem.modernArchitecture.title})
- **Architecture Type:** ${activeItem.modernArchitecture.architectureType}
- **Architectural Solution:** ${activeItem.modernArchitecture.solution}
- **Production Invariants Enforced:**
${activeItem.modernArchitecture.invariantsEnforced.map((i) => `  * [ENFORCED] ${i}`).join('\n')}

**Modern Telemetry Verified:**
${Object.entries(activeItem.modernArchitecture.telemetry)
  .map(([k, v]) => `  * ${k}: ${v}`)
  .join('\n')}

\`\`\`
${activeItem.modernArchitecture.codeSnippet}
\`\`\`

---

### 3. Quantified Impact & Metric Deltas
| Metric | Legacy Baseline | Modern Architecture | Improvement Factor |
| :--- | :--- | :--- | :--- |
${activeItem.keyDeltas
  .map((d) => `| ${d.metric} | ${d.before} | ${d.after} | ${d.improvement} |`)
  .join('\n')}
`
    navigator.clipboard.writeText(markdown)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2200)
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeSnippet(id)
    setTimeout(() => setCopiedCodeSnippet(null), 2000)
  }

  return (
    <div className="flex flex-col rounded-2xl bg-[#070b14] border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800/90 font-mono text-xs">
        {/* System Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ARCHITECTURE_EVOLUTIONS.map((item) => {
            const isActive = selectedSystemId === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSelectedSystemId(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-mono cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {item.systemName}
              </button>
            )
          })}
        </div>

        {/* View Mode Switcher & Copy RFC Button */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                viewMode === 'side-by-side' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                viewMode === 'slider' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Diff Slider</span>
            </button>
            <button
              onClick={() => setViewMode('deltas')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                viewMode === 'deltas' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Metric Deltas</span>
            </button>
          </div>

          {/* Copy RFC Button */}
          <button
            onClick={handleCopyRfc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            {copiedRfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedRfc ? 'RFC Copied' : 'Copy RFC Diff'}</span>
          </button>
        </div>
      </div>

      {/* 2. System Context Banner */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-950 via-[#0a1020] to-slate-950 border-b border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                {activeItem.category}
              </span>
              <span className="text-slate-400">Governance:</span>
              <a
                href="#architecture-adr-ledger"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <FileText className="w-3 h-3" />
                <span>{activeItem.adrReference}</span>
              </a>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-editorial">
              {activeItem.headline}
            </h3>
            <p className="text-xs text-slate-400 max-w-4xl">
              <strong className="text-slate-300 font-mono">Migration Strategy:</strong> {activeItem.migrationStrategy}
            </p>
          </div>

          {/* Quantified Highlight Pill */}
          <div className="shrink-0 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-3">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">P99 Latency Delta</div>
              <div className="text-xs sm:text-sm font-mono font-bold text-emerald-300 tabular-nums">
                {activeItem.keyDeltas[0]?.before} -&gt; {activeItem.keyDeltas[0]?.after}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Viewport */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* VIEW MODE 1: SIDE-BY-SIDE SPLIT VIEW */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Legacy Monolith Anti-Pattern Card */}
            <div className="rounded-xl border border-rose-900/50 bg-[#12070c]/80 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Legacy Header */}
                <div className="px-4 py-3 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-rose-300">
                      V1: LEGACY ARCHITECTURE
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 border border-rose-800 text-rose-400">
                    ANTI-PATTERN
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-rose-200">
                      {activeItem.legacyArchitecture.title}
                    </h4>
                    <p className="text-xs font-mono text-rose-400/90 mt-0.5">
                      {activeItem.legacyArchitecture.architectureType}
                    </p>
                  </div>

                  {/* Bottleneck Driver */}
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/30 text-xs text-rose-300 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-rose-400 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Root Bottleneck:</span>
                    </div>
                    {activeItem.legacyArchitecture.bottleneck}
                  </div>

                  {/* Anti-Patterns List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Eliminated Anti-Patterns:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {activeItem.legacyArchitecture.antiPatterns.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold shrink-0">x</span>
                          <span className="leading-snug">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Legacy Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {Object.entries(activeItem.legacyArchitecture.telemetry).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-slate-950/60 border border-rose-950/60">
                        <div className="text-[10px] font-mono text-slate-400">{k}</div>
                        <div className="text-xs font-mono font-bold text-rose-400 tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Legacy Code Snippet */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{activeItem.legacyArchitecture.codeSnippetTitle}</span>
                      <button
                        onClick={() => handleCopyCode(activeItem.legacyArchitecture.codeSnippet, 'legacy')}
                        className="hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeSnippet === 'legacy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCodeSnippet === 'legacy' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#080306] border border-rose-950 text-[11px] font-mono text-rose-300 overflow-x-auto leading-relaxed">
                      <code>{activeItem.legacyArchitecture.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Modern Distributed Cloud Architecture Card */}
            <div className="rounded-xl border border-emerald-900/50 bg-[#051111]/80 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Modern Header */}
                <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      V2: MODERN DISTRIBUTED MESH
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-700 text-emerald-400">
                    INVARIANT ENFORCED
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-200">
                      {activeItem.modernArchitecture.title}
                    </h4>
                    <p className="text-xs font-mono text-cyan-400/90 mt-0.5">
                      {activeItem.modernArchitecture.architectureType}
                    </p>
                  </div>

                  {/* Modern Solution */}
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/30 text-xs text-emerald-300 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-400 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Production Solution:</span>
                    </div>
                    {activeItem.modernArchitecture.solution}
                  </div>

                  {/* Invariants Enforced List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Verified System Invariants:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {activeItem.modernArchitecture.invariantsEnforced.map((inv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{inv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modern Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {Object.entries(activeItem.modernArchitecture.telemetry).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-slate-950/60 border border-emerald-950/60">
                        <div className="text-[10px] font-mono text-slate-400">{k}</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Modern Code Snippet */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{activeItem.modernArchitecture.codeSnippetTitle}</span>
                      <button
                        onClick={() => handleCopyCode(activeItem.modernArchitecture.codeSnippet, 'modern')}
                        className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeSnippet === 'modern' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCodeSnippet === 'modern' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#020a0a] border border-emerald-950 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{activeItem.modernArchitecture.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: INTERACTIVE DIFF SLIDER */}
        {viewMode === 'slider' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
              <span className="text-rose-400 font-bold">&lt;- Slide Left: Legacy Baseline</span>
              <span className="text-cyan-300 font-bold">Slide Position: {sliderPosition}%</span>
              <span className="text-emerald-400 font-bold">Slide Right: Modern Mesh -&gt;</span>
            </div>

            {/* Range Slider Control */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Visual Slider Container */}
            <div className="relative rounded-xl border border-slate-800 bg-[#060a12] p-6 overflow-hidden min-h-[380px]">
              {sliderPosition < 50 ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>LEGACY MONOLITH INSPECTION ({100 - sliderPosition * 2}% REVEALED)</span>
                  </div>
                  <h4 className="text-lg font-bold text-rose-200">{activeItem.legacyArchitecture.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{activeItem.legacyArchitecture.bottleneck}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    {Object.entries(activeItem.legacyArchitecture.telemetry).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40">
                        <div className="text-[10px] font-mono text-slate-400">{k}</div>
                        <div className="text-sm font-mono font-bold text-rose-400 tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MODERN CLOUD ARCHITECTURE INSPECTION ({sliderPosition}% ENFORCED)</span>
                  </div>
                  <h4 className="text-lg font-bold text-emerald-200">{activeItem.modernArchitecture.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{activeItem.modernArchitecture.solution}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    {Object.entries(activeItem.modernArchitecture.telemetry).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
                        <div className="text-[10px] font-mono text-slate-400">{k}</div>
                        <div className="text-sm font-mono font-bold text-emerald-400 tabular-nums">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: QUANTIFIED METRIC DELTAS TABLE */}
        {(viewMode === 'deltas' || viewMode === 'side-by-side') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
                Production Impact & Metric Deltas ({activeItem.keyDeltas.length} Invariants Measured)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Validated in Staging & Production Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeItem.keyDeltas.map((delta, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="text-[11px] font-mono text-slate-400 truncate mb-1">
                    {delta.metric}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-mono text-rose-400/90 line-through tabular-nums">
                      {delta.before}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-sm font-mono font-bold text-emerald-300 tabular-nums">
                      {delta.after}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-cyan-400 font-semibold">
                    {delta.improvement}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchitectureEvolutionDiff
