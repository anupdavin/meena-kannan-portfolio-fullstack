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
  ChevronRight,
  FileCode,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  Eye,
  FileText,
  Zap,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X
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
    lightBadgeBg: string
    lightBadgeText: string
  }
  definition: string
  realWorldExamples: string[]
  svgSchematicType: 'agent' | 'reasoning' | 'vectordb' | 'rag' | 'mcp'
  mermaidDiagram: string
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
      accent: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeText: '#34d399',
      border: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.25)',
      lightBadgeBg: '#dcfce7',
      lightBadgeText: '#15803d'
    },
    definition: 'Goal-driven AI agent operating in continuous perception-action loops',
    realWorldExamples: ['AutoGPT', 'Devin', 'LangGraph Multi-Agent Workflows'],
    svgSchematicType: 'agent',
    mermaidDiagram: `flowchart LR
  subgraph Inputs[Inputs]
    M[Memory: VectorDB / Redis]
    T[Tools: REST / SDKs]
    G[Goals: User Prompt]
  end
  Inputs --> Agent[🤖 ReAct Agent Loop]
  Agent --> Actions[▶ Actions / Tool Calls]
  Actions --> Env[(Execution Environment)]
  Env -.->|Observations / State Feedback| Agent`,
    technicalSpecs: {
      protocol: 'ReAct / Plan-and-Solve (DAG Loop)',
      latencyTarget: '< 2.5s per reasoning iteration',
      keyInvariant: 'Dynamic acyclic dependency validation prevents deadlock loops',
      productionStack: 'Python LangGraph, Java 21 Spring AI, Docker Sandboxes'
    }
  },
  {
    id: 'lrm',
    title: 'Large Reasoning Model',
    category: 'Cognitive Models',
    icon: Brain,
    colorTheme: {
      accent: '#06b6d4',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      badgeText: '#38bdf8',
      border: 'rgba(6, 182, 212, 0.3)',
      glow: 'rgba(6, 182, 212, 0.25)',
      lightBadgeBg: '#e0f2fe',
      lightBadgeText: '#0369a1'
    },
    definition: 'Multi-step reasoning LLM using test-time compute & chain-of-thought traces',
    realWorldExamples: ['OpenAI o3 / o4', 'DeepSeek-R1', 'Anthropic Claude Extended Thinking'],
    svgSchematicType: 'reasoning',
    mermaidDiagram: `flowchart LR
  User[User Question] --> Engine[Large Reasoning Model]
  subgraph Engine[Test-Time Compute Engine]
    S1[① CoT: Parse Goal & Invariants] --> S2[② CoT: Intermediate Verification]
    S2 --> S3[③ CoT: Self-Correction Trace]
    S3 --> S4[④ Solution Confirmed ✓]
  end
  Engine --> Answer[Verified Answer]`,
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
      accent: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      badgeText: '#a78bfa',
      border: 'rgba(139, 92, 246, 0.3)',
      glow: 'rgba(139, 92, 246, 0.25)',
      lightBadgeBg: '#ede9fe',
      lightBadgeText: '#5b21b6'
    },
    definition: 'High-dimensional similarity search engine indexed for nearest neighbors',
    realWorldExamples: ['Pinecone', 'Weaviate', 'Milvus', 'PostgreSQL pgvector'],
    svgSchematicType: 'vectordb',
    mermaidDiagram: `flowchart LR
  subgraph Ingestion[Multi-Modal Source Data]
    D1[Text / Markdown]
    D2[Images / Media]
    D3[Code / Schemas]
  end
  Ingestion --> Embed[Embedding Model 1536d]
  Embed --> Vectors[Dense Float Vectors]
  Vectors --> VDB[(Vector Database: HNSW Index)]`,
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
      accent: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeText: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.25)',
      lightBadgeBg: '#fef3c7',
      lightBadgeText: '#92400e'
    },
    definition: 'Grounding generative models with real-time enterprise external knowledge',
    realWorldExamples: ['ChatGPT with Files', 'Perplexity AI', 'Enterprise Legal & Financial RAG'],
    svgSchematicType: 'rag',
    mermaidDiagram: `sequenceDiagram
  autonumber
  actor User as User
  participant Retriever as Hybrid Retriever (BM25 + Dense)
  participant KB as Enterprise Knowledge Base
  participant LLM as LLM Synthesis Engine
  User->>Retriever: 1. Enterprise Query
  Retriever->>KB: 2. Search Knowledge Base
  KB-->>Retriever: 3. Relevant Chunks & Provenance
  Retriever->>LLM: 4. Query + Grounded Context
  LLM-->>User: 5. Grounded Fact Response`,
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
      accent: '#ec4899',
      badgeBg: 'rgba(236, 72, 153, 0.12)',
      badgeText: '#f472b6',
      border: 'rgba(236, 72, 153, 0.3)',
      glow: 'rgba(236, 72, 153, 0.25)',
      lightBadgeBg: '#f3e8ff',
      lightBadgeText: '#6b21a8'
    },
    definition: 'Open standard protocol connecting AI models to secure local and cloud tools',
    realWorldExamples: ['Claude Desktop MCP', 'Cursor MCP Tools', 'GitHub & Postgres MCP Servers'],
    svgSchematicType: 'mcp',
    mermaidDiagram: `flowchart LR
  subgraph Host[MCP Host Application]
    App[Claude / Cursor / CLI]
    Client[MCP Client]
  end
  Client <==>|JSON-RPC 2.0 / SSE| Wire[Model Context Protocol Wire]
  Wire <==> S1[Server A: GitHub, Slack, JIRA]
  Wire <==> S2[Server B: PostgreSQL, Redis]
  Wire <==> S3[Server C: Local Filesystem & Git]`,
    technicalSpecs: {
      protocol: 'JSON-RPC 2.0 over Stdio / Server-Sent Events (SSE)',
      latencyTarget: '< 8ms local tool discovery & handshake',
      keyInvariant: 'Stateless tool declaration schemas with zero ambient authority',
      productionStack: 'Model Context Protocol TypeScript & Python SDKs, Docker Sandboxes'
    }
  }
]

// ==========================================
// DETAILED HIGH-CRAFT SVG SCHEMATICS
// ==========================================

