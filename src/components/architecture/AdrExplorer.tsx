import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  Copy, 
  Check, 
  ShieldAlert, 
  Sparkles,
  GitCommit,
  Terminal,
  ExternalLink
} from 'lucide-react'
import { ARCHITECTURAL_DECISIONS, type ArchitecturalDecisionRecord } from '@/data/architecturalDecisions'

export default function AdrExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [expandedId, setExpandedId] = useState<string | null>('ADR-001')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = ['All', 'Distributed Systems', 'Concurrency & JVM', 'Security & Caching', 'AI & Protocols']

  const filteredDecisions = ARCHITECTURAL_DECISIONS.filter(adr => {
    if (selectedCategory === 'All') return true
    if (selectedCategory === 'Distributed Systems') {
      return adr.pattern.includes('Saga') || adr.pattern.includes('Outbox')
    }
    if (selectedCategory === 'Concurrency & JVM') {
      return adr.pattern.includes('Virtual Threads')
    }
    if (selectedCategory === 'Security & Caching') {
      return adr.pattern.includes('Caching') || adr.pattern.includes('Zero-Trust')
    }
    if (selectedCategory === 'AI & Protocols') {
      return adr.pattern.includes('Model Context Protocol')
    }
    return true
  })

  const copyAdrMarkdown = (adr: ArchitecturalDecisionRecord) => {
    const md = `# ${adr.id}: ${adr.title}
Status: ${adr.status}
Date: ${adr.date}
Pattern: ${adr.pattern}

## Context
${adr.context}

## Decision
${adr.decision}

## Consequences
### Positive
${adr.consequences.positive.map(p => `- ${p}`).join('\n')}

### Negative & Tradeoffs
${adr.consequences.negative.map(n => `- ${n}`).join('\n')}

## Affected Systems
${adr.affectedSystems.map(s => `- ${s}`).join('\n')}
`
    navigator.clipboard.writeText(md)
    setCopiedId(adr.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b14]/95 p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] mb-2">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>ARCHITECTURAL DECISION RECORDS (ADR)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
            Production Architectural Decision Ledger
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1 max-w-2xl leading-relaxed">
            Formal technical records documenting problem drivers, chosen topology tradeoffs, and blast radius 
            consequences for high-throughput distributed systems.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs ${
                selectedCategory === cat
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ADR Accordion List */}
      <div className="space-y-3">
        {filteredDecisions.map(adr => {
          const isExpanded = expandedId === adr.id

          return (
            <div
              key={adr.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-emerald-500/40 bg-slate-950/90 shadow-lg'
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700/80'
              }`}
            >
              {/* Accordion Trigger */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : adr.id)}
                className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-left transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {adr.id}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {adr.status}
                    </span>
                  </div>

                  <span className="text-sm sm:text-base font-bold text-slate-100 font-editorial">
                    {adr.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
                  <span className="hidden md:inline font-mono text-[11px] text-slate-500 bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded">
                    {adr.pattern}
                  </span>
                  <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Detail Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-slate-800/60"
                  >
                    <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-950/60 to-slate-900/30">
                      {/* Context & Decision Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Context & Problem Driver
                          </span>
                          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                            {adr.context}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <GitCommit className="w-3.5 h-3.5" />
                            Architectural Decision
                          </span>
                          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                            {adr.decision}
                          </p>
                        </div>
                      </div>

                      {/* Consequences (Positive vs Tradeoffs) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                            Verified Positive Outcomes
                          </span>
                          <ul className="space-y-1.5">
                            {adr.consequences.positive.map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-300 font-sans flex items-start gap-2">
                                <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                            Tradeoffs & Blast Radius Constraints
                          </span>
                          <ul className="space-y-1.5">
                            {adr.consequences.negative.map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-400 font-sans flex items-start gap-2">
                                <span className="text-amber-400 font-mono mt-0.5">⚠</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Footer: Systems & Action */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60 font-mono text-xs">
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                          <span className="text-slate-500">Affected Services:</span>
                          {adr.affectedSystems.map(sys => (
                            <span key={sys} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                              {sys}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => copyAdrMarkdown(adr)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors shrink-0"
                          title="Copy Markdown specification to clipboard"
                        >
                          {copiedId === adr.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied Markdown</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy ADR Markdown</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
