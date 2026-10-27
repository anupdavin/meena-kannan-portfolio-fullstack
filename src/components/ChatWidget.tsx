import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  Bot, 
  ChevronRight
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  url?: string
  timestamp: Date
}

interface ChatDoc {
  id: string
  title: string
  text: string
  url?: string
}

const QUICK_QUESTIONS = [
  "What is Meena's primary tech stack?",
  "Explain Meena's AI architecture & MCP codex",
  "How does Meena evaluate architecture trade-offs (e.g. Saga vs 2PC)?",
  "What are Meena's Architectural Decision Records (ADR)?",
  "Tell me about the Enterprise SaaS project",
  "Is Meena open to remote engineering roles?",
  "What are Meena's cloud & DevOps skills?",
  "How can I contact Meena?"
]

const FAQ_MAP: Record<string, { answer: string; url?: string }> = {
  'who is she': {
    answer: "Meena Kannan is a Senior Full-Stack Software Engineer & Solutions Architect with 8+ years of experience specializing in Java 21, Spring Boot 3, React 19, Microservices, and Cloud-Native systems.",
    url: "#about"
  },
  'skills': {
    answer: "Meena's core stack includes Java 21, Spring Boot 3, Spring Security, React 19, TypeScript, PostgreSQL, Redis, Apache Kafka, AWS, Docker, Kubernetes, and Clean Architecture / DDD.",
    url: "#skills"
  },
  'ai': {
    answer: "Meena specializes in modern AI architectures: Agentic AI workflows with autonomous goal decomposition, Large Reasoning Models (LRMs) utilizing deliberate test-time compute, pgvector similarity indexing, production RAG with hybrid BM25 lexical ranking, and Model Context Protocol (MCP) server design. Explore the interactive ByteByteGo AI Architecture Codex in the Architecture section.",
    url: "#architecture"
  },
  'mcp': {
    answer: "Model Context Protocol (MCP) is an open standard that decouples AI models from system tools and data sources. Meena implements enterprise MCP servers in Java 21 LTS with JSON-RPC over stdio and SSE transports, exposing secure database topology queries, Kafka consumer lag telemetry, and chaos simulation tools.",
    url: "#architecture"
  },
  'adr': {
    answer: "Meena documents engineering trade-offs using formal Architectural Decision Records (ADRs). Her ledger includes ADR-001 (Choreographed Saga), ADR-002 (Transactional Outbox CDC), ADR-003 (Java 21 Virtual Threads), ADR-004 (L1 Caffeine + L2 Redis Caching), ADR-005 (Zero-Trust Envoy mTLS), and ADR-006 (Model Context Protocol). Inspect them in the interactive ADR Explorer in the Architecture Lab.",
    url: "#architecture-adr-ledger"
  },
  'tradeoffs': {
    answer: "Meena evaluates distributed architecture tradeoffs across four core domains in the System Design Decision Matrix: (1) Choreographed Saga vs Orchestrated Saga vs 2PC, (2) Hybrid RAG vs Domain Fine-Tuning vs Prompt Caching, (3) Java 21 Virtual Threads vs Reactive WebFlux vs OS Thread Pools, and (4) gRPC vs REST vs Model Context Protocol (MCP). Inspect full criteria scores and production verdicts in the Architecture Lab.",
    url: "#architecture-tradeoff-matrix"
  },
  'saga': {
    answer: "Meena implements Choreographed Saga transactions using Kafka event streaming and compensating transactions. When payment or inventory steps fail, automated rollback events restore ledger consistency without blocking distributed 2PC locks.",
    url: "#architecture"
  },
  'saas': {
    answer: "Meena built the Meena Kannan Enterprise SaaS Platform: a multi-tenant portfolio & project management SaaS with Clean Architecture, Spring Boot 3, PostgreSQL, Redis caching, and Docker (99.99% SLA).",
    url: "#projects"
  },
  'available': {
    answer: "Yes! Meena is actively OPEN to new opportunities, including full-time Senior/Lead Software Engineering roles, cloud architecture contracts, and system modernization consulting. She can start within 2-3 weeks.",
    url: "#contact"
  },
  'remote': {
    answer: "Yes, Meena is fully remote-ready with proven global collaboration experience. Based in Singapore/India (GMT+8 / GMT+5:30), she maintains 4+ hours of overlap with US and European timezones.",
    url: "#contact"
  },
  'contact': {
    answer: "You can reach Meena via email at meenakannan.dev@gmail.com, on LinkedIn (linkedin.com/in/meena-kannan), or through the contact form on this page. All inquiries receive a response within 24 hours.",
    url: "#contact"
  },
  'projects': {
    answer: "Meena's featured projects include: (1) Enterprise SaaS Platform (Spring Boot 3 + React 19), (2) Distributed E-Commerce Microservices (10K+ RPS with Kafka), (3) Real-Time Collaboration Engine (50K+ WebSockets), and (4) FinTech Payment Gateway ($10M+ daily volume).",
    url: "#projects"
  },
  'experience': {
    answer: "Meena has 8+ years of enterprise engineering leadership experience, delivering 40+ production systems, cutting cloud costs by 40%, and designing architectures with 99.99% uptime.",
    url: "#experience"
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Meena's Portfolio AI Assistant. Ask me about her enterprise software experience, tech stack, microservices architecture, or project availability!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [docs, setDocs] = useState<ChatDoc[]>([])
  const chatBodyRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch('/chat/index.json')
      .then(r => r.json())
      .then(d => setDocs(d))
      .catch(() => {})
  }, [])

  // Lock body scroll on small mobile screens when chat is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close chat on Escape key press (Accessibility / Keyboard Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
      }
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [messages, isOpen])

  const findAnswer = (query: string): { text: string; url?: string } => {
    const q = query.toLowerCase()

    // 1. Keyword check in FAQ
    if (q.includes('mcp') || q.includes('model context protocol')) {
      return { text: FAQ_MAP.mcp.answer, url: FAQ_MAP.mcp.url }
    }
    if (q.includes('agent') || q.includes('rag') || q.includes('vector') || q.includes('lrm') || q.includes('bytebytego') || q.includes('codex') || q.includes('ai systems') || q.includes('artificial intelligence') || /\bai\b/.test(q)) {
      return { text: FAQ_MAP.ai.answer, url: FAQ_MAP.ai.url }
    }
    if (q.includes('tradeoff') || q.includes('compare') || q.includes('2pc') || q.includes('threads vs reactive')) {
      return { text: FAQ_MAP.tradeoffs.answer, url: FAQ_MAP.tradeoffs.url }
    }
    if (q.includes('adr') || q.includes('decision')) {
      return { text: FAQ_MAP.adr.answer, url: FAQ_MAP.adr.url }
    }
    if (q.includes('saga') || q.includes('outbox') || q.includes('cdc') || q.includes('compensat')) {
      return { text: FAQ_MAP.saga.answer, url: FAQ_MAP.saga.url }
    }
    if (q.includes('skill') || q.includes('stack') || q.includes('technolog')) {
      return { text: FAQ_MAP.skills.answer, url: FAQ_MAP.skills.url }
    }
    if (q.includes('saas') || q.includes('platform')) {
      return { text: FAQ_MAP.saas.answer, url: FAQ_MAP.saas.url }
    }
    if (q.includes('availab') || q.includes('hire') || q.includes('contract') || q.includes('job')) {
      return { text: FAQ_MAP.available.answer, url: FAQ_MAP.available.url }
    }
    if (q.includes('remote') || q.includes('timezone') || q.includes('location') || q.includes('where')) {
      return { text: FAQ_MAP.remote.answer, url: FAQ_MAP.remote.url }
    }
    if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('message')) {
      return { text: FAQ_MAP.contact.answer, url: FAQ_MAP.contact.url }
    }
    if (q.includes('project') || q.includes('portfolio') || q.includes('work') || q.includes('built')) {
      return { text: FAQ_MAP.projects.answer, url: FAQ_MAP.projects.url }
    }
    if (q.includes('experience') || q.includes('year') || q.includes('background') || q.includes('who')) {
      return { text: FAQ_MAP['who is she'].answer, url: FAQ_MAP['who is she'].url }
    }

    // 2. Search loaded docs
    if (docs.length > 0) {
      const match = docs.find(d => 
        q.split(' ').some(w => w.length > 3 && (d.title.toLowerCase().includes(w) || d.text.toLowerCase().includes(w)))
      )
      if (match) {
        return { text: match.text, url: match.url }
      }
    }

    // 3. Fallback
    return {
      text: "Meena Kannan is a Senior Full-Stack Cloud & Software Architect with 8+ years of experience in Java 21, Spring Boot 3, React 19, and Microservices. Feel free to explore the sections above or inquire in the contact section!",
      url: "#contact"
    }
  }

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const { text, url } = findAnswer(query)
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        url,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  return (
    <>
      {/* Floating Launcher Button (Hidden on mobile when chat sheet is open to prevent overlapping the input/send buttons) */}
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${isOpen ? 'hidden sm:block' : 'block'}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close AI chat assistant' : 'Open AI chat assistant'}
          className="relative flex items-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold shadow-2xl shadow-emerald-500/25 glow-border cursor-pointer transition-all active:scale-95 min-h-[46px]"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-slate-950" />
          ) : (
            <>
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
              </div>
              <Bot className="w-5 h-5" />
              <span className="text-xs tracking-wider hidden sm:inline">MeenaBot AI</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal Panel / Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="sm:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overscroll-contain"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Portfolio AI Assistant"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-0 bottom-0 sm:bottom-22 sm:right-6 sm:inset-x-auto w-full sm:w-[420px] h-[85dvh] sm:h-[550px] sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl bg-[#090e18]/98 border border-emerald-500/30 shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden font-mono text-xs pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] overscroll-contain"
            >
              {/* Mobile Sheet Drag Handle Indicator */}
              <div className="sm:hidden w-12 h-1 rounded-full bg-slate-700/80 mx-auto mt-2 mb-0.5 shrink-0" />

              {/* Header */}
              <div className="px-4 py-3 bg-[#0d1424] border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>MeenaBot AI</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400">Portfolio & Architecture Assistant</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat window"
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Body */}
              <div ref={chatBodyRef} className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 touch-scroll overscroll-contain">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-xl max-w-[85%] sm:max-w-[82%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-500 text-slate-950 font-semibold'
                          : 'bg-[#0d1527] border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div>{msg.content}</div>

                      {msg.url && (
                        <a
                          href={msg.url}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
                        >
                          <span>Jump to Section</span>
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 items-center text-slate-400 text-[11px] p-2 bg-[#0d1527] rounded-lg w-fit border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-emerald-400">Synthesizing reply...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Chips */}
              <div className="px-3 py-2 bg-[#070b14] border-t border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
                {QUICK_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-[10px] sm:text-[11px] transition-colors shrink-0 cursor-pointer active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="p-3 bg-[#0d1424] border-t border-slate-800 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Ask Meena's AI Assistant"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Meena's experience, stack, or projects..."
                  className="flex-1 bg-[#060a12] border border-slate-700/80 text-emerald-100 placeholder:text-slate-500 px-3 py-2.5 rounded-lg text-base sm:text-xs outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="p-2 sm:p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