function AgenticAiSchematic({ 
  isStudioMode, 
  activeNode, 
  onSelectNode 
}: { 
  isStudioMode: boolean
  activeNode: string | null
  onSelectNode: (node: string | null) => void
}) {
  const textColor = isStudioMode ? '#0f172a' : '#f8fafc'
  const subtextColor = isStudioMode ? '#64748b' : '#94a3b8'
  const boxFill = isStudioMode ? '#ffffff' : '#0f172a'
  const boxStroke = isStudioMode ? '#cbd5e1' : '#334155'
  
  return (
    <svg id="schematic-svg-agentic-ai" viewBox="0 0 680 200" className="w-full h-auto max-w-[660px]">
      <defs>
        <marker id="arrow-agent-std" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill={isStudioMode ? '#0f172a' : '#94a3b8'} />
        </marker>
        <marker id="arrow-agent-action" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
        </marker>
      </defs>

      {/* 1. Left Cluster: Memory, Tools, Goals */}
      {/* Memory */}
      <g 
        transform="translate(18, 10)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'memory' ? null : 'memory')}
      >
        <circle 
          cx="20" cy="18" r="16" 
          fill={activeNode === 'memory' ? '#ec4899' : (isStudioMode ? '#fce7f3' : '#831843')} 
          stroke="#ec4899" 
          strokeWidth={activeNode === 'memory' ? '2.5' : '1.5'} 
        />
        <text x="20" y="23" fontSize="16" textAnchor="middle">🧠</text>
        <text x="20" y="46" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Memory</text>
      </g>

      {/* Tools */}
      <g 
        transform="translate(18, 70)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'tools' ? null : 'tools')}
      >
        <circle 
          cx="20" cy="18" r="16" 
          fill={activeNode === 'tools' ? '#f43f5e' : (isStudioMode ? '#fce7f3' : '#831843')} 
          stroke="#f43f5e" 
          strokeWidth={activeNode === 'tools' ? '2.5' : '1.5'} 
        />
        <text x="20" y="23" fontSize="16" textAnchor="middle">🛠️</text>
        <text x="20" y="46" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Tools</text>
      </g>

      {/* Goals */}
      <g 
        transform="translate(18, 130)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'goals' ? null : 'goals')}
      >
        <circle 
          cx="20" cy="18" r="16" 
          fill={activeNode === 'goals' ? '#f43f5e' : (isStudioMode ? '#ffe4e6' : '#881337')} 
          stroke="#f43f5e" 
          strokeWidth={activeNode === 'goals' ? '2.5' : '1.5'} 
        />
        <text x="20" y="23" fontSize="16" textAnchor="middle">🎯</text>
        <text x="20" y="46" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Goals</text>
      </g>

      {/* Dashed Ingress connectors */}
      <path d="M 58 28 C 110 28, 110 100, 160 100" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-agent-std)" />
      <path d="M 58 88 L 160 100" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-agent-std)" />
      <path d="M 58 148 C 110 148, 110 100, 160 100" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-agent-std)" />

      {/* 2. Center: Illustrated Robot Agent */}
      <g 
        transform="translate(170, 50)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'agent' ? null : 'agent')}
      >
        <rect 
          x="0" y="0" width="105" height="96" rx="14" 
          fill={activeNode === 'agent' ? '#047857' : (isStudioMode ? '#f0fdf4' : '#022c22')} 
          stroke="#10b981" 
          strokeWidth={activeNode === 'agent' ? '3' : '2'} 
        />
        {/* Screen inside robot */}
        <rect x="14" y="10" width="77" height="42" rx="6" fill="#0284c7" />
        <text x="52" y="24" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">print</text>
        <text x="52" y="34" fill="#38bdf8" fontSize="7.5" textAnchor="middle" fontFamily="monospace">&quot;Hello</text>
        <text x="52" y="44" fill="#38bdf8" fontSize="7.5" textAnchor="middle" fontFamily="monospace">World :)&quot;</text>
        
        {/* Antennae & Pedestal */}
        <circle cx="52" cy="4" r="3" fill="#10b981" />
        <line x1="52" y1="4" x2="52" y2="10" stroke="#10b981" strokeWidth="1.5" />
        <rect x="25" y="60" width="55" height="12" rx="4" fill={isStudioMode ? '#e2e8f0' : '#1e293b'} stroke={boxStroke} />
        <text x="52" y="86" fill={textColor} fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Agent</text>
      </g>

      {/* 3. Actions connector */}
      <path d="M 285 100 L 335 100" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-agent-action)" />
      
      {/* Actions Icon with Play Gear */}
      <g 
        transform="translate(345, 68)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'actions' ? null : 'actions')}
      >
        <circle 
          cx="28" cy="22" r="18" 
          fill={activeNode === 'actions' ? '#10b981' : (isStudioMode ? '#dcfce7' : '#064e3b')} 
          stroke="#10b981" 
          strokeWidth={activeNode === 'actions' ? '2.5' : '1.5'} 
        />
        <polygon points="24,14 36,22 24,30" fill={activeNode === 'actions' ? '#ffffff' : '#10b981'} />
        <text x="28" y="56" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Actions</text>
      </g>

      {/* Connector from Actions to Environment */}
      <path d="M 405 100 L 445 100" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-agent-std)" />

      {/* 4. Environment: Clean Cloud */}
      <g 
        transform="translate(455, 60)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'env' ? null : 'env')}
      >
        <path 
          d="M 20 40 A 18 18 0 0 1 38 18 A 24 24 0 0 1 76 18 A 18 18 0 0 1 96 40 A 12 12 0 0 1 92 52 L 18 52 A 12 12 0 0 1 20 40 Z" 
          fill={activeNode === 'env' ? (isStudioMode ? '#e0f2fe' : '#0369a1') : boxFill} 
          stroke={activeNode === 'env' ? '#0284c7' : boxStroke} 
          strokeWidth={activeNode === 'env' ? '2' : '1.5'} 
        />
        <text x="56" y="70" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Environment</text>
      </g>

      {/* 5. Feedback Loop: Observations via Eye Icon */}
      <path d="M 510 55 C 510 18, 410 18, 385 18 C 340 18, 240 18, 222 45" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-agent-std)" />
      
      {/* Eye icon in the middle */}
      <g 
        transform="translate(370, 4)" 
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectNode(activeNode === 'observations' ? null : 'observations')}
      >
        <circle 
          cx="15" cy="14" r="13" 
          fill={activeNode === 'observations' ? '#38bdf8' : (isStudioMode ? '#e0f2fe' : '#0c4a6e')} 
          stroke="#0284c7" 
          strokeWidth={activeNode === 'observations' ? '2' : '1.2'} 
        />
        <text x="15" y="19" fontSize="13" textAnchor="middle">👁️</text>
        <text x="15" y="38" fill={subtextColor} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Observations</text>
      </g>
    </svg>
  )
}

function LargeReasoningModelSchematic({ 
  isStudioMode,
  isCotTraced,
  onToggleCot
}: { 
  isStudioMode: boolean
  isCotTraced: boolean
  onToggleCot: () => void
}) {
  const textColor = isStudioMode ? '#0f172a' : '#f8fafc'
  const subtextColor = isStudioMode ? '#64748b' : '#94a3b8'
  
  return (
    <svg id="schematic-svg-lrm" viewBox="0 0 680 200" className="w-full h-auto max-w-[660px]">
      <defs>
        <marker id="arrow-lrm-down" viewBox="0 0 10 10" refX="5" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 1 0 L 5 8 L 9 0 z" fill="#0284c7" />
        </marker>
      </defs>

      {/* ================= LEFT FLOW: ABSTRACT ================= */}
      <g transform="translate(10, 8)">
        {/* Question */}
        <rect x="0" y="0" width="115" height="26" rx="6" fill="#38bdf8" />
        <text x="57" y="17" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Question</text>
        
        <path d="M 57 26 L 57 38" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow-lrm-down)" />

        {/* Large Reasoning Model Box */}
        <g transform="translate(-10, 40)">
          <rect x="0" y="0" width="135" height="34" rx="8" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
          <text x="67" y="16" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">&quot;Reasoning&quot;</text>
          <text x="67" y="27" fill="#0369a1" fontSize="8.5" textAnchor="middle" fontFamily="sans-serif">Large Language Model</text>
        </g>

        <path d="M 57 74 L 57 84" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow-lrm-down)" />

        {/* Internal Reasoning Capsules */}
        <g transform="translate(-6, 86)">
          <rect x="0" y="0" width="128" height="19" rx="9" fill="#ffe4e6" stroke="#fb7185" strokeWidth="1" />
          <text x="64" y="13" fill="#e11d48" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Internal reasoning 1</text>
          
          <rect x="0" y="23" width="128" height="19" rx="9" fill="#ffe4e6" stroke="#fb7185" strokeWidth="1" />
          <text x="64" y="36" fill="#e11d48" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Internal reasoning 2</text>
          
          {/* Vertical dotted connector */}
          <line x1="64" y1="44" x2="64" y2="49" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="2 2" />

          <rect x="0" y="51" width="128" height="19" rx="9" fill="#ffe4e6" stroke="#fb7185" strokeWidth="1" />
          <text x="64" y="64" fill="#e11d48" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Internal reasoning n</text>
        </g>

        {/* Annotation on reasoning */}
        <path d="M 126 100 C 138 100, 138 120, 142 120 C 138 120, 138 140, 126 140" fill="none" stroke="#e11d48" strokeWidth="1" />
        <text x="146" y="123" fill="#e11d48" fontSize="7.5" fontFamily="sans-serif">&quot;reason&quot; before</text>
        <text x="146" y="132" fill="#e11d48" fontSize="7.5" fontFamily="sans-serif">answering</text>

        <path d="M 57 160 L 57 168" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow-lrm-down)" />

        {/* Answer */}
        <rect x="0" y="169" width="115" height="23" rx="11" fill="#0284c7" />
        <text x="57" y="184" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Answer</text>
      </g>

      {/* ================= BIG ARROW: EXAMPLE ================= */}
      <g transform="translate(230, 75)" className="cursor-pointer" onClick={onToggleCot}>
        <polygon points="0,12 35,12 35,0 60,24 35,48 35,36 0,36" fill={isCotTraced ? '#10b981' : '#06b6d4'} stroke={isCotTraced ? '#059669' : '#0891b2'} strokeWidth="1" />
        <text x="25" y="28" fill="#ffffff" fontSize="10" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">Example</text>
      </g>

      {/* ================= RIGHT FLOW: CONCRETE APPLES EXAMPLE ================= */}
      <g transform="translate(320, 8)">
        {/* Concrete Question */}
        <g transform="translate(40, 0)">
          <text x="75" y="10" fill={subtextColor} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Question</text>
          <rect x="0" y="13" width="155" height="30" rx="6" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
          <text x="77" y="25" fill="#0369a1" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">I have 10 apples. I gave 2 apples</text>
          <text x="77" y="36" fill="#0369a1" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">away. I ate 1. How many do I have?</text>
        </g>

        <path d="M 115 44 L 115 54" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow-lrm-down)" />

        {/* Large Reasoning Model Box */}
        <g transform="translate(50, 56)">
          <rect x="0" y="0" width="135" height="32" rx="8" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
          <text x="67" y="14" fill="#0369a1" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">&quot;Reasoning&quot;</text>
          <text x="67" y="25" fill="#0369a1" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Large Language Model</text>
        </g>

        <path d="M 115 88 L 115 97" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow-lrm-down)" />

        {/* Concrete CoT Capsules */}
        <g transform="translate(42, 98)" className="cursor-pointer" onClick={onToggleCot}>
          <rect 
            x="0" y="0" width="150" height="18" rx="9" 
            fill={isCotTraced ? '#fecdd3' : '#ffe4e6'} 
            stroke={isCotTraced ? '#e11d48' : '#fb7185'} 
            strokeWidth={isCotTraced ? '1.5' : '1'} 
          />
          <text x="75" y="12" fill="#e11d48" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">You have 10 apples</text>
          
          <rect 
            x="0" y="21" width="150" height="18" rx="9" 
            fill={isCotTraced ? '#fecdd3' : '#ffe4e6'} 
            stroke={isCotTraced ? '#e11d48' : '#fb7185'} 
            strokeWidth={isCotTraced ? '1.5' : '1'} 
          />
          <text x="75" y="33" fill="#e11d48" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">You gave 2 away and have 8 left</text>
          
          <rect 
            x="0" y="42" width="150" height="18" rx="9" 
            fill={isCotTraced ? '#fecdd3' : '#ffe4e6'} 
            stroke={isCotTraced ? '#e11d48' : '#fb7185'} 
            strokeWidth={isCotTraced ? '1.5' : '1'} 
          />
          <text x="75" y="54" fill="#e11d48" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">You ate 1 and have 7 left</text>
        </g>

        {/* CoT annotation */}
        <path d="M 38 128 C 0 128, -10 148, -10 156" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
        <text x="-15" y="162" fill={subtextColor} fontSize="7" textAnchor="end" fontFamily="sans-serif">reason steps</text>
        <text x="-15" y="170" fill={subtextColor} fontSize="6.5" textAnchor="end" fontFamily="sans-serif">(typically Chain-of-Thought)</text>

        <path d="M 115 160 L 115 168" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#arrow-lrm-down)" />

        {/* Final Answer */}
        <g transform="translate(45, 170)">
          <rect 
            x="0" y="0" width="145" height="23" rx="11" 
            fill={isCotTraced ? '#059669' : '#0284c7'} 
          />
          <text x="72" y="15" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">You have 7 apples</text>
          <path d="M 175 12 C 160 12, 155 12, 148 12" fill="none" stroke="#0f172a" strokeWidth="1" markerEnd="url(#arrow-lrm-down)" />
          <text x="180" y="14" fill={textColor} fontSize="7.5" fontFamily="sans-serif">final answer</text>
        </g>
      </g>
    </svg>
  )
}

