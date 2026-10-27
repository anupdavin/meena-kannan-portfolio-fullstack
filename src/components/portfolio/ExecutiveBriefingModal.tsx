import React, { useState, useEffect } from 'react'
import {
  X,
  Copy,
  Check,
  Download,
  Mail,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { EXECUTIVE_BRIEFING } from '@/data/executiveBriefing'

export interface ExecutiveBriefingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedMemo, setCopiedMemo] = useState(false)

  // Escape key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyMemo = () => {
    const memo = `# Executive Briefing: ${EXECUTIVE_BRIEFING.candidateName}
**Role:** ${EXECUTIVE_BRIEFING.targetRole}  
**Experience:** ${EXECUTIVE_BRIEFING.experienceYears} | **Location:** ${EXECUTIVE_BRIEFING.location}  
**Contact:** ${EXECUTIVE_BRIEFING.contact.email} | [LinkedIn](${EXECUTIVE_BRIEFING.contact.linkedin}) | [GitHub](${EXECUTIVE_BRIEFING.contact.github})

---

### Executive Value Proposition
${EXECUTIVE_BRIEFING.coreValueProposition}

---

### 1. Architectural Pillars & Core Competencies
${EXECUTIVE_BRIEFING.pillars
  .map(
    (p, idx) => `#### ${idx + 1}. ${p.title}
- **Stack:** ${p.technologies}
- **Architecture:** ${p.description}
- **Invariant:** ${p.invariant}`
  )
  .join('\n\n')}

---

### 2. Quantified Production Outcomes
| Metric | Baseline | Modern Outcome | Production Impact |
| :--- | :--- | :--- | :--- |
${EXECUTIVE_BRIEFING.verifiedOutcomes
  .map((o) => `| ${o.metric} | ${o.before} | ${o.after} | ${o.impact} |`)
  .join('\n')}

---

### 3. Production Architectural Decision Records (ADRs)
${EXECUTIVE_BRIEFING.governingAdrs.map((a) => `- **${a.id}:** ${a.title} (${a.impact})`).join('\n')}

---

### 4. Engagement Scope
${EXECUTIVE_BRIEFING.engagementModels.map((m) => `- **${m.roleTitle}:** ${m.scope} [${m.availability}]`).join('\n')}
`
    navigator.clipboard.writeText(memo)
    setCopiedMemo(true)
    setTimeout(() => setCopiedMemo(false), 2200)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-sans"
    >
      {/* Modal Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl my-auto rounded-2xl bg-[#070b14] border border-slate-700/80 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* 1. Header Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="briefing-title" className="text-base sm:text-lg font-bold text-white font-editorial">
                  {EXECUTIVE_BRIEFING.candidateName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
                  Executive Dossier
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {EXECUTIVE_BRIEFING.targetRole} | {EXECUTIVE_BRIEFING.experienceYears}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedMemo ? 'Memo Copied' : 'Copy Memo (Markdown)'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close Executive Briefing"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Executive Summary Hero */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-[#0a1222] to-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Value Proposition</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {EXECUTIVE_BRIEFING.coreValueProposition}
            </p>
          </div>

          {/* 3 Pillars of Architectural Competency */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architectural Pillars & Technical Scope</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXECUTIVE_BRIEFING.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white font-editorial leading-snug">
                      {pillar.title}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400/90 leading-tight">
                      {pillar.technologies}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10.5px] font-mono text-emerald-400 font-semibold">
                    Invariant: {pillar.invariant}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantified Production Outcomes Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quantified Production Business Outcomes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXECUTIVE_BRIEFING.verifiedOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800"
                >
                  <div className="text-[11px] font-mono text-slate-400 truncate mb-1">
                    {outcome.metric}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-mono text-rose-400 line-through tabular-nums">
                      {outcome.before}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-sm font-mono font-bold text-emerald-300 tabular-nums">
                      {outcome.after}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-300 leading-tight">
                    {outcome.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governing ADRs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verified Architectural Decision Records (ADRs)</span>
              </span>
              <a
                href="#architecture-adr-ledger"
                onClick={onClose}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-normal lowercase"
              >
                <span>inspect in adr explorer</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
              {EXECUTIVE_BRIEFING.governingAdrs.map((adr) => (
                <div
                  key={adr.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2"
                >
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold shrink-0">
                    {adr.id}
                  </span>
                  <div className="overflow-hidden">
                    <div className="text-slate-200 font-semibold truncate">{adr.title}</div>
                    <div className="text-[10.5px] text-emerald-400">{adr.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Models */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Roles & Engagement Scope</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXECUTIVE_BRIEFING.engagementModels.map((model, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white font-editorial">{model.roleTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{model.scope}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                    {model.availability}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono"
            >
              {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedMemo ? 'Copied' : 'Copy Memo'}</span>
            </button>
            <a
              href={EXECUTIVE_BRIEFING.contact.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download CV (PDF)</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${EXECUTIVE_BRIEFING.contact.email}?subject=Executive%20Briefing%20Inquiry%20-%20Meena%20Kannan`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-950" />
              <span>Contact Meena</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveBriefingModal
