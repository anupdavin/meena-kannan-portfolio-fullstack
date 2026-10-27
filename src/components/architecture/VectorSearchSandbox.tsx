import { useState, useId, useMemo } from 'react'
import {
  Search,
  Database,
  Layers,
  Cpu,
  RotateCcw,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react'
import { VECTOR_SEARCH_MODELS, type VectorSearchModel } from '@/data/vectorSearch'

interface VectorPoint {
  id: string
  label: string
  x: number
  y: number
  category: 'IAM' | 'Checkout' | 'Streaming' | 'FinTech' | 'MCP'
  dimValues: number[]
}

const CORPUS_POINTS: VectorPoint[] = [
  { id: 'DOC_101', label: 'OAuth2 JWT Claim Parser', x: 120, y: 90, category: 'IAM', dimValues: [0.82, 0.41, 0.12] },
  { id: 'DOC_102', label: 'Postgres Row-Level Security', x: 145, y: 110, category: 'IAM', dimValues: [0.85, 0.39, 0.15] },
  { id: 'DOC_201', label: 'Choreographed Saga CDC', x: 280, y: 80, category: 'Checkout', dimValues: [0.15, 0.88, 0.22] },
  { id: 'DOC_202', label: 'Debezium Outbox Partitioning', x: 310, y: 105, category: 'Checkout', dimValues: [0.18, 0.84, 0.25] },
  { id: 'DOC_301', label: 'Java 21 Virtual Thread Sockets', x: 80, y: 220, category: 'Streaming', dimValues: [0.35, 0.12, 0.89] },
  { id: 'DOC_302', label: 'WebSocket Drop-Tail Buffer', x: 110, y: 245, category: 'Streaming', dimValues: [0.38, 0.15, 0.85] },
  { id: 'DOC_401', label: 'Cryptographic Ledger Hashes', x: 330, y: 230, category: 'FinTech', dimValues: [0.72, 0.75, 0.45] },
  { id: 'DOC_402', label: 'PCI-DSS Tokenization Vault', x: 355, y: 210, category: 'FinTech', dimValues: [0.76, 0.71, 0.48] },
  { id: 'DOC_501', label: 'Model Context Protocol Server', x: 210, y: 160, category: 'MCP', dimValues: [0.55, 0.52, 0.61] },
  { id: 'DOC_502', label: 'gVisor Tool Sandbox Container', x: 235, y: 185, category: 'MCP', dimValues: [0.58, 0.49, 0.64] }
]

export default function VectorSearchSandbox() {
  const [selectedModel, setSelectedModel] = useState<VectorSearchModel>(VECTOR_SEARCH_MODELS[0])
  const [queryPos, setQueryPos] = useState({ x: 200, y: 150 })
  const [quantizationFormat, setQuantizationFormat] = useState<'FP32' | 'FP16' | 'INT8'>('FP16')
  const [isTraversing, setIsTraversing] = useState(false)
  const [hybridModeActive, setHybridModeActive] = useState(false)
  const [copied, setCopied] = useState(false)

  const sandboxHeadingId = useId()

  // Calculate Euclidean distances and Cosine similarities from query position
  const rankedResults = useMemo(() => {
    return CORPUS_POINTS.map(pt => {
      const dx = pt.x - queryPos.x
      const dy = pt.y - queryPos.y
      const euclideanDist = Math.sqrt(dx * dx + dy * dy)
      // Normalized synthetic cosine similarity (1.0 = identical, 0.0 = orthogonal)
      const sim = Math.max(0, 1 - euclideanDist / 400)
      const bm25Score = pt.category === 'MCP' ? 4.8 : pt.category === 'IAM' ? 3.2 : 1.5
      const rrfScore = 1 / (60 + euclideanDist * 0.1) + (hybridModeActive ? 1 / (60 + (10 - bm25Score)) : 0)

      return {
        ...pt,
        euclideanDist: Number(euclideanDist.toFixed(1)),
        cosineSimilarity: Number(sim.toFixed(3)),
        rrfScore: Number(rrfScore.toFixed(4))
      }
    }).sort((a, b) => b.cosineSimilarity - a.cosineSimilarity)
  }, [queryPos, hybridModeActive])

  const topNeighbors = rankedResults.slice(0, 3)

  const handleRunBeamSearch = () => {
    setIsTraversing(true)
    setTimeout(() => {
      setIsTraversing(false)
    }, 800)
  }

  const handleToggleQuantization = () => {
    setQuantizationFormat(prev => {
      if (prev === 'FP32') return 'FP16'
      if (prev === 'FP16') return 'INT8'
      return 'FP32'
    })
  }

  const handleResetProbe = () => {
    setQueryPos({ x: 200, y: 150 })
    setHybridModeActive(false)
    setQuantizationFormat('FP16')
  }

  const copyRfcReport = () => {
    const rfc = `# RFC-8104: High-Throughput Distributed Vector Search & HNSW Indexing
Architecture: ${selectedModel.name} [${selectedModel.badge}]
Paradigm: ${selectedModel.paradigm}
Search Complexity: ${selectedModel.searchComplexity}
Memory Profile: ${selectedModel.memoryProfile}
Indexing Throughput: ${selectedModel.indexingThroughput}
Recall Target: ${selectedModel.recallAccuracy}

## Architectural Invariants:
- Invariant Statement: ${selectedModel.architecturalInvariant}
- Beam Search efSearch: Configured to ef=64 for 98.4% Recall@10.
- Quantization Precision: ${quantizationFormat} bit-depth mode active.
- Dimensionality: 1,536-dimensional OpenAI text-embedding-3 vectors.

## Production Metrics:
${Object.entries(selectedModel.productionOutcomes).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Vector Search Index Implementation:
\`\`\`${selectedModel.codeSnippet.language}
${selectedModel.codeSnippet.code}
\`\`\`
`
    navigator.clipboard.writeText(rfc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      id="architecture-vector-search"
      aria-labelledby={sandboxHeadingId}
      className="rounded-2xl border border-slate-800 bg-[#050811] p-6 lg:p-8 relative overflow-hidden shadow-2xl"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono tracking-widest text-teal-400 uppercase font-semibold">
              Distributed Systems Engine 17
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Vector Search &amp; HNSW
            </span>
          </div>
          <h2 id={sandboxHeadingId} className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Distributed Sharded Vector Search &amp; HNSW Indexing Sandbox
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Interactive exploration of Hierarchical Navigable Small World (HNSW) proximity graphs, IVF-PQ centroid clustering,
            sharded scatter-gather top-K heap merging, and Reciprocal Rank Fusion (RRF) hybrid retrieval for high-scale RAG systems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyRfcReport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium rounded-lg bg-slate-900 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied RFC' : 'Copy Vector RFC'}</span>
          </button>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6" role="tablist">
        {VECTOR_SEARCH_MODELS.map(model => {
          const isSelected = selectedModel.id === model.id
          return (
            <button
              key={model.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedModel(model)}
              className={`p-3 rounded-xl border text-left transition-all font-mono text-xs ${
                isSelected
                  ? 'bg-teal-950/20 border-teal-500/50 text-teal-300 shadow-lg shadow-teal-950/30'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold truncate">{model.badge}</div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">{model.paradigm}</div>
            </button>
          )
        })}
      </div>

      {/* Interactive 2D Vector Space Canvas & Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Interactive 2D Vector Projection Canvas */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#090e1a] p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider">
                2D Hyperspace Projection &amp; Nearest Neighbor Proximity
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded border bg-teal-950/40 border-teal-500/40 text-teal-300">
                Format: {quantizationFormat} ({quantizationFormat === 'FP32' ? '6.14 GB' : quantizationFormat === 'FP16' ? '3.07 GB' : '1.54 GB'}/1M)
              </span>
            </div>
          </div>

          {/* SVG Vector Canvas */}
          <div className="relative rounded-lg bg-slate-950 border border-slate-800/80 p-2 overflow-hidden">
            <svg
              viewBox="0 0 420 300"
              className="w-full h-64 select-none cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 420)
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 300)
                setQueryPos({ x: Math.max(20, Math.min(400, x)), y: Math.max(20, Math.min(280, y)) })
              }}
            >
              <defs>
                <radialGradient id="queryGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>

              <rect width="420" height="300" fill="url(#gridPattern)" />

              {/* HNSW Graph Edges between corpus points */}
              {CORPUS_POINTS.map((p1, i) =>
                CORPUS_POINTS.slice(i + 1).map((p2) => {
                  const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
                  if (dist < 100) {
                    return (
                      <line
                        key={`${p1.id}-${p2.id}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )
                  }
                  return null
                })
              )}

              {/* Beam Search Traversal Paths from Query to Top 3 */}
              {topNeighbors.map((nb, idx) => (
                <line
                  key={`beam-${nb.id}`}
                  x1={queryPos.x}
                  y1={queryPos.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={idx === 0 ? '#10b981' : '#06b6d4'}
                  strokeWidth={idx === 0 ? '2' : '1.2'}
                  strokeDasharray={isTraversing ? '4 2' : undefined}
                />
              ))}

              {/* Corpus Vector Nodes */}
              {CORPUS_POINTS.map((pt) => {
                const isTop1 = topNeighbors[0]?.id === pt.id
                const isTop3 = topNeighbors.some(n => n.id === pt.id)

                return (
                  <g key={pt.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isTop1 ? 7 : isTop3 ? 5.5 : 4}
                      fill={isTop1 ? '#10b981' : isTop3 ? '#06b6d4' : '#334155'}
                      stroke={isTop1 ? '#34d399' : '#1e293b'}
                      strokeWidth={isTop1 ? 2 : 1}
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 9}
                      fill={isTop1 ? '#34d399' : isTop3 ? '#38bdf8' : '#64748b'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {pt.id}
                    </text>
                  </g>
                )
              })}

              {/* Query Probe Node */}
              <g>
                <circle cx={queryPos.x} cy={queryPos.y} r="28" fill="url(#queryGlow)" />
                <circle cx={queryPos.x} cy={queryPos.y} r="6.5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="2" />
                <text
                  x={queryPos.x}
                  y={queryPos.y + 16}
                  fill="#f59e0b"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Q(Query)
                </text>
              </g>
            </svg>
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              Click anywhere on canvas to reposition Query Vector Q
            </div>
          </div>

          {/* Action Control Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800 mt-3">
            <button
              onClick={handleRunBeamSearch}
              disabled={isTraversing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isTraversing ? 'Traversing HNSW...' : '[ Run Beam Search ]'}</span>
            </button>

            <button
              onClick={handleToggleQuantization}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>[ Quant: {quantizationFormat} ]</span>
            </button>

            <button
              onClick={() => setHybridModeActive(!hybridModeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all focus-visible:ring-2 ${
                hybridModeActive
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hybridModeActive ? '[ Hybrid RRF ON ]' : '[ Enable Hybrid RRF ]'}</span>
            </button>

            <button
              onClick={handleResetProbe}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all ml-auto focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Nearest Neighbors & Similarity Ranking */}
        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider">
                Top Nearest Neighbors (ef=64)
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs mb-4">
              {topNeighbors.map((nb, idx) => (
                <div
                  key={nb.id}
                  className={`p-3 rounded-lg border transition-all ${
                    idx === 0
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      {nb.id}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Sim: {nb.cosineSimilarity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{nb.label}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-800/50">
                    <span>Category: {nb.category}</span>
                    <span>Distance: {nb.euclideanDist} px</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantization Spec Info Card */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Quantization Memory Footprint</div>
            <div className="text-teal-400 font-bold">
              {quantizationFormat === 'FP32' ? '4 Bytes/dim (Float32)' : quantizationFormat === 'FP16' ? '2 Bytes/dim (halfvec FP16)' : '1 Byte/dim (INT8 scalar)'}
            </div>
            <div className="text-[11px] text-slate-400">
              {quantizationFormat === 'FP32' ? 'Zero loss, 6.14 GB per 1M vectors' : quantizationFormat === 'FP16' ? '50% memory cut, 99.8% relative recall' : '75% memory cut, 99.2% relative recall via SIMD'}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Execution Steps */}
      <div className="mb-8">
        <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider mb-3">
          Vector Indexing &amp; Graph Traversal Invariant Progression
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedModel.workflowPhases.map((phase, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${phase.color}`}>
                  {phase.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{phase.description}</p>
              <div className="text-[11px] font-mono text-teal-400/90 bg-teal-950/20 p-2 rounded border border-teal-900/30">
                <span className="text-teal-500 font-semibold">Invariant: </span>
                {phase.invariants}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Specification & Production Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Snippet */}
        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono text-slate-300 font-bold">
                {selectedModel.codeSnippet.filename}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
              {selectedModel.codeSnippet.language}
            </span>
          </div>
          <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-teal-300 overflow-x-auto leading-relaxed">
            <code>{selectedModel.codeSnippet.code}</code>
          </pre>
          <div className="mt-3 text-[11px] font-mono text-slate-400">
            <span className="text-slate-300 font-semibold">Architectural Invariant: </span>
            {selectedModel.architecturalInvariant}
          </div>
        </div>

        {/* Quantified Production Outcomes */}
        <div className="rounded-xl border border-slate-800 bg-[#090e1a] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Production Outcome Metrics
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {Object.entries(selectedModel.productionOutcomes).map(([metric, value]) => (
                <div key={metric} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-500 mb-1">{metric}</div>
                  <div className="text-sm font-mono font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Recall &amp; Memory Scaling Target
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Target Recall: {selectedModel.recallAccuracy} with {selectedModel.memoryProfile}.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
