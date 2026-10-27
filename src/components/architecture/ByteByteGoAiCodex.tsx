import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Brain, 
  Database, 
  Search, 
  Share2, 
  Sun, 
  Moon, 
  Download,
  CheckCircle2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export interface AiTermSpec {
  id: string
  title: string
  category: string
  icon: typeof Bot
  colorTheme: {
    accent: string
    badgeBg: string
    badgeText: string
    border: string
    glow: string
  }
  definition: string
  realWorldExamples: string[]
  svgSchematicType: 'agent' | 'reasoning' | 'vectordb' | 'rag' | 'mcp'
  technicalSpecs: {
    protocol: string
    latencyTarget: string
    keyInvariant: string
    productionStack: string
  }
}

const AI_TERMS: AiTermSpec[] = [
  {
    id: 'agentic-ai',
    title: 'Agentic AI',
    category: 'Autonomous Systems',
    icon: Bot,
    colorTheme: {
      accent: '#10b981', // emerald
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeText: '#34d399',
      border: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.25)'
    },
    definition: 'Goal-driven AI agent operating in continuous perception-action loops',
    realWorldExamples: ['AutoGPT', 'Devin', 'LangGraph Multi-Agent Workflows'],
    svgSchematicType: 'agent',
    technicalSpecs: {
      protocol: 'ReAct / Plan-and-Solve (DAG Loop)',
      latencyTarget: '< 2.5s per reasoning iteration',
      keyInvariant: 'Dynamic acyclic dependency validation prevents deadlock loops',
      productionStack: 'Python LangGraph, Java 21 Spring AI, Docker Sandboxes'
    }
  },
  {
    id: 'lrm',
    title: 'Large Reasoning Model (LRM)',
    category: 'Cognitive Models',
    icon: Brain,
    colorTheme: {
      accent: '#06b6d4', // cyan
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      badgeText: '#38bdf8',
      border: 'rgba(6, 182, 212, 0.3)',
      glow: 'rgba(6, 182, 212, 0.25)'
    },
    definition: 'Multi-step reasoning LLM using test-time compute & chain-of-thought traces',
    realWorldExamples: ['OpenAI o3 / o4', 'DeepSeek-R1', 'Anthropic Claude Extended Thinking'],
    svgSchematicType: 'reasoning',
    technicalSpecs: {
      protocol: 'Chain-of-Thought (CoT) with Self-Reflection',
      latencyTarget: 'Adaptive test-time compute (5s - 60s)',
      keyInvariant: 'Backtracking search over intermediate reasoning steps before answer emission',
      productionStack: 'Reinforcement Learning via Verifiable Rewards (RLVR)'
    }
  },
  {
    id: 'vectordb',
    title: 'Vector Database',
    category: 'Storage & Embeddings',
    icon: Database,
    colorTheme: {
      accent: '#8b5cf6', // purple
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      badgeText: '#a78bfa',
      border: 'rgba(139, 92, 246, 0.3)',
      glow: 'rgba(139, 92, 246, 0.25)'
    },
    definition: 'High-dimensional similarity search engine indexed for nearest neighbors',
    realWorldExamples: ['Pinecone', 'Weaviate', 'Milvus', 'PostgreSQL pgvector'],
    svgSchematicType: 'vectordb',
    technicalSpecs: {
      protocol: 'HNSW (Hierarchical Navigable Small World) / IVFFlat',
      latencyTarget: '< 15ms p99 similarity retrieval',
      keyInvariant: 'Cosine / Dot product similarity over 1536d - 3072d dense float vectors',
      productionStack: 'PostgreSQL 16 + pgvector, Redis Vector Search, Qdrant'
    }
  },
  {
    id: 'rag',
    title: 'Retrieval Augmented Generation (RAG)',
    category: 'Context Augmentation',
    icon: Search,
    colorTheme: {
      accent: '#f59e0b', // amber
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeText: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.25)'
    },
    definition: 'Grounding generative models with real-time enterprise external knowledge',
    realWorldExamples: ['ChatGPT with Files', 'Perplexity AI', 'Enterprise Legal & Financial RAG'],
    svgSchematicType: 'rag',
    technicalSpecs: {
      protocol: 'Hybrid Keyword (BM25) + Semantic Dense Vector Re-ranking',
      latencyTarget: '< 180ms chunk retrieval + rerank',
      keyInvariant: 'Strict provenance citation & context window boundary isolation',
      productionStack: 'LangChain, Cohere Rerank-3, AWS OpenSearch, Bedrock'
    }
  },
  {
    id: 'mcp',
    title: 'Model Context Protocol (MCP)',
    category: 'Agent Protocols',
    icon: Share2,
    colorTheme: {
      accent: '#ec4899', // pink/rose
      badgeBg: 'rgba(236, 72, 153, 0.12)',
      badgeText: '#f472b6',
      border: 'rgba(236, 72, 153, 0.3)',
      glow: 'rgba(236, 72, 153, 0.25)'
    },
    definition: 'Open standard protocol connecting AI models to secure local and cloud tools',
    realWorldExamples: ['Claude Desktop MCP', 'Cursor MCP Tools', 'GitHub & Postgres MCP Servers'],
    svgSchematicType: 'mcp',
    technicalSpecs: {
      protocol: 'JSON-RPC 2.0 over Stdio / Server-Sent Events (SSE)',
      latencyTarget: '< 8ms local tool discovery & handshake',
      keyInvariant: 'Stateless tool declaration schemas with zero ambient authority',
      productionStack: 'Model Context Protocol TypeScript & Python SDKs, Docker Sandboxes'
    }
  }
]