function VectorDatabaseSchematic({ 
  isStudioMode,
  selectedDataType,
  onSelectDataType
}: { 
  isStudioMode: boolean
  selectedDataType: 'text' | 'image' | 'audio' | 'video'
  onSelectDataType: (type: 'text' | 'image' | 'audio' | 'video') => void
}) {
  const textColor = isStudioMode ? '#0f172a' : '#f8fafc'
  const subtextColor = isStudioMode ? '#64748b' : '#94a3b8'
  const boxFill = isStudioMode ? '#ffffff' : '#0f172a'
  const boxStroke = isStudioMode ? '#cbd5e1' : '#334155'
  
  return (
    <svg id="schematic-svg-vectordb" viewBox="0 0 680 200" className="w-full h-auto max-w-[660px]">
      <defs>
        <marker id="arrow-vdb" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill={isStudioMode ? '#0f172a' : '#94a3b8'} />
        </marker>
      </defs>

      {/* 1. Source Data Box (Dashed Container) */}
      <g transform="translate(15, 20)">
        <rect x="0" y="0" width="125" height="135" rx="12" fill={isStudioMode ? '#eff6ff' : '#0c1a2e'} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 3" />
        
        {/* 2x2 grid */}
        {/* Text */}
        <g 
          transform="translate(15, 15)" 
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectDataType('text')}
        >
          <rect 
            x="0" y="0" width="38" height="38" rx="6" 
            fill={selectedDataType === 'text' ? (isStudioMode ? '#dbeafe' : '#1e3a8a') : boxFill} 
            stroke={selectedDataType === 'text' ? '#2563eb' : boxStroke} 
            strokeWidth={selectedDataType === 'text' ? '2' : '1'} 
          />
          <text x="19" y="24" fontSize="16" textAnchor="middle">📄</text>
          <text x="19" y="50" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Text</text>
        </g>

        {/* Image */}
        <g 
          transform="translate(70, 15)" 
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectDataType('image')}
        >
          <rect 
            x="0" y="0" width="38" height="38" rx="6" 
            fill={selectedDataType === 'image' ? (isStudioMode ? '#dbeafe' : '#1e3a8a') : boxFill} 
            stroke={selectedDataType === 'image' ? '#2563eb' : boxStroke} 
            strokeWidth={selectedDataType === 'image' ? '2' : '1'} 
          />
          <text x="19" y="24" fontSize="16" textAnchor="middle">🖼️</text>
          <text x="19" y="50" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Image</text>
        </g>

        {/* Audio */}
        <g 
          transform="translate(15, 75)" 
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectDataType('audio')}
        >
          <rect 
            x="0" y="0" width="38" height="38" rx="6" 
            fill={selectedDataType === 'audio' ? (isStudioMode ? '#dbeafe' : '#1e3a8a') : boxFill} 
            stroke={selectedDataType === 'audio' ? '#2563eb' : boxStroke} 
            strokeWidth={selectedDataType === 'audio' ? '2' : '1'} 
          />
          <text x="19" y="24" fontSize="16" textAnchor="middle">🔊</text>
          <text x="19" y="50" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Audio</text>
        </g>

        {/* Video */}
        <g 
          transform="translate(70, 75)" 
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectDataType('video')}
        >
          <rect 
            x="0" y="0" width="38" height="38" rx="6" 
            fill={selectedDataType === 'video' ? (isStudioMode ? '#dbeafe' : '#1e3a8a') : boxFill} 
            stroke={selectedDataType === 'video' ? '#2563eb' : boxStroke} 
            strokeWidth={selectedDataType === 'video' ? '2' : '1'} 
          />
          <text x="19" y="24" fontSize="16" textAnchor="middle">🎬</text>
          <text x="19" y="50" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Video</text>
        </g>

        <text x="62" y="152" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Source Data</text>
      </g>

      {/* Arrow from Source Data to Embedding Model */}
      <path d="M 148 85 L 180 85" fill="none" stroke={subtextColor} strokeWidth="2" markerEnd="url(#arrow-vdb)" />

      {/* 2. Embedding Model (Isometric 3D Cube) */}
      <g transform="translate(190, 48)">
        {/* Top Face */}
        <polygon points="38,0 76,18 38,36 0,18" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
        {/* Left Face */}
        <polygon points="0,18 38,36 38,80 0,62" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
        {/* Right Face */}
        <polygon points="38,36 76,18 76,62 38,80" fill="#15803d" stroke="#16a34a" strokeWidth="1.5" />
        
        <text x="38" y="105" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Embedding</text>
        <text x="38" y="118" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Model</text>
      </g>

      {/* Arrow from Embedding Model to Embeddings Table */}
      <path d="M 285 85 L 320 85" fill="none" stroke={subtextColor} strokeWidth="2" markerEnd="url(#arrow-vdb)" />

      {/* 3. Embeddings (Data Matrix Table) */}
      <g transform="translate(330, 25)">
        <rect x="0" y="0" width="150" height="126" rx="6" fill={boxFill} stroke={boxStroke} strokeWidth="1.5" />
        
        {/* Table Rows */}
        <g fontFamily="monospace" fontSize="9" textAnchor="middle" fill={textColor}>
          {/* Row 1 */}
          <line x1="0" y1="21" x2="150" y2="21" stroke={boxStroke} strokeWidth="0.8" />
          <text x="25" y="15">0.2</text>
          <text x="62" y="15">0.5</text>
          <text x="96" y="15">.........</text>
          <text x="130" y="15">2.3</text>

          {/* Row 2 */}
          <line x1="0" y1="42" x2="150" y2="42" stroke={boxStroke} strokeWidth="0.8" />
          <text x="25" y="36">4.1</text>
          <text x="62" y="36">-1.9</text>
          <text x="96" y="36">.........</text>
          <text x="130" y="36">-1.7</text>

          {/* Row 3 */}
          <line x1="0" y1="63" x2="150" y2="63" stroke={boxStroke} strokeWidth="0.8" />
          <text x="25" y="57">5.4</text>
          <text x="62" y="57">0.7</text>
          <text x="96" y="57">.........</text>
          <text x="130" y="57">-1.5</text>

          {/* Row 4 */}
          <line x1="0" y1="84" x2="150" y2="84" stroke={boxStroke} strokeWidth="0.8" />
          <text x="25" y="78">-1.7</text>
          <text x="62" y="78">2.3</text>
          <text x="96" y="78">.........</text>
          <text x="130" y="78">5.1</text>

          {/* Row 5 */}
          <line x1="0" y1="105" x2="150" y2="105" stroke={boxStroke} strokeWidth="0.8" />
          <text x="25" y="99">0.5</text>
          <text x="62" y="99">-1.4</text>
          <text x="96" y="99">.........</text>
          <text x="130" y="99">0.6</text>

          {/* Row 6 */}
          <text x="25" y="120">-2.4</text>
          <text x="62" y="120">4.1</text>
          <text x="96" y="120">.........</text>
          <text x="130" y="120">0.9</text>
        </g>

        {/* Vertical divider lines */}
        <line x1="45" y1="0" x2="45" y2="126" stroke={boxStroke} strokeWidth="0.8" />
        <line x1="80" y1="0" x2="80" y2="126" stroke={boxStroke} strokeWidth="0.8" />
        <line x1="112" y1="0" x2="112" y2="126" stroke={boxStroke} strokeWidth="0.8" />

        <text x="75" y="146" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Embeddings</text>
      </g>

      {/* Arrow from Embeddings to Vector DB */}
      <path d="M 490 85 L 530 85" fill="none" stroke={subtextColor} strokeWidth="2" markerEnd="url(#arrow-vdb)" />

      {/* 4. Vector Database (3D Cylindrical Layers) */}
      <g transform="translate(545, 45)">
        <ellipse cx="42" cy="16" rx="36" ry="12" fill="#93c5fd" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M 6 16 L 6 36 A 36 12 0 0 0 78 36 L 78 16" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
        <ellipse cx="42" cy="36" rx="36" ry="12" fill="#93c5fd" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M 6 36 L 6 56 A 36 12 0 0 0 78 56 L 78 36" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.5" />
        <ellipse cx="42" cy="56" rx="36" ry="12" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M 6 56 L 6 76 A 36 12 0 0 0 78 76 L 78 56" fill="#1d4ed8" stroke="#2563eb" strokeWidth="1.5" />

        <text x="42" y="105" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Vector</text>
        <text x="42" y="118" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Database</text>
      </g>
    </svg>
  )
}

