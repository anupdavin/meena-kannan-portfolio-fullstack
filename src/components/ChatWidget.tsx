import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Clock, 
  Terminal, 
  ExternalLink,
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
  "Tell me about the Enterprise SaaS project",
  "Is Meena open to remote engineering roles?",
  "What are Meena's cloud & DevOps skills?",
  "How can I contact Meena?"
]

const FAQ_MAP: Record<string, { answer: string; url?: string }> = {
  'who is she': {
    answer: "Meena Kannan is a Senior Full-Stack Software Engineer & Solutions Architect with 7+ years of experience specializing in Java 21, Spring Boot 3, React 19, Microservices, and Cloud-Native systems.",
    url: "#about"
  },
  'skills': {
    answer: "Meena's core stack includes Java 21, Spring Boot 3, Spring Security, React 19, TypeScript, PostgreSQL, Redis, Apache Kafka, AWS, Docker, Kubernetes, and Clean Architecture / DDD.",
    url: "#skills"
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
    answer: "Meena has 7+ years of enterprise engineering experience, delivering 40+ production systems, cutting cloud costs by 40%, and designing architectures with 99.99% uptime.",
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch('/chat/index.json')
      .then(r => r.json())
      .then(d => setDocs(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  const findAnswer = (query: string): { text: string; url?: string } => {
    const q = query.toLowerCase()

    // 1. Keyword check in FAQ
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
      text: "Meena Kannan is a Senior Full-Stack Cloud & Software Architect with 7+ years of experience in Java 21, Spring Boot 3, React 19, and Microservices. Feel free to explore the sections above or email her at meenakannan.dev@gmail.com!",
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
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-mono font-bold shadow-2xl shadow-green-500/30 glow-border cursor-pointer transition-all"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-black" />
          ) : (
            <>
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
              </div>
              <Bot className="w-5 h-5" />
              <span className="text-xs tracking-wider hidden sm:inline">MeenaBot AI</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-22 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[550px] max-h-[80vh] rounded-2xl bg-[#030a05]/95 border border-green-500/40 shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden font-mono text-xs"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#06160b] border-b border-green-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>MeenaBot AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-gray-400">Portfolio & Architecture Assistant</span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-green-500/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-green-500 text-black font-semibold'
                        : 'bg-[#06150b] border border-green-500/25 text-gray-200'
                    }`}
                  >
                    <div>{msg.content}</div>

                    {msg.url && (
                      <a
                        href={msg.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] text-green-400 hover:text-green-300 underline font-semibold"
                      >
                        <span>Jump to Section</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-center text-gray-400 text-[11px] p-2 bg-[#06150b] rounded-lg w-fit border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-green-400">Synthesizing reply...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Chips */}
            <div className="px-3 py-2 bg-[#040e07] border-t border-green-500/15 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-full bg-black/60 border border-green-500/25 hover:border-green-400 text-gray-300 hover:text-green-300 text-[10px] transition-colors shrink-0 cursor-pointer"
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
              className="p-3 bg-[#06160b] border-t border-green-500/20 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Meena's experience, stack, or projects..."
                className="flex-1 bg-[#030905] border border-green-500/30 text-green-100 placeholder:text-gray-600 px-3 py-2 rounded-lg text-xs outline-none focus:border-green-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-green-500 hover:bg-green-400 text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