export default function ByteByteGoAiCodex() {
  const [activeTermId, setActiveTermId] = useState<string>('agentic-ai')
  const [isStudioMode, setIsStudioMode] = useState<boolean>(false)
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // Auto-play step-through
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setActiveTermId(prev => {
        const idx = AI_TERMS.findIndex(t => t.id === prev)
        const nextIdx = (idx + 1) % AI_TERMS.length
        return AI_TERMS[nextIdx].id
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [isPlaying])

  const handleNext = () => {
    const idx = AI_TERMS.findIndex(t => t.id === activeTermId)
    setActiveTermId(AI_TERMS[(idx + 1) % AI_TERMS.length].id)
  }

  const handlePrev = () => {
    const idx = AI_TERMS.findIndex(t => t.id === activeTermId)
    setActiveTermId(AI_TERMS[(idx - 1 + AI_TERMS.length) % AI_TERMS.length].id)
  }

  const activeTerm = AI_TERMS.find(t => t.id === activeTermId) || AI_TERMS[0]

  const handleExportSvg = () => {
    const exportData = {
      specVersion: '1.0.0',
      source: 'ByteByteGo Architecture Codex (meenakannan.dev)',
      architecture: activeTerm.title,
      category: activeTerm.category,
      definition: activeTerm.definition,
      realWorldExamples: activeTerm.realWorldExamples,
      technicalSpecs: activeTerm.technicalSpecs,
      exportedAt: new Date().toISOString()
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    }
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2000)
  }

  return (
    <div className={`rounded-2xl transition-colors duration-300 border ${
      isStudioMode 
        ? 'bg-[#f8fafc] text-slate-900 border-slate-300 shadow-xl' 
        : 'bg-[#060a12]/95 text-slate-100 border-slate-800/80 shadow-2xl'
    } p-4 sm:p-7 overflow-hidden`}>
      
      {/* 1. Header Toolbar: ByteByteGo Editorial Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/60 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border border-teal-500/30 bg-teal-500/10 text-teal-400">
              ByteByteGo Architecture Codex
            </span>
            <span className="text-xs font-mono text-slate-400">
              • AI Systems Architecture
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial tracking-tight flex items-center gap-2">
            <span>AI Terms You Need to Know</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-normal">
              ByteByteGo Spec
            </span>
          </h3>
        </div>

        {/* Studio Canvas Mode, Step Tour & Export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Step Controls: Prev, Tour, Next */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Previous Architecture"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2 py-0.5 rounded text-xs font-mono text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              aria-label={isPlaying ? 'Pause Architecture Tour' : 'Start Architecture Tour'}
            >
              {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Pause' : 'Tour'}</span>
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Next Architecture"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsStudioMode(!isStudioMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isStudioMode
                ? 'bg-slate-900 text-white border-slate-950 shadow'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            aria-label="Toggle Studio Canvas Mode"
          >
            {isStudioMode ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isStudioMode ? 'Terminal Dark' : 'ByteByteGo Canvas'}</span>
          </button>

          <button
            onClick={handleExportSvg}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Export Architecture Diagram"
          >
            {copiedBadge ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedBadge ? 'Copied!' : 'Export Spec'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Architecture Pills Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {AI_TERMS.map(term => {
          const isSelected = term.id === activeTermId
          return (
            <button
              key={term.id}
              onClick={() => setActiveTermId(term.id)}
              className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? isStudioMode
                    ? 'bg-white border-slate-400 text-slate-900 shadow-sm font-bold'
                    : 'bg-slate-900 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold'
                  : isStudioMode
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <term.icon className="w-3.5 h-3.5" style={{ color: term.colorTheme.accent }} />
              <span>{term.title}</span>
            </button>
          )
        })}
      </div>

      {/* 3. The 3-Column ByteByteGo Architecture Card (Direct Representation of Infographic) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTerm.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={`rounded-2xl border p-4 sm:p-6 transition-all ${
            isStudioMode
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-slate-950/80 border-slate-800/90'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Column 1: Concept Identity */}
            <div className="lg:col-span-3 space-y-3">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner"
                style={{ 
                  backgroundColor: isStudioMode ? '#f1f5f9' : 'rgba(15, 23, 42, 0.8)',
                  borderColor: activeTerm.colorTheme.border 
                }}
              >
                <activeTerm.icon 
                  className="w-7 h-7" 
                  style={{ color: activeTerm.colorTheme.accent }} 
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {activeTerm.category}
                </span>
                <h4 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight" style={{ color: isStudioMode ? '#0f172a' : '#ffffff' }}>
                  {activeTerm.title}
                </h4>
              </div>

              <div className="text-xs font-sans text-slate-400 leading-relaxed">
                Production architecture modeled after ByteByteGo system design principles.
              </div>
            </div>

            {/* Column 2: The Core Workflow Diagram (Interactive SVG) */}
            <div className="lg:col-span-6 rounded-xl border p-4 bg-slate-950/60 overflow-hidden" style={{ borderColor: isStudioMode ? '#e2e8f0' : '#1e293b' }}>
              <div className="text-[10px] font-mono uppercase text-slate-500 mb-2 flex items-center justify-between">
                <span>System Topology & Data Flow</span>
                <span className="text-emerald-400">Step Sequence Active</span>
              </div>

              {/* Dynamic SVG Schematic Based on Type */}
              <div className="w-full flex items-center justify-center min-h-[220px]">
                {activeTerm.svgSchematicType === 'agent' && (
                  <svg viewBox="0 0 520 220" className="w-full h-auto max-w-[500px]">
                    <defs>
                      <marker id="arrow-agent" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
                      </marker>
                      <marker id="arrow-dash" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
                      </marker>
                    </defs>

                    {/* Left Inputs: Memory, Tools, Goals */}
                    <g transform="translate(10, 15)">
                      <rect x="0" y="0" width="80" height="36" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                      <text x="40" y="22" fill="#cbd5e1" fontSize="11" textAnchor="middle" fontFamily="monospace">Memory</text>
                    </g>
                    <g transform="translate(10, 75)">
                      <rect x="0" y="0" width="80" height="36" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                      <text x="40" y="22" fill="#cbd5e1" fontSize="11" textAnchor="middle" fontFamily="monospace">Tools</text>
                    </g>
                    <g transform="translate(10, 135)">
                      <rect x="0" y="0" width="80" height="36" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
                      <text x="40" y="22" fill="#cbd5e1" fontSize="11" textAnchor="middle" fontFamily="monospace">Goals</text>
                    </g>

                    {/* Ingress Connectors into Agent */}
                    <path d="M 90 33 C 130 33, 130 95, 170 95" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-dash)" />
                    <path d="M 90 93 L 170 93" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-dash)" />
                    <path d="M 90 153 C 130 153, 130 95, 170 95" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-dash)" />

                    {/* Center: Agent */}
                    <g transform="translate(175, 55)">
                      <rect x="0" y="0" width="105" height="75" rx="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                      <circle cx="52" cy="28" r="14" fill="#022c22" stroke="#34d399" strokeWidth="1.5" />
                      <text x="52" y="32" fill="#34d399" fontSize="10" textAnchor="middle" fontFamily="monospace">🤖</text>
                      <text x="52" y="60" fill="#ecfdf5" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Agent</text>
                    </g>

                    {/* Agent -> Actions */}
                    <path d="M 280 93 L 340 93" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-agent)" />
                    <g transform="translate(345, 65)">
                      <rect x="0" y="0" width="75" height="56" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="37" y="25" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">▶ Actions</text>
                      <text x="37" y="44" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Tool Calls</text>
                    </g>

                    {/* Actions -> Environment */}
                    <path d="M 420 93 L 450 93" fill="none" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow-agent)" />
                    <g transform="translate(455, 65)">
                      <rect x="0" y="0" width="60" height="56" rx="10" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                      <text x="30" y="28" fill="#c084fc" fontSize="12" textAnchor="middle">☁</text>
                      <text x="30" y="45" fill="#e2e8f0" fontSize="9" textAnchor="middle" fontFamily="monospace">Env</text>
                    </g>

                    {/* Feedback loop: Environment -> Observations -> Agent */}
                    <path d="M 485 65 C 485 20, 380 20, 360 20 C 310 20, 240 20, 230 50" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-agent)" />
                    <text x="350" y="15" fill="#fbbf24" fontSize="10" textAnchor="middle" fontFamily="monospace">Observations (Perception)</text>
                  </svg>
                )}

                {activeTerm.svgSchematicType === 'reasoning' && (
                  <svg viewBox="0 0 520 220" className="w-full h-auto max-w-[500px]">
                    <defs>
                      <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#06b6d4" />
                      </marker>
                    </defs>

                    {/* Question Input */}
                    <g transform="translate(15, 20)">
                      <rect x="0" y="0" width="130" height="40" rx="8" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1.5" />
                      <text x="65" y="24" fill="#e0f2fe" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">User Question</text>
                    </g>

                    <path d="M 145 40 L 195 40" fill="none" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-cyan)" />

                    {/* Reasoning Engine with CoT Steps */}
                    <g transform="translate(200, 10)">
                      <rect x="0" y="0" width="190" height="195" rx="12" fill="#082f49" stroke="#06b6d4" strokeWidth="2" />
                      <text x="95" y="25" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Reasoning Model</text>

                      {/* Reasoning step pills */}
                      <g transform="translate(15, 38)">
                        <rect x="0" y="0" width="160" height="26" rx="6" fill="#0f172a" stroke="#fda4af" strokeWidth="1" />
                        <text x="80" y="17" fill="#fecdd3" fontSize="9" textAnchor="middle" fontFamily="monospace">① CoT: Parse goal & invariants</text>
                      </g>
                      <g transform="translate(15, 72)">
                        <rect x="0" y="0" width="160" height="26" rx="6" fill="#0f172a" stroke="#fda4af" strokeWidth="1" />
                        <text x="80" y="17" fill="#fecdd3" fontSize="9" textAnchor="middle" fontFamily="monospace">② CoT: Intermediate verification</text>
                      </g>
                      <g transform="translate(15, 106)">
                        <rect x="0" y="0" width="160" height="26" rx="6" fill="#0f172a" stroke="#fda4af" strokeWidth="1" />
                        <text x="80" y="17" fill="#fecdd3" fontSize="9" textAnchor="middle" fontFamily="monospace">③ CoT: Self-correction trace</text>
                      </g>
                      <g transform="translate(15, 142)">
                        <rect x="0" y="0" width="160" height="26" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                        <text x="80" y="17" fill="#34d399" fontSize="9" textAnchor="middle" fontFamily="monospace">④ Solution Confirmed ✓</text>
                      </g>
                    </g>

                    <path d="M 390 105 L 430 105" fill="none" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-cyan)" />

                    {/* Final Answer */}
                    <g transform="translate(435, 85)">
                      <rect x="0" y="0" width="75" height="42" rx="8" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
                      <text x="37" y="25" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Answer</text>
                    </g>
                  </svg>
                )}

                {activeTerm.svgSchematicType === 'vectordb' && (
                  <svg viewBox="0 0 520 220" className="w-full h-auto max-w-[500px]">
                    <defs>
                      <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#8b5cf6" />
                      </marker>
                    </defs>

                    {/* Multi-modal inputs */}
                    <g transform="translate(10, 20)">
                      <rect x="0" y="0" width="90" height="175" rx="10" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="1.5" />
                      <text x="45" y="24" fill="#c4b5fd" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Source Data</text>
                      
                      <g transform="translate(10, 36)">
                        <rect x="0" y="0" width="70" height="24" rx="4" fill="#0f172a" stroke="#334155" />
                        <text x="35" y="16" fill="#94a3b8" fontSize="9" textAnchor="middle">Text / Markdown</text>
                      </g>
                      <g transform="translate(10, 68)">
                        <rect x="0" y="0" width="70" height="24" rx="4" fill="#0f172a" stroke="#334155" />
                        <text x="35" y="16" fill="#94a3b8" fontSize="9" textAnchor="middle">Image / PNG</text>
                      </g>
                      <g transform="translate(10, 100)">
                        <rect x="0" y="0" width="70" height="24" rx="4" fill="#0f172a" stroke="#334155" />
                        <text x="35" y="16" fill="#94a3b8" fontSize="9" textAnchor="middle">Audio / Voice</text>
                      </g>
                      <g transform="translate(10, 132)">
                        <rect x="0" y="0" width="70" height="24" rx="4" fill="#0f172a" stroke="#334155" />
                        <text x="35" y="16" fill="#94a3b8" fontSize="9" textAnchor="middle">Source Code</text>
                      </g>
                    </g>

                    <path d="M 100 107 L 140 107" fill="none" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple)" />

                    {/* Embedding Model */}
                    <g transform="translate(145, 75)">
                      <rect x="0" y="0" width="100" height="65" rx="10" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2" />
                      <text x="50" y="28" fill="#ddd6fe" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Embedding</text>
                      <text x="50" y="46" fill="#c4b5fd" fontSize="9" textAnchor="middle" fontFamily="sans-serif">Model (1536d)</text>
                    </g>

                    <path d="M 245 107 L 275 107" fill="none" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple)" />

                    {/* Float Vector Matrix */}
                    <g transform="translate(280, 50)">
                      <rect x="0" y="0" width="100" height="115" rx="8" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="50" y="20" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Dense Vectors</text>
                      <text x="50" y="42" fill="#818cf8" fontSize="9" textAnchor="middle" fontFamily="monospace">[ 0.2, -1.9, ... ]</text>
                      <text x="50" y="62" fill="#818cf8" fontSize="9" textAnchor="middle" fontFamily="monospace">[ 4.1, 0.7, ... ]</text>
                      <text x="50" y="82" fill="#818cf8" fontSize="9" textAnchor="middle" fontFamily="monospace">[ -1.7, 2.3, ... ]</text>
                      <text x="50" y="102" fill="#818cf8" fontSize="9" textAnchor="middle" fontFamily="monospace">[ 0.5, -1.4, ... ]</text>
                    </g>

                    <path d="M 380 107 L 415 107" fill="none" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple)" />

                    {/* Vector Database */}
                    <g transform="translate(420, 65)">
                      <rect x="0" y="0" width="90" height="85" rx="12" fill="#3b0764" stroke="#a855f7" strokeWidth="2" />
                      <text x="45" y="32" fill="#e9d5ff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Vector DB</text>
                      <text x="45" y="52" fill="#c084fc" fontSize="8.5" textAnchor="middle" fontFamily="sans-serif">HNSW Index</text>
                      <text x="45" y="68" fill="#34d399" fontSize="8" textAnchor="middle" fontFamily="monospace">KNN Cosine</text>
                    </g>
                  </svg>
                )}

                {activeTerm.svgSchematicType === 'rag' && (
                  <svg viewBox="0 0 520 220" className="w-full h-auto max-w-[500px]">
                    <defs>
                      <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                      </marker>
                    </defs>

                    {/* Step 1: User Query */}
                    <g transform="translate(15, 80)">
                      <circle cx="25" cy="25" r="22" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="25" y="29" fill="#fde68a" fontSize="12" textAnchor="middle">👤</text>
                      <text x="25" y="60" fill="#fef3c7" fontSize="10" textAnchor="middle" fontFamily="monospace">User</text>
                    </g>

                    {/* Step 1 Arrow: Query -> Retriever */}
                    <path d="M 65 105 L 125 105" fill="none" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
                    <text x="95" y="98" fill="#fde68a" fontSize="9" textAnchor="middle" fontFamily="monospace">① Query</text>

                    {/* Retriever Engine */}
                    <g transform="translate(130, 75)">
                      <rect x="0" y="0" width="95" height="60" rx="10" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
                      <text x="47" y="28" fill="#fffbeb" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Retriever</text>
                      <text x="47" y="46" fill="#fef3c7" fontSize="8.5" textAnchor="middle" fontFamily="sans-serif">BM25 + Dense</text>
                    </g>

                    {/* Step 2 Arrow: Retriever -> Knowledge Base */}
                    <path d="M 175 75 C 175 40, 240 40, 275 40" fill="none" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
                    <text x="225" y="32" fill="#fde68a" fontSize="9" textAnchor="middle" fontFamily="monospace">② Search KB</text>

                    {/* Knowledge Base */}
                    <g transform="translate(280, 15)">
                      <rect x="0" y="0" width="130" height="50" rx="10" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
                      <text x="65" y="22" fill="#fef08a" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Knowledge Base</text>
                      <text x="65" y="38" fill="#94a3b8" fontSize="8.5" textAnchor="middle">PDF • VectorDB • Docs</text>
                    </g>

                    {/* Step 3 Arrow: Knowledge Base -> Relevant text */}
                    <path d="M 345 65 C 345 95, 290 105, 230 105" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-amber)" />
                    <text x="290" y="98" fill="#fde68a" fontSize="9" textAnchor="middle" fontFamily="monospace">③ Relevant Context</text>

                    {/* Step 4: Query + Context into LLM */}
                    <path d="M 225 105 L 290 145" fill="none" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
                    <g transform="translate(295, 120)">
                      <rect x="0" y="0" width="115" height="65" rx="10" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                      <text x="57" y="28" fill="#e0f2fe" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">LLM Synthesis</text>
                      <text x="57" y="48" fill="#38bdf8" fontSize="8.5" textAnchor="middle">Grounding Invariants</text>
                    </g>

                    {/* Step 5: Answer back to user */}
                    <path d="M 295 160 C 150 200, 60 160, 45 130" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
                    <text x="170" y="195" fill="#34d399" fontSize="9" textAnchor="middle" fontFamily="monospace">⑤ Grounded Fact Response</text>
                  </svg>
                )}

                {activeTerm.svgSchematicType === 'mcp' && (
                  <svg viewBox="0 0 520 220" className="w-full h-auto max-w-[500px]">
                    <defs>
                      <marker id="arrow-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#ec4899" />
                      </marker>
                    </defs>

                    {/* MCP Host */}
                    <g transform="translate(15, 30)">
                      <rect x="0" y="0" width="105" height="150" rx="12" fill="#500724" stroke="#db2777" strokeWidth="1.5" />
                      <text x="52" y="24" fill="#fbcfe8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">MCP Host</text>
                      
                      <g transform="translate(10, 40)">
                        <rect x="0" y="0" width="85" height="26" rx="4" fill="#0f172a" stroke="#831843" />
                        <text x="42" y="17" fill="#f472b6" fontSize="9" textAnchor="middle">Claude Desktop</text>
                      </g>
                      <g transform="translate(10, 75)">
                        <rect x="0" y="0" width="85" height="26" rx="4" fill="#0f172a" stroke="#831843" />
                        <text x="42" y="17" fill="#f472b6" fontSize="9" textAnchor="middle">Cursor IDE</text>
                      </g>
                      <g transform="translate(10, 110)">
                        <rect x="0" y="0" width="85" height="26" rx="4" fill="#0f172a" stroke="#831843" />
                        <text x="42" y="17" fill="#f472b6" fontSize="9" textAnchor="middle">Autonomous CLI</text>
                      </g>
                    </g>

                    {/* MCP Client Protocol Wire */}
                    <path d="M 120 105 L 180 105" fill="none" stroke="#ec4899" strokeWidth="2" markerEnd="url(#arrow-pink)" />
                    <g transform="translate(185, 80)">
                      <rect x="0" y="0" width="100" height="50" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="50" y="22" fill="#e0e7ff" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">MCP Protocol</text>
                      <text x="50" y="38" fill="#a5b4fc" fontSize="8" textAnchor="middle" fontFamily="monospace">JSON-RPC / SSE</text>
                    </g>

                    <path d="M 285 90 L 330 50" fill="none" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#arrow-pink)" />
                    <path d="M 285 105 L 330 105" fill="none" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#arrow-pink)" />
                    <path d="M 285 120 L 330 160" fill="none" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#arrow-pink)" />

                    {/* MCP Servers */}
                    <g transform="translate(335, 25)">
                      <rect x="0" y="0" width="170" height="42" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.2" />
                      <text x="15" y="25" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">Server A:</text>
                      <text x="75" y="25" fill="#e2e8f0" fontSize="9">GitHub, Slack, JIRA</text>
                    </g>
                    <g transform="translate(335, 85)">
                      <rect x="0" y="0" width="170" height="42" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
                      <text x="15" y="25" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">Server B:</text>
                      <text x="75" y="25" fill="#e2e8f0" fontSize="9">PostgreSQL, Redis</text>
                    </g>
                    <g transform="translate(335, 145)">
                      <rect x="0" y="0" width="170" height="42" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.2" />
                      <text x="15" y="25" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">Server C:</text>
                      <text x="75" y="25" fill="#e2e8f0" fontSize="9">Local Filesystem & Git</text>
                    </g>
                  </svg>
                )}
              </div>
            </div>

            {/* Column 3: Production Anchors (Definition & Real-World Example Badges) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Definition Pill & Text */}
              <div 
                className="p-3.5 rounded-xl border transition-all"
                style={{ 
                  backgroundColor: isStudioMode ? '#f0fdf4' : 'rgba(6, 78, 59, 0.25)',
                  borderColor: isStudioMode ? '#bbf7d0' : 'rgba(16, 185, 129, 0.3)' 
                }}
              >
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 bg-emerald-500/20 text-emerald-400">
                  Definition
                </div>
                <p className="text-xs sm:text-sm font-sans font-medium text-slate-200 leading-relaxed" style={{ color: isStudioMode ? '#0f172a' : '#e2e8f0' }}>
                  {activeTerm.definition}
                </p>
              </div>

              {/* Real-World Example Pill & Technologies */}
              <div 
                className="p-3.5 rounded-xl border transition-all"
                style={{ 
                  backgroundColor: isStudioMode ? '#eff6ff' : 'rgba(12, 74, 110, 0.25)',
                  borderColor: isStudioMode ? '#bfdbfe' : 'rgba(56, 189, 248, 0.3)' 
                }}
              >
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 bg-cyan-500/20 text-cyan-400">
                  Real-World Production Example
                </div>
                <div className="space-y-1">
                  {activeTerm.realWorldExamples.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs font-mono font-semibold" style={{ color: isStudioMode ? '#1e293b' : '#38bdf8' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Technical Spec */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Protocol:</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{activeTerm.technicalSpecs.protocol}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Latency:</span>
                  <span className="text-emerald-400 font-bold">{activeTerm.technicalSpecs.latencyTarget}</span>
                </div>
                <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                  <span className="text-slate-500">Stack: </span>
                  <span className="text-slate-300">{activeTerm.technicalSpecs.productionStack}</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
