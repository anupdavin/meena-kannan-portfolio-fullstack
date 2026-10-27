import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitCompare, 
  CheckCircle2, 
  Copy, 
  ChevronRight, 
  Zap, 
  Layers, 
  Cpu
} from 'lucide-react'
import { ARCHITECTURAL_TRADEOFFS } from '@/data/architecturalTradeoffs'

export default function TradeoffMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeTradeoffId, setActiveTradeoffId] = useState<string>(ARCHITECTURAL_TRADEOFFS[0].id)
  const [copied, setCopied] = useState<boolean>(false)

  const categories = ['All', 'Distributed Transactions', 'AI & Context', 'Concurrency & JVM', 'Protocols & APIs']

  const filteredTradeoffs = selectedCategory === 'All' 
    ? ARCHITECTURAL_TRADEOFFS 
    : ARCHITECTURAL_TRADEOFFS.filter(t => t.category === selectedCategory)

  const activeTradeoff = ARCHITECTURAL_TRADEOFFS.find(t => t.id === activeTradeoffId) || filteredTradeoffs[0]

  const handleCopyMarkdown = () => {
    const md = `### Architectural Trade-off Analysis: ${activeTradeoff.title}
**Category:** ${activeTradeoff.category}
**Summary:** ${activeTradeoff.summary}

#### Paradigms Compared
${activeTradeoff.options.map((opt, i) => `
${i + 1}. **${opt.name}** (${opt.paradigm})
   * **Best For:** ${opt.bestFor}
   * **Avoid When:** ${opt.avoidWhen}
   * **Production Metric:** ${opt.productionMetric}
   * **Invariant:** ${opt.invariant}
`).join('')}

#### Evaluation Criteria Scoring (1 - 5 Scale)
| Evaluation Metric | ${activeTradeoff.options.map(o => o.name).join(' | ')} | Architectural Notes |
| :--- | ${activeTradeoff.options.map(() => ':---:').join(' | ')} | :--- |
${activeTradeoff.criteria.map(c => `| ${c.label} | ${c.scoreA}/5 | ${c.scoreB}/5 | ${c.scoreC !== undefined ? `${c.scoreC}/5 | ` : ''}${c.note} |`).join('\n')}

#### Production Verdict
> ${activeTradeoff.productionVerdict}

**Case Study:** ${activeTradeoff.caseStudy}
*Source: Meena Kannan Full-Stack Architecture Portfolio (meenakannan.dev)*`

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(md.trim())
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#060a12]/95 text-slate-100 p-4 sm:p-7 shadow-2xl overflow-hidden">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/70 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center gap-1.5">
              <GitCompare className="w-3 h-3 text-amber-400" />
              <span>Architectural Trade-Off Matrix</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              • Evaluation & Invariants
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial tracking-tight">
            System Design Decision Matrix
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Side-by-side comparative analysis of distributed paradigms, latency trade-offs, failure modes, and production invariants.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shrink-0"
          aria-label="Export trade-off analysis as Markdown"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied Markdown!' : 'Export Analysis'}</span>
        </button>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-thin">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                const first = cat === 'All' 
                  ? ARCHITECTURAL_TRADEOFFS[0] 
                  : ARCHITECTURAL_TRADEOFFS.find(t => t.category === cat)
                if (first) setActiveTradeoffId(first.id)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-bold'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* 3. Trade-off Topic Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
        {filteredTradeoffs.map(item => {
          const isActive = item.id === activeTradeoff.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTradeoffId(item.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold block mb-1">
                  {item.category}
                </span>
                <div className="text-xs font-editorial font-bold text-slate-100 line-clamp-2">
                  {item.title}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{item.options.length} Paradigms</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'}`} />
              </div>
            </button>
          )
        })}
      </div>

      {/* 4. Active Comparison Deck */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTradeoff.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Evaluation Scope
              </div>
              <h4 className="text-base sm:text-lg font-bold font-editorial text-white">
                {activeTradeoff.title}
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-3xl">
                {activeTradeoff.summary}
              </p>
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>3-Way Matrix</span>
            </div>
          </div>

          {/* Side-by-Side Architectural Paradigm Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTradeoff.options.map((opt, idx) => {
              const borderStyles = [
                'border-emerald-500/30 hover:border-emerald-500/60',
                'border-cyan-500/30 hover:border-cyan-500/60',
                'border-purple-500/30 hover:border-purple-500/60'
              ]
              const badgeStyles = [
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                'bg-purple-500/10 text-purple-400 border-purple-500/30'
              ]
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border bg-slate-950/80 transition-all flex flex-col justify-between space-y-4 ${borderStyles[idx % borderStyles.length]}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${badgeStyles[idx % badgeStyles.length]}`}>
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {opt.paradigm.split('(')[0].trim()}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold font-editorial text-white">
                      {opt.name}
                    </h5>

                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      {opt.paradigm}
                    </div>

                    <div className="space-y-2 pt-2 text-xs font-sans">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide block mb-0.5">
                          ✓ Best For
                        </span>
                        <p className="text-slate-300 leading-snug">
                          {opt.bestFor}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wide block mb-0.5">
                          ⚠ Avoid When
                        </span>
                        <p className="text-slate-400 leading-snug">
                          {opt.avoidWhen}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Production Metric & Key Invariant */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                      <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span className="font-semibold">{opt.productionMetric}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80 leading-relaxed">
                      <span className="text-cyan-400 font-bold">Invariant: </span>
                      {opt.invariant}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Scoring Comparison Matrix */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-950/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                Evaluation Criteria Breakdown
              </span>
              <span className="text-slate-500">
                1 (Low) to 5 (Superior)
              </span>
            </div>

            <div className="space-y-3">
              {activeTradeoff.criteria.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-mono text-slate-200 font-medium">
                      {c.label}
                    </span>
                    <span className="text-[11px] font-sans text-slate-400 italic">
                      {c.note}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 truncate max-w-[130px]">{activeTradeoff.options[0]?.name || 'Opt A'}</span>
                      <span className="font-bold text-slate-100 tabular-nums">{c.scoreA} / 5</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 truncate max-w-[130px]">{activeTradeoff.options[1]?.name || 'Opt B'}</span>
                      <span className="font-bold text-slate-100 tabular-nums">{c.scoreB} / 5</span>
                    </div>
                    {c.scoreC !== undefined && (
                      <div className="col-span-2 sm:col-span-1 p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-purple-400 truncate max-w-[130px]">{activeTradeoff.options[2]?.name || 'Opt C'}</span>
                        <span className="font-bold text-slate-100 tabular-nums">{c.scoreC} / 5</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Production Verdict & Case Study Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Principal Architect Verdict
              </span>
              <span className="text-xs font-mono text-slate-400">
                • Production Decision
              </span>
            </div>

            <p className="text-xs sm:text-sm font-sans font-medium text-slate-200 leading-relaxed">
              {activeTradeoff.productionVerdict}
            </p>

            <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span><strong className="text-teal-400">Case Study:</strong> {activeTradeoff.caseStudy}</span>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">
                Verified in Production ✓
              </span>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