function RagSchematic({ 
  isStudioMode,
  activeStep,
  onTriggerStep
}: { 
  isStudioMode: boolean
  activeStep: number | null
  onTriggerStep: (step: number) => void
}) {
  const textColor = isStudioMode ? '#0f172a' : '#f8fafc'
  const subtextColor = isStudioMode ? '#64748b' : '#94a3b8'
  const boxFill = isStudioMode ? '#ffffff' : '#0f172a'
  const boxStroke = isStudioMode ? '#cbd5e1' : '#334155'
  
  return (
    <svg id="schematic-svg-rag" viewBox="0 0 680 200" className="w-full h-auto max-w-[660px]">
      <defs>
        <marker id="arrow-rag" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill={isStudioMode ? '#0f172a' : '#94a3b8'} />
        </marker>
      </defs>

      {/* 1. User Avatar */}
      <g transform="translate(30, 45)">
        <circle cx="25" cy="25" r="22" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
        <circle cx="25" cy="18" r="9" fill="#0f172a" />
        <path d="M 12 39 A 14 14 0 0 1 38 39" fill="#0f172a" />
        <text x="25" y="65" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">User</text>
      </g>

      {/* Step 1: Query Arrow to Retriever */}
      <path d="M 85 70 L 170 70" fill="none" stroke={activeStep === 1 ? '#ea580c' : subtextColor} strokeWidth={activeStep === 1 ? '2.5' : '1.5'} strokeDasharray="4 3" markerEnd="url(#arrow-rag)" />
      
      {/* Step 1 Number Badge & Label */}
      <g transform="translate(110, 48)" className="cursor-pointer" onClick={() => onTriggerStep(1)}>
        <circle cx="10" cy="10" r="9" fill={activeStep === 1 ? '#ea580c' : '#fed7aa'} stroke="#ea580c" strokeWidth="1" />
        <text x="10" y="14" fill={activeStep === 1 ? '#ffffff' : '#9a3412'} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">1</text>
        <text x="10" y="32" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Query</text>
      </g>

      {/* 2. Retriever Avatar */}
      <g transform="translate(180, 45)">
        <circle cx="25" cy="25" r="22" fill="#fdba74" stroke="#ea580c" strokeWidth="1.5" />
        <text x="25" y="32" fontSize="18" textAnchor="middle">ℹ️</text>
        <text x="25" y="65" fill={textColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Retriever</text>
      </g>

      {/* Step 2: Upward curved Search arrow to Knowledge Base */}
      <path d="M 235 60 C 265 25, 300 25, 350 25" fill="none" stroke={activeStep === 2 ? '#ea580c' : subtextColor} strokeWidth={activeStep === 2 ? '2.5' : '1.5'} strokeDasharray="4 3" markerEnd="url(#arrow-rag)" />
      
      {/* Step 2 Number Badge & Label */}
      <g transform="translate(265, 8)" className="cursor-pointer" onClick={() => onTriggerStep(2)}>
        <circle cx="10" cy="10" r="9" fill={activeStep === 2 ? '#ea580c' : '#fed7aa'} stroke="#ea580c" strokeWidth="1" />
        <text x="10" y="14" fill={activeStep === 2 ? '#ffffff' : '#9a3412'} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2</text>
        <text x="36" y="14" fill={textColor} fontSize="9" fontWeight="bold" fontFamily="sans-serif">Search</text>
      </g>

      {/* 3. Knowledge Base (Dashed Amber Box) */}
      <g transform="translate(365, 12)">
        <rect x="0" y="0" width="160" height="96" rx="12" fill={isStudioMode ? '#fffbeb' : '#1c1917'} stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 3" />
        
        <rect x="25" y="-10" width="110" height="20" rx="6" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
        <text x="80" y="4" fill="#92400e" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Knowledge Base</text>

        {/* 3 Items: PDF, Vector DB, Code */}
        <g transform="translate(14, 25)">
          <rect x="0" y="0" width="36" height="42" rx="4" fill={boxFill} stroke={boxStroke} />
          <text x="18" y="24" fontSize="14" textAnchor="middle">📄</text>
          <text x="18" y="55" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PDF</text>
        </g>

        <g transform="translate(62, 25)">
          <ellipse cx="18" cy="8" rx="16" ry="6" fill="#cbd5e1" stroke={boxStroke} />
          <path d="M 2 8 L 2 28 A 16 6 0 0 0 34 28 L 34 8" fill="#94a3b8" stroke={boxStroke} />
          <text x="18" y="55" fill={textColor} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Vector DB</text>
        </g>

        <g transform="translate(110, 25)">
          <rect x="0" y="0" width="36" height="42" rx="4" fill={boxFill} stroke={boxStroke} />
          <text x="18" y="26" fontSize="11" fontWeight="bold" fill="#0284c7" textAnchor="middle" fontFamily="monospace">&lt;/&gt;</text>
          <text x="18" y="55" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Code</text>
        </g>
      </g>

      {/* Step 3: Downward curved Relevant Text arrow back to Retriever */}
      <path d="M 360 85 C 310 100, 260 100, 235 85" fill="none" stroke={activeStep === 3 ? '#ea580c' : subtextColor} strokeWidth={activeStep === 3 ? '2.5' : '1.5'} strokeDasharray="4 3" markerEnd="url(#arrow-rag)" />
      
      {/* Step 3 Number Badge & Label */}
      <g transform="translate(265, 88)" className="cursor-pointer" onClick={() => onTriggerStep(3)}>
        <circle cx="10" cy="10" r="9" fill={activeStep === 3 ? '#ea580c' : '#fed7aa'} stroke="#ea580c" strokeWidth="1" />
        <text x="10" y="14" fill={activeStep === 3 ? '#ffffff' : '#9a3412'} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">3</text>
        <text x="36" y="14" fill={textColor} fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">Relevant text</text>
      </g>

      {/* Step 4: Retriever -> LLM arrow */}
      <path d="M 205 110 L 205 145" fill="none" stroke={activeStep === 4 ? '#ea580c' : subtextColor} strokeWidth={activeStep === 4 ? '2.5' : '1.5'} strokeDasharray="4 3" markerEnd="url(#arrow-rag)" />
      
      {/* Step 4 Number Badge & Label */}
      <g transform="translate(130, 120)" className="cursor-pointer" onClick={() => onTriggerStep(4)}>
        <circle cx="10" cy="10" r="9" fill={activeStep === 4 ? '#ea580c' : '#fed7aa'} stroke="#ea580c" strokeWidth="1" />
        <text x="10" y="14" fill={activeStep === 4 ? '#ffffff' : '#9a3412'} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">4</text>
        <text x="55" y="14" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Query + Text</text>
      </g>

      {/* 4. LLM Engine (Gold Gear / Chip) */}
      <g transform="translate(182, 145)">
        <circle cx="22" cy="22" r="20" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" strokeDasharray="6 3" />
        <circle cx="22" cy="22" r="14" fill="#facc15" />
        <text x="22" y="27" fontSize="14" textAnchor="middle">⚙️</text>
        <text x="65" y="26" fill={textColor} fontSize="12" fontWeight="extrabold" fontFamily="sans-serif">LLM</text>
      </g>

      {/* Step 5: Generate response curved line from LLM back to User */}
      <path d="M 180 167 C 100 170, 55 150, 55 115" fill="none" stroke={activeStep === 5 ? '#10b981' : subtextColor} strokeWidth={activeStep === 5 ? '2.5' : '1.5'} strokeDasharray="4 3" markerEnd="url(#arrow-rag)" />
      
      {/* Step 5 Badge & Label */}
      <g transform="translate(68, 165)" className="cursor-pointer" onClick={() => onTriggerStep(5)}>
        <circle cx="10" cy="10" r="9" fill={activeStep === 5 ? '#10b981' : '#fed7aa'} stroke="#10b981" strokeWidth="1" />
        <text x="10" y="14" fill={activeStep === 5 ? '#ffffff' : '#9a3412'} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">5</text>
        <text x="68" y="14" fill={textColor} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Generate response</text>
      </g>
    </svg>
  )
}

function McpSchematic({ 
  isStudioMode,
  selectedServer,
  onSelectServer
}: { 
  isStudioMode: boolean
  selectedServer: 'A' | 'B' | 'C' | null
  onSelectServer: (server: 'A' | 'B' | 'C' | null) => void
}) {
  const textColor = isStudioMode ? '#0f172a' : '#f8fafc'
  const subtextColor = isStudioMode ? '#64748b' : '#94a3b8'
  const boxFill = isStudioMode ? '#ffffff' : '#0f172a'
  const boxStroke = isStudioMode ? '#cbd5e1' : '#334155'
  
  return (
    <svg id="schematic-svg-mcp" viewBox="0 0 680 200" className="w-full h-auto max-w-[660px]">
      <defs>
        <marker id="arrow-mcp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill={isStudioMode ? '#0f172a' : '#94a3b8'} />
        </marker>
      </defs>

      {/* 1. Left: MCP Host Container */}
      <g transform="translate(15, 10)">
        <rect x="0" y="0" width="100" height="175" rx="12" fill={isStudioMode ? '#fdf4ff' : '#2e1065'} stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="50" y="24" fill="#a855f7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Host</text>
        
        {/* Claude Sunburst */}
        <g transform="translate(36, 32)">
          <circle cx="14" cy="14" r="10" fill="#f472b6" />
          <text x="14" y="19" fontSize="14" textAnchor="middle">✳️</text>
        </g>
        <text x="50" y="70" fill={textColor} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Claude Desktop</text>

        {/* IDE icon */}
        <g transform="translate(32, 85)">
          <rect x="0" y="0" width="36" height="24" rx="4" fill={boxFill} stroke={boxStroke} />
          <text x="18" y="16" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">&gt;_</text>
        </g>
        <text x="50" y="122" fill={textColor} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">IDE</text>

        {/* AI Tools */}
        <g transform="translate(36, 130)">
          <text x="14" y="14" fontSize="16" textAnchor="middle">🛠️</text>
        </g>
        <text x="50" y="162" fill={textColor} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">AI Tools</text>
      </g>

      {/* 3 Parallel Communication Rows */}
      {/* ================= ROW 1: SERVER A ================= */}
      <g 
        transform="translate(125, 25)" 
        className="cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={() => onSelectServer(selectedServer === 'A' ? null : 'A')}
      >
        <rect x="0" y="0" width="60" height="26" rx="6" fill={boxFill} stroke={boxStroke} />
        <text x="30" y="11" fill={textColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP</text>
        <text x="30" y="20" fill={textColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Client</text>

        <line x1="60" y1="13" x2="80" y2="13" stroke={subtextColor} strokeWidth="1.2" />

        <rect x="80" y="4" width="76" height="18" rx="9" fill={isStudioMode ? '#f1f5f9' : '#1e293b'} stroke={boxStroke} />
        <text x="118" y="16" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Protocol</text>

        <line x1="156" y1="13" x2="185" y2="13" stroke={subtextColor} strokeWidth="1.2" />

        {/* MCP Server A (Server Rack) */}
        <g transform="translate(185, -2)">
          <rect 
            x="0" y="0" width="55" height="30" rx="4" 
            fill={selectedServer === 'A' ? '#0369a1' : (isStudioMode ? '#e2e8f0' : '#1e293b')} 
            stroke={selectedServer === 'A' ? '#38bdf8' : boxStroke} 
            strokeWidth={selectedServer === 'A' ? '2' : '1'} 
          />
          <circle cx="8" cy="8" r="2" fill="#22c55e" />
          <circle cx="8" cy="15" r="2" fill="#22c55e" />
          <circle cx="8" cy="22" r="2" fill="#22c55e" />
          <line x1="16" y1="8" x2="48" y2="8" stroke={subtextColor} strokeWidth="1.5" />
          <line x1="16" y1="15" x2="48" y2="15" stroke={subtextColor} strokeWidth="1.5" />
          <line x1="16" y1="22" x2="48" y2="22" stroke={subtextColor} strokeWidth="1.5" />
          <text x="27" y="40" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Server A</text>
        </g>

        <path d="M 245 13 L 290 13" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrow-mcp)" />

        <g transform="translate(295, -2)">
          <circle cx="15" cy="15" r="14" fill="#0f172a" />
          <text x="15" y="20" fontSize="14" textAnchor="middle">🐙</text>
          <text x="15" y="38" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Github</text>

          <circle cx="45" cy="15" r="14" fill="#4a154b" />
          <text x="45" y="20" fontSize="12" textAnchor="middle">💬</text>
          <text x="45" y="38" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Slack</text>

          <text x="30" y="50" fill={subtextColor} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Web APIs</text>
        </g>
      </g>

      {/* ================= ROW 2: SERVER B ================= */}
      <g 
        transform="translate(125, 85)" 
        className="cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={() => onSelectServer(selectedServer === 'B' ? null : 'B')}
      >
        <rect x="0" y="0" width="60" height="26" rx="6" fill={boxFill} stroke={boxStroke} />
        <text x="30" y="11" fill={textColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP</text>
        <text x="30" y="20" fill={textColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Client</text>

        <line x1="60" y1="13" x2="80" y2="13" stroke={subtextColor} strokeWidth="1.2" />

        <rect x="80" y="4" width="76" height="18" rx="9" fill={isStudioMode ? '#f1f5f9' : '#1e293b'} stroke={boxStroke} />
        <text x="118" y="16" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Protocol</text>

        <line x1="156" y1="13" x2="185" y2="13" stroke={subtextColor} strokeWidth="1.2" />

        <g transform="translate(185, -2)">
          <rect 
            x="0" y="0" width="55" height="30" rx="4" 
            fill={selectedServer === 'B' ? '#047857' : (isStudioMode ? '#e2e8f0' : '#1e293b')} 
            stroke={selectedServer === 'B' ? '#34d399' : boxStroke} 
            strokeWidth={selectedServer === 'B' ? '2' : '1'} 
          />
          <circle cx="8" cy="8" r="2" fill="#22c55e" />
          <circle cx="8" cy="15" r="2" fill="#22c55e" />
          <circle cx="8" cy="22" r="2" fill="#22c55e" />
          <line x1="16" y1="8" x2="48" y2="8" stroke={subtextColor} strokeWidth="1.5" />
          <line x1="16" y1="15" x2="48" y2="15" stroke={subtextColor} strokeWidth="1.5" />
          <line x1="16" y1="22" x2="48" y2="22" stroke={subtextColor} strokeWidth="1.5" />
          <text x="27" y="40" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Server B</text>
        </g>

        <path d="M 245 13 L 290 13" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrow-mcp)" />

        <g transform="translate(305, -5)">
          <ellipse cx="20" cy="10" rx="16" ry="6" fill="#93c5fd" stroke="#2563eb" />
          <path d="M 4 10 L 4 28 A 16 6 0 0 0 36 28 L 36 10" fill="#60a5fa" stroke="#2563eb" />
          <text x="20" y="44" fill={textColor} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Database</text>
        </g>
      </g>

      {/* ================= ROW 3: SERVER C ================= */}
      <g 
        transform="translate(125, 145)" 
        className="cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={() => onSelectServer(selectedServer === 'C' ? null : 'C')}
      >
        <rect x="0" y="0" width="60" height="26" rx="6" fill={boxFill} stroke={boxStroke} />
        <text x="30" y="11" fill={textColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP</text>
        <text x="30" y="20" fill={textColor} fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Client</text>

        <line x1="60" y1="13" x2="80" y2="13" stroke={subtextColor} strokeWidth="1.2" />

        <rect x="80" y="4" width="76" height="18" rx="9" fill={isStudioMode ? '#f1f5f9' : '#1e293b'} stroke={boxStroke} />
        <text x="118" y="16" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Protocol</text>

        <line x1="156" y1="13" x2="185" y2="13" stroke={subtextColor} strokeWidth="1.2" />

        <g transform="translate(185, -2)">
          <rect 
            x="0" y="0" width="55" height="30" rx="4" 
            fill={selectedServer === 'C' ? '#b45309' : (isStudioMode ? '#e2e8f0' : '#1e293b')} 
            stroke={selectedServer === 'C' ? '#fbbf24' : boxStroke} 
            strokeWidth={selectedServer === 'C' ? '2' : '1'} 
          />
          <circle cx="8" cy="8" r="2" fill="#22c55e" />
          <circle cx="8" cy="15" r="2" fill="#22c55e" />
          <circle cx="8" cy="22" r="2" fill="#22c55e" />
          <line x1="16" y1="8" x2="48" y2="8" stroke={subtextColor} strokeWidth="1.5" />
          <line x1="16" y1="15" x2="48" y2="15" stroke={subtextColor} strokeWidth="1.5" />
          <line x1="16" y1="22" x2="48" y2="22" stroke={subtextColor} strokeWidth="1.5" />
          <text x="27" y="40" fill={textColor} fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">MCP Server C</text>
        </g>

        <path d="M 245 13 L 290 13" fill="none" stroke={subtextColor} strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrow-mcp)" />

        <g transform="translate(305, -5)">
          <rect x="0" y="0" width="36" height="26" rx="4" fill="#fef08a" stroke="#ca8a04" strokeDasharray="3 2" />
          <path d="M 0 6 L 14 6 L 18 10 L 36 10" fill="none" stroke="#ca8a04" />
          <text x="18" y="40" fill={textColor} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Filesystem</text>
        </g>
      </g>
    </svg>
  )
}

// ==========================================
// MAIN COMPONENT: BYTEBYTEGO AI CODEX
// ==========================================

export default function ByteByteGoAiCodex() {
  const [viewMode, setViewMode] = useState<'poster' | 'explorer' | 'reference'>('poster')
  const [activeTermId, setActiveTermId] = useState<string>('agentic-ai')
  const [isStudioMode, setIsStudioMode] = useState<boolean>(true) // default to crisp ByteByteGo Editorial Canvas
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false)
  const [copiedMermaid, setCopiedMermaid] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // Interactive node inspection state
  const [activeAgentNode, setActiveAgentNode] = useState<string | null>(null)
  const [isCotTraced, setIsCotTraced] = useState<boolean>(false)
  const [selectedDataType, setSelectedDataType] = useState<'text' | 'image' | 'audio' | 'video'>('text')
  const [activeRagStep, setActiveRagStep] = useState<number | null>(null)
  const [selectedMcpServer, setSelectedMcpServer] = useState<'A' | 'B' | 'C' | null>(null)
  const [copiedSpecId, setCopiedSpecId] = useState<string | null>(null)
  const [isChaosMode, setIsChaosMode] = useState<boolean>(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)
  const [lightboxZoom, setLightboxZoom] = useState<number>(1)

  // Lightbox Escape key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false)
        setLightboxZoom(1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen])

  // Auto-play step-through for Explorer Mode
  useEffect(() => {
    if (!isPlaying || viewMode !== 'explorer') return
    const timer = setInterval(() => {
      setActiveTermId(prev => {
        const idx = AI_TERMS.findIndex(t => t.id === prev)
        const nextIdx = (idx + 1) % AI_TERMS.length
        return AI_TERMS[nextIdx].id
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [isPlaying, viewMode])

  const handleNext = () => {
    const idx = AI_TERMS.findIndex(t => t.id === activeTermId)
    setActiveTermId(AI_TERMS[(idx + 1) % AI_TERMS.length].id)
  }

  const handlePrev = () => {
    const idx = AI_TERMS.findIndex(t => t.id === activeTermId)
    setActiveTermId(AI_TERMS[(idx - 1 + AI_TERMS.length) % AI_TERMS.length].id)
  }

  const activeTerm = AI_TERMS.find(t => t.id === activeTermId) || AI_TERMS[0]

  const handleCopyMermaid = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeTerm.mermaidDiagram)
    }
    setCopiedMermaid(true)
    setTimeout(() => setCopiedMermaid(false), 2000)
  }

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById(`schematic-svg-${activeTerm.id}`)
    if (!svgEl) return
    const serializer = new XMLSerializer()
    let source = serializer.serializeToString(svgEl)
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = `${activeTerm.id}-bytebytego-architecture.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  const handleExportSvg = () => {
    const exportData = {
      specVersion: '1.0.0',
      source: 'ByteByteGo Architecture Codex (meenakannan.dev)',
      architecture: activeTerm.title,
      category: activeTerm.category,
      definition: activeTerm.definition,
      realWorldExamples: activeTerm.realWorldExamples,
      technicalSpecs: activeTerm.technicalSpecs,
      mermaid: activeTerm.mermaidDiagram,
      exportedAt: new Date().toISOString()
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    }
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2000)
  }

  const handleCopyRfcSpec = (term: AiTermSpec) => {
    const rfcMarkdown = [
      `### Architectural RFC: ${term.title} (${term.category})`,
      `- Definition: ${term.definition}`,
      `- Standard Protocol: ${term.technicalSpecs.protocol}`,
      `- Latency Target: ${term.technicalSpecs.latencyTarget}`,
      `- Key Invariant: ${term.technicalSpecs.keyInvariant}`,
      `- Production Stack: ${term.technicalSpecs.productionStack}`,
      `- Real-World Deployments: ${term.realWorldExamples.join(', ')}`,
      '',
      '```mermaid',
      term.mermaidDiagram,
      '```'
    ].join('\n')

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rfcMarkdown)
    }
    setCopiedSpecId(term.id)
    setTimeout(() => setCopiedSpecId(null), 2000)
  }

  return (
    <div className={`rounded-3xl transition-colors duration-300 border ${
      isStudioMode 
        ? 'bg-[#ffffff] text-slate-900 border-slate-200 shadow-2xl' 
        : 'bg-[#060a12]/95 text-slate-100 border-slate-800/80 shadow-2xl'
    } p-4 sm:p-8 overflow-hidden`}>
      
      {/* 1. Header Toolbar: Authentic ByteByteGo Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/60 mb-6">
        
        {/* Authentic ByteByteGo Infographic Title Bar */}
        <div className="flex items-center gap-3.5">
          {/* Vertical Green Accent Pill */}
          <div className="w-2.5 h-10 sm:h-12 rounded-full bg-[#00a884]" />
          
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className={`text-2xl sm:text-4xl font-extrabold font-editorial tracking-tight ${
              isStudioMode ? 'text-slate-900' : 'text-white'
            }`}>
              AI Terms
            </h3>
            
            {/* The Signature Teal Rounded Pill */}
            <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-xs sm:text-base font-extrabold font-sans bg-[#00a884] text-white shadow-sm tracking-wide">
              You Need to Know
            </span>
          </div>

          {/* ByteByteGo Brand Mark */}
          <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-300 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#00a884]" />
            <span className="font-editorial font-bold text-xs sm:text-sm tracking-tight text-slate-500 dark:text-slate-400">
              ByteByteGo Spec
            </span>
          </div>
        </div>

        {/* View Switchers & Canvas Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* View Mode Selector: Poster (Full 5) vs Explorer (Single) vs Reference */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setViewMode('poster')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                viewMode === 'poster'
                  ? 'bg-[#00a884] text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Poster (All 5)</span>
            </button>

            <button
              onClick={() => setViewMode('explorer')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                viewMode === 'explorer'
                  ? 'bg-[#00a884] text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Tour</span>
            </button>

            <button
              onClick={() => setViewMode('reference')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                viewMode === 'reference'
                  ? 'bg-[#00a884] text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Original Reference</span>
            </button>
          </div>

          {/* Studio Canvas Mode Toggle */}
          <button
            onClick={() => setIsStudioMode(!isStudioMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isStudioMode
                ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            aria-label="Toggle Studio Canvas Mode"
          >
            {isStudioMode ? <Moon className="w-3.5 h-3.5 text-cyan-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isStudioMode ? 'Dark Theme' : 'ByteByteGo Canvas'}</span>
          </button>

          {/* Mermaid diagram syntax */}
          <button
            onClick={handleCopyMermaid}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Copy Mermaid Diagram Syntax"
            title="Copy Mermaid syntax for GitHub / Confluence"
          >
            {copiedMermaid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copiedMermaid ? 'Mermaid Copied!' : 'Mermaid'}</span>
          </button>

          {/* Download Pure SVG */}
          <button
            onClick={handleDownloadSvg}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Download Architecture SVG Vector"
            title="Download pure SVG vector diagram"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>SVG</span>
          </button>

          {/* Export Spec JSON */}
          <button
            onClick={handleExportSvg}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Export Architecture JSON Spec"
            title="Copy complete architecture JSON spec"
          >
            {copiedBadge ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedBadge ? 'Copied!' : 'Spec JSON'}</span>
          </button>

          {/* Chaos Resilience Mode Toggle */}
          <button
            onClick={() => setIsChaosMode(!isChaosMode)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isChaosMode
                ? 'bg-rose-500/15 border-rose-500 text-rose-400 font-bold shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            aria-label="Toggle Chaos Resilience Simulation"
            title="Simulate distributed partition failures and automated failover telemetry across all 5 paradigms"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isChaosMode ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isChaosMode ? 'Chaos Active' : 'Chaos Mode'}</span>
          </button>

          {/* Lightbox Zoom Modal Trigger */}
          <button
            onClick={() => {
              setIsLightboxOpen(true)
              setLightboxZoom(1)
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Open Fullscreen Infographic Lightbox"
            title="Open high-resolution poster in fullscreen lightbox with zoom"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Chaos Invariant Resilience Simulation Banner */}
      {isChaosMode && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-xs font-mono space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>CHAOS INJECTION TELEMETRY: 5-PARADIGM RESILIENCE ACTIVE</span>
            </div>
            <span className="text-[10px] text-rose-300/80 uppercase">Simulated Partitions & Invariant Verification</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block text-[11px]">1. Agentic AI</span>
              <span className="text-slate-400 text-[10px] leading-tight block mt-0.5">504 Gateway Timeout injected &rarr; Circuit breaker tripped &rarr; Fallback retry in 420ms</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30">
              <span className="text-cyan-400 font-bold block text-[11px]">2. LRM Reasoning</span>
              <span className="text-slate-400 text-[10px] leading-tight block mt-0.5">Token budget ceiling hit (4096 tok) &rarr; Early-exit triggered &rarr; Confirmed 98.4% score</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30">
              <span className="text-purple-400 font-bold block text-[11px]">3. Vector Database</span>
              <span className="text-slate-400 text-[10px] leading-tight block mt-0.5">Primary pgvector node failed &rarr; Read replica promoted in 65ms &rarr; Zero query drops</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30">
              <span className="text-amber-400 font-bold block text-[11px]">4. RAG Pipeline</span>
              <span className="text-slate-400 text-[10px] leading-tight block mt-0.5">Dense search p99 &gt; 800ms &rarr; Fallback to L2 Redis cache (12ms hit ratio: 94.6%)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-pink-500/30">
              <span className="text-pink-400 font-bold block text-[11px]">5. MCP Protocol</span>
              <span className="text-slate-400 text-[10px] leading-tight block mt-0.5">GitHub API HTTP 429 &rarr; Token bucket throttled &rarr; Smooth backoff buffer drain</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 1: FULL POSTER VIEW (ALL 5 SECTIONS STACKED)    */}
      {/* ========================================================= */}
      {viewMode === 'poster' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-slate-500 dark:text-slate-400 pb-2">
            <span>
              Complete high-fidelity vector recreation of the ByteByteGo architecture infographic. Click any node or step to simulate live data flows.
            </span>
            <span className="font-mono text-[11px] text-[#00a884] font-semibold shrink-0">
              [ Interactive Execution Active ]
            </span>
          </div>

          <div className="space-y-6">
            {AI_TERMS.map((term, index) => {
              return (
                <div 
                  key={term.id}
                  className={`rounded-2xl border p-4 sm:p-6 transition-all ${
                    isStudioMode
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Left Column: Concept Identity & Icon */}
                    <div className="lg:col-span-3 space-y-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm"
                          style={{ 
                            backgroundColor: isStudioMode ? '#f8fafc' : 'rgba(15, 23, 42, 0.8)',
                            borderColor: term.colorTheme.border 
                          }}
                        >
                          <term.icon 
                            className="w-6 h-6" 
                            style={{ color: term.colorTheme.accent }} 
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            0{index + 1} • {term.category}
                          </span>
                          <h4 className={`text-lg sm:text-xl font-bold font-editorial tracking-tight ${
                            isStudioMode ? 'text-slate-900' : 'text-white'
                          }`}>
                            {term.title}
                          </h4>
                        </div>
                      </div>

                      <div className="text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                        Modeled after ByteByteGo system design standards for enterprise engineering.
                      </div>

                      {/* 1-Click Copy RFC Specification */}
                      <button
                        onClick={() => handleCopyRfcSpec(term)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          copiedSpecId === term.id
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : isStudioMode
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                        title="Copy Markdown specification for Engineering RFC / PR"
                      >
                        {copiedSpecId === term.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5 text-teal-500" />}
                        <span>{copiedSpecId === term.id ? 'RFC Copied!' : 'Copy RFC Spec'}</span>
                      </button>
                    </div>

                    {/* Middle Column: The Full Illustrated Schematic with Interactive Overlays */}
                    <div 
                      className="lg:col-span-6 rounded-xl border p-3 sm:p-4 flex flex-col items-center justify-center min-h-[220px]"
                      style={{ 
                        backgroundColor: isStudioMode ? '#fcfcfc' : 'rgba(2, 6, 23, 0.7)',
                        borderColor: isStudioMode ? '#e2e8f0' : '#1e293b' 
                      }}
                    >
                      {term.id === 'agentic-ai' && (
                        <div className="w-full space-y-2">
                          <AgenticAiSchematic 
                            isStudioMode={isStudioMode} 
                            activeNode={activeAgentNode}
                            onSelectNode={setActiveAgentNode}
                          />
                          {/* Node Highlight Pill */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Node Inspector:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[320px]">
                              {activeAgentNode === 'memory' && 'Memory: Redis 7.2 cluster & PostgreSQL pgvector episodic storage'}
                              {activeAgentNode === 'tools' && 'Tools: Declarative JSON-RPC 2.0 MCP tool declarations'}
                              {activeAgentNode === 'goals' && 'Goals: User intent policy guardrails & spend ceilings'}
                              {activeAgentNode === 'agent' && 'Agent: ReAct autonomous loop with LangGraph cycle prevention'}
                              {activeAgentNode === 'actions' && 'Actions: Ephemeral Docker sandbox container execution'}
                              {activeAgentNode === 'env' && 'Environment: Target AWS EKS & Kafka streaming topology'}
                              {activeAgentNode === 'observations' && 'Observations: Perception feedback parsing exit status'}
                              {!activeAgentNode && 'Click any node to inspect runtime architecture'}
                            </span>
                          </div>
                        </div>
                      )}

                      {term.id === 'lrm' && (
                        <div className="w-full space-y-2">
                          <LargeReasoningModelSchematic 
                            isStudioMode={isStudioMode}
                            isCotTraced={isCotTraced}
                            onToggleCot={() => setIsCotTraced(!isCotTraced)}
                          />
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                            <button
                              onClick={() => setIsCotTraced(!isCotTraced)}
                              className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                            >
                              <Zap className="w-3 h-3" />
                              <span>{isCotTraced ? 'Reset CoT Trace' : 'Trace CoT Reasoning'}</span>
                            </button>
                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                              {isCotTraced ? 'Compute: 142 reasoning tokens / 38ms verified' : 'Click "Example" or "Trace" to inspect'}
                            </span>
                          </div>
                        </div>
                      )}

                      {term.id === 'vectordb' && (
                        <div className="w-full space-y-2">
                          <VectorDatabaseSchematic 
                            isStudioMode={isStudioMode}
                            selectedDataType={selectedDataType}
                            onSelectDataType={setSelectedDataType}
                          />
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Active Modality:</span>
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              {selectedDataType === 'text' && 'Text: text-embedding-3-small (1536d) • Cosine Similarity'}
                              {selectedDataType === 'image' && 'Image: CLIP ViT-L/14 (768d) • Multi-modal Contrastive'}
                              {selectedDataType === 'audio' && 'Audio: Whisper-v3 Encodings (1280d) • Acoustic Embeddings'}
                              {selectedDataType === 'video' && 'Video: VideoMAE-v2 (1024d) • Spatio-temporal Representations'}
                            </span>
                          </div>
                        </div>
                      )}

                      {term.id === 'rag' && (
                        <div className="w-full space-y-2">
                          <RagSchematic 
                            isStudioMode={isStudioMode}
                            activeStep={activeRagStep}
                            onTriggerStep={(s) => setActiveRagStep(activeRagStep === s ? null : s)}
                          />
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setActiveRagStep(activeRagStep === s ? null : s)}
                                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                                    activeRagStep === s 
                                      ? 'bg-amber-500 text-white' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[280px]">
                              {activeRagStep === 1 && '1. Query: Inbound enterprise question'}
                              {activeRagStep === 2 && '2. Search: Hybrid BM25 + pgvector HNSW'}
                              {activeRagStep === 3 && '3. Relevant text: Top-k 3 grounded chunks'}
                              {activeRagStep === 4 && '4. Synthesis: Prompt context window isolated'}
                              {activeRagStep === 5 && '5. Fact response: Emitted with citations'}
                              {!activeRagStep && 'Click steps 1-5 to trace pipeline'}
                            </span>
                          </div>
                        </div>
                      )}

                      {term.id === 'mcp' && (
                        <div className="w-full space-y-2">
                          <McpSchematic 
                            isStudioMode={isStudioMode}
                            selectedServer={selectedMcpServer}
                            onSelectServer={setSelectedMcpServer}
                          />
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Wire Payload:</span>
                            <span className="text-pink-600 dark:text-pink-400 font-semibold truncate max-w-[320px]">
                              {selectedMcpServer === 'A' && 'Server A: tools/call {"name": "github_create_issue"}'}
                              {selectedMcpServer === 'B' && 'Server B: resources/read {"uri": "postgres://audit_log"}'}
                              {selectedMcpServer === 'C' && 'Server C: tools/call {"name": "fs_read_file"}'}
                              {!selectedMcpServer && 'Click Server A, B, or C for JSON-RPC 2.0 wire payload'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Definition & Real-World Example Cards */}
                    <div className="lg:col-span-3 space-y-3">
                      {/* Definition Card */}
                      <div 
                        className="p-3.5 rounded-xl border transition-all"
                        style={{ 
                          backgroundColor: isStudioMode ? term.colorTheme.lightBadgeBg : 'rgba(6, 78, 59, 0.25)',
                          borderColor: isStudioMode ? '#cbd5e1' : term.colorTheme.border 
                        }}
                      >
                        <div 
                          className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 shadow-sm"
                          style={{
                            backgroundColor: isStudioMode ? '#ffffff' : 'rgba(16, 185, 129, 0.2)',
                            color: isStudioMode ? term.colorTheme.lightBadgeText : term.colorTheme.badgeText
                          }}
                        >
                          Definition
                        </div>
                        <p className={`text-xs sm:text-sm font-sans font-bold leading-snug ${
                          isStudioMode ? 'text-slate-800' : 'text-slate-100'
                        }`}>
                          {term.definition}
                        </p>
                      </div>

                      {/* Real-World Example Card */}
                      <div 
                        className="p-3.5 rounded-xl border transition-all"
                        style={{ 
                          backgroundColor: isStudioMode ? term.colorTheme.lightBadgeBg : 'rgba(12, 74, 110, 0.25)',
                          borderColor: isStudioMode ? '#cbd5e1' : term.colorTheme.border 
                        }}
                      >
                        <div 
                          className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 shadow-sm"
                          style={{
                            backgroundColor: isStudioMode ? '#ffffff' : 'rgba(56, 189, 248, 0.2)',
                            color: isStudioMode ? term.colorTheme.lightBadgeText : '#38bdf8'
                          }}
                        >
                          Real-world Example
                        </div>
                        <div className="space-y-1">
                          {term.realWorldExamples.map((ex, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center gap-1.5 text-xs font-mono font-bold ${
                                isStudioMode ? 'text-slate-800' : 'text-slate-200'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: term.colorTheme.accent }} />
                              <span>{ex}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Architecture Metrics Pill */}
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                        <span className="text-slate-500">Latency:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{term.technicalSpecs.latencyTarget}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: INTERACTIVE TOUR (SINGLE TERM DRILLDOWN)     */}
      {/* ========================================================= */}
      {viewMode === 'explorer' && (
        <div className="space-y-6">
          {/* Top Architecture Tabs Switcher & Tour Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {AI_TERMS.map(term => {
                const isSelected = term.id === activeTermId
                return (
                  <button
                    key={term.id}
                    onClick={() => setActiveTermId(term.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? isStudioMode
                          ? 'bg-slate-900 border-slate-950 text-white shadow font-bold'
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

            {/* Tour Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shrink-0">
              <button
                onClick={handlePrev}
                className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Previous Architecture"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2 py-0.5 rounded text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer font-bold"
                aria-label={isPlaying ? 'Pause Tour' : 'Start Tour'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Auto-Tour'}</span>
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Next Architecture"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Term Card with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTerm.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl border p-4 sm:p-7 transition-all ${
                isStudioMode
                  ? 'bg-white border-slate-200 shadow-md'
                  : 'bg-slate-950/80 border-slate-800/90'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Column 1: Identity */}
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
                    <h4 className={`text-xl sm:text-2xl font-bold font-editorial tracking-tight ${
                      isStudioMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      {activeTerm.title}
                    </h4>
                  </div>

                  {/* Technical Specs Box */}
                  <div 
                    className="p-3 rounded-xl border text-[11px] font-mono space-y-1.5"
                    style={{
                      backgroundColor: isStudioMode ? '#f8fafc' : 'rgba(15, 23, 42, 0.6)',
                      borderColor: isStudioMode ? '#e2e8f0' : '#1e293b'
                    }}
                  >
                    <div className="flex justify-between" style={{ color: isStudioMode ? '#64748b' : '#94a3b8' }}>
                      <span>Protocol:</span>
                      <span className="truncate max-w-[130px] font-bold" style={{ color: isStudioMode ? '#0f172a' : '#e2e8f0' }}>{activeTerm.technicalSpecs.protocol}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: isStudioMode ? '#64748b' : '#94a3b8' }}>
                      <span>Latency:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeTerm.technicalSpecs.latencyTarget}</span>
                    </div>
                    <div className="pt-1 border-t text-[10px]" style={{ borderColor: isStudioMode ? '#e2e8f0' : '#1e293b' }}>
                      <span style={{ color: isStudioMode ? '#94a3b8' : '#64748b' }}>Stack: </span>
                      <span style={{ color: isStudioMode ? '#0f172a' : '#cbd5e1' }}>{activeTerm.technicalSpecs.productionStack}</span>
                    </div>
                  </div>

                  {/* 1-Click Copy RFC Spec */}
                  <button
                    onClick={() => handleCopyRfcSpec(activeTerm)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      copiedSpecId === activeTerm.id
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : isStudioMode
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {copiedSpecId === activeTerm.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5 text-teal-500" />}
                    <span>{copiedSpecId === activeTerm.id ? 'RFC Spec Copied!' : 'Copy RFC Spec'}</span>
                  </button>
                </div>

                {/* Column 2: Schematic */}
                <div 
                  className="lg:col-span-6 rounded-xl border p-4 flex flex-col items-center justify-center min-h-[240px]" 
                  style={{ 
                    backgroundColor: isStudioMode ? '#f8fafc' : 'rgba(2, 6, 23, 0.6)',
                    borderColor: isStudioMode ? '#e2e8f0' : '#1e293b' 
                  }}
                >
                  {activeTerm.id === 'agentic-ai' && (
                    <AgenticAiSchematic 
                      isStudioMode={isStudioMode} 
                      activeNode={activeAgentNode}
                      onSelectNode={setActiveAgentNode}
                    />
                  )}
                  {activeTerm.id === 'lrm' && (
                    <LargeReasoningModelSchematic 
                      isStudioMode={isStudioMode}
                      isCotTraced={isCotTraced}
                      onToggleCot={() => setIsCotTraced(!isCotTraced)}
                    />
                  )}
                  {activeTerm.id === 'vectordb' && (
                    <VectorDatabaseSchematic 
                      isStudioMode={isStudioMode}
                      selectedDataType={selectedDataType}
                      onSelectDataType={setSelectedDataType}
                    />
                  )}
                  {activeTerm.id === 'rag' && (
                    <RagSchematic 
                      isStudioMode={isStudioMode}
                      activeStep={activeRagStep}
                      onTriggerStep={(s) => setActiveRagStep(activeRagStep === s ? null : s)}
                    />
                  )}
                  {activeTerm.id === 'mcp' && (
                    <McpSchematic 
                      isStudioMode={isStudioMode}
                      selectedServer={selectedMcpServer}
                      onSelectServer={setSelectedMcpServer}
                    />
                  )}
                </div>

                {/* Column 3: Definitions */}
                <div className="lg:col-span-3 space-y-4">
                  <div 
                    className="p-3.5 rounded-xl border transition-all"
                    style={{ 
                      backgroundColor: isStudioMode ? activeTerm.colorTheme.lightBadgeBg : 'rgba(6, 78, 59, 0.25)',
                      borderColor: isStudioMode ? '#cbd5e1' : activeTerm.colorTheme.border 
                    }}
                  >
                    <div 
                      className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 shadow-sm"
                      style={{
                        backgroundColor: isStudioMode ? '#ffffff' : 'rgba(16, 185, 129, 0.2)',
                        color: isStudioMode ? activeTerm.colorTheme.lightBadgeText : activeTerm.colorTheme.badgeText
                      }}
                    >
                      Definition
                    </div>
                    <p className={`text-xs sm:text-sm font-sans font-bold leading-snug ${
                      isStudioMode ? 'text-slate-800' : 'text-slate-100'
                    }`}>
                      {activeTerm.definition}
                    </p>
                  </div>

                  <div 
                    className="p-3.5 rounded-xl border transition-all"
                    style={{ 
                      backgroundColor: isStudioMode ? activeTerm.colorTheme.lightBadgeBg : 'rgba(12, 74, 110, 0.25)',
                      borderColor: isStudioMode ? '#cbd5e1' : activeTerm.colorTheme.border 
                    }}
                  >
                    <div 
                      className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase mb-1.5 shadow-sm"
                      style={{
                        backgroundColor: isStudioMode ? '#ffffff' : 'rgba(56, 189, 248, 0.2)',
                        color: isStudioMode ? activeTerm.colorTheme.lightBadgeText : '#38bdf8'
                      }}
                    >
                      Real-world Example
                    </div>
                    <div className="space-y-1">
                      {activeTerm.realWorldExamples.map((ex, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-1.5 text-xs font-mono font-bold ${
                            isStudioMode ? 'text-slate-800' : 'text-slate-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTerm.colorTheme.accent }} />
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 3: ORIGINAL BYTEBYTEGO REFERENCE POSTER         */}
      {/* ========================================================= */}
      {viewMode === 'reference' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold font-editorial text-slate-900 dark:text-white">
                  Original ByteByteGo High-Resolution Reference
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Official LinkedIn publication image: &quot;AI Terms You Need to Know&quot; by ByteByteGo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href="/architecture/bytebytego-ai-terms-reference.jpg"
                download="ByteByteGo-AI-Terms-Reference.jpg"
                className="px-3 py-1.5 rounded-lg bg-[#00a884] text-white text-xs font-mono font-bold hover:bg-[#008f70] transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (1.4 MB)</span>
              </a>

              <a 
                href="https://lnkd.in/p/gNwNfXKp" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <span>LinkedIn Post</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* High-Resolution Infographic Display */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white flex justify-center p-2 sm:p-4">
            <img 
              src="/architecture/bytebytego-ai-terms-reference.jpg" 
              alt="ByteByteGo AI Terms You Need to Know - Official High-Res Infographic" 
              className="w-full max-w-4xl h-auto rounded-xl object-contain shadow"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL: FULLSCREEN HIGH-RES INFOGRAPHIC INSPECTOR */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="ByteByteGo AI Terms Infographic Fullscreen Lightbox"
          >
            {/* Lightbox Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-6 rounded-full bg-[#00a884]" />
                <span className="text-white font-bold text-sm">ByteByteGo AI Terms Reference (High Resolution)</span>
                <span className="text-slate-400 hidden sm:inline">• Zoom: {Math.round(lightboxZoom * 100)}%</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom In */}
                <button
                  onClick={() => setLightboxZoom(prev => Math.min(2.5, prev + 0.25))}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                  aria-label="Zoom In"
                  title="Zoom In (+25%)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Zoom Out */}
                <button
                  onClick={() => setLightboxZoom(prev => Math.max(0.5, prev - 0.25))}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                  aria-label="Zoom Out"
                  title="Zoom Out (-25%)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Reset Zoom */}
                <button
                  onClick={() => setLightboxZoom(1)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                  aria-label="Reset Zoom"
                >
                  100%
                </button>

                {/* Direct Download */}
                <a
                  href="/architecture/bytebytego-ai-terms-reference.jpg"
                  download="ByteByteGo-AI-Terms-Reference.jpg"
                  className="px-3 py-1.5 rounded-lg bg-[#00a884] hover:bg-[#008f70] text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Close Modal */}
                <button
                  onClick={() => {
                    setIsLightboxOpen(false)
                    setLightboxZoom(1)
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-white border border-slate-700 cursor-pointer ml-2"
                  aria-label="Close Lightbox"
                  title="Close (Escape)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Container (Scrollable & Zoomable) */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4">
              <div 
                style={{ transform: `scale(${lightboxZoom})`, transformOrigin: 'center center' }} 
                className="transition-transform duration-200 max-w-full"
              >
                <img
                  src="/architecture/bytebytego-ai-terms-reference.jpg"
                  alt="ByteByteGo AI Terms You Need to Know Reference Poster"
                  className="max-h-[82vh] w-auto rounded-xl shadow-2xl object-contain border border-slate-800"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
