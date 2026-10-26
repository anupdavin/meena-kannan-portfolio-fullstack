import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Linkedin, 
  Github, 
  Terminal, 
  Clock, 
  CheckCircle, 
  Globe, 
  Send, 
  Check, 
  Copy,
  Briefcase,
  Building,
  ShieldCheck,
  ExternalLink,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Dynamic email assembly to protect against Cloudflare mailto: scraper rewrites
const EMAIL_USER = 'meenakannan.dev'
const EMAIL_DOMAIN = 'gmail.com'
const getDynamicEmail = () => `${EMAIL_USER}@${EMAIL_DOMAIN}`

const ENGAGEMENT_TYPES = [
  'Full-Stack Architecture',
  'Cloud Migration',
  'Technical Advisory',
  'Full-Time / Contract'
] as const

type EngagementType = typeof ENGAGEMENT_TYPES[number]

export default function ContactTerminal() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [mobileTab, setMobileTab] = useState<'inquiry' | 'terminal'>('inquiry')
  
  // B2B Inquiry Form State
  const [nameAndCompany, setNameAndCompany] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [engagementType, setEngagementType] = useState<EngagementType>('Full-Stack Architecture')
  const [projectBrief, setProjectBrief] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Toast state
  const [showCopyToast, setShowCopyToast] = useState(false)

  const resolvedEmail = useMemo(() => getDynamicEmail(), [])

  const terminalScript = useMemo(() => [
    'meena@portfolio:~$ contact --info --verbose',
    `> Direct Channel: ${resolvedEmail}`,
    '> LinkedIn: linkedin.com/in/meena-kannan',
    '> GitHub: github.com/meenak95',
    '> Location: Remote Worldwide (Singapore / India with US/EU timezone overlap)',
    '',
    'meena@portfolio:~$ availability --status',
    '> Current Status: OPEN to Enterprise Architecture & Advisory Roles',
    '> Capacity: Senior/Lead Architect OR high-impact B2B consulting engagements',
    '> Onboarding SLA: Available within 2-3 weeks',
    '',
    'meena@portfolio:~$ architecture --core-pillars',
    '> 1. Monolith to Distributed Microservices Decomposition (Kafka + Saga)',
    '> 2. Full-Stack Enterprise SaaS Architecture (Spring Boot 3 + React 19)',
    '> 3. High-Concurrency Backend Tuning & Virtual Threads (Java 21)',
    '> 4. Cloud Infrastructure Modernization (AWS EKS / Terraform)',
    '',
    'meena@portfolio:~$ sla --response-guarantee',
    '> Response Window: All business & architecture inquiries answered within 24 hours',
    'meena@portfolio:~$ _'
  ], [resolvedEmail])

  useEffect(() => {
    if (currentLine < terminalScript.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, terminalScript[currentLine]])
        setCurrentLine(prev => prev + 1)
      }, currentLine === 0 ? 400 : 120)
      return () => clearTimeout(timer)
    }
  }, [currentLine, terminalScript])

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(resolvedEmail)
    setShowCopyToast(true)
    setTimeout(() => {
      setShowCopyToast(false)
    }, 3000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Build client mailto URL dynamically without exposing raw static markup
    const subject = encodeURIComponent(
      `[B2B Architecture Inquiry] ${engagementType}: ${nameAndCompany}`
    )
    const body = encodeURIComponent(
      `Hi Meena,\n\n` +
      `Name / Company: ${nameAndCompany}\n` +
      `Contact Email: ${contactEmail}\n` +
      `Engagement Type: ${engagementType}\n\n` +
      `--- Project Brief & Scope ---\n${projectBrief}\n\n` +
      `---\nDispatched via meenakannan.dev B2B Inquiry Portal`
    )
    const dynamicMailto = `mailto:${resolvedEmail}?subject=${subject}&body=${body}`

    // Trigger user mail client
    window.location.href = dynamicMailto

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setNameAndCompany('')
      setContactEmail('')
      setEngagementType('Full-Stack Architecture')
      setProjectBrief('')
    }, 600)
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Toast Notification for One-Click Email Copy */}
      <AnimatePresence>
        {showCopyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 p-3 sm:p-4 rounded-xl bg-slate-900 border border-emerald-500/80 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-slate-100"
            role="status"
            aria-live="polite"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                Copied to clipboard!
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                {resolvedEmail}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/50 mb-3 shadow-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ ./contact_gateway.sh --b2b-consulting</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-editorial">
          Consultation & Strategic Engagements
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 sm:mt-3 font-sans text-xs sm:text-sm md:text-base leading-relaxed">
          Available for senior architecture leadership, cloud migrations, monolith-to-microservices decomposition, and full-stack enterprise systems advisory.
        </p>

        {/* Value badges strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-emerald-400">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>&lt;24h Response SLA</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-cyan-400">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Remote Worldwide</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Open for Hire & Advisory</span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6 max-w-sm mx-auto">
        <button
          onClick={() => setMobileTab('inquiry')}
          className={`flex-1 py-2.5 px-3 text-xs font-mono font-bold rounded-lg transition-all min-h-[42px] cursor-pointer active:scale-95 ${
            mobileTab === 'inquiry'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Show B2B Architecture Inquiry Form"
        >
          B2B Inquiry Card
        </button>
        <button
          onClick={() => setMobileTab('terminal')}
          className={`flex-1 py-2.5 px-3 text-xs font-mono font-bold rounded-lg transition-all min-h-[42px] cursor-pointer active:scale-95 ${
            mobileTab === 'terminal'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Show Terminal Specifications"
        >
          Terminal Info
        </button>
      </div>

      {/* Main Grid: Left Daemon Terminal + Right B2B Inquiry Card */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Live Terminal Printout & Direct Copy Action */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className={`lg:col-span-5 rounded-2xl overflow-hidden border border-slate-800/90 bg-[#040912]/95 shadow-xl backdrop-blur-md min-w-0 w-full ${
            mobileTab === 'inquiry' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#081120] border-b border-slate-800">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs font-mono text-slate-400">
                daemon://advisory-spec
              </span>
            </div>

            {/* Direct Copy Button */}
            <button 
              onClick={copyEmailToClipboard}
              aria-label="Copy Email Address to Clipboard"
              className="text-[10px] sm:text-xs font-mono text-emerald-400 hover:text-white flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Email</span>
            </button>
          </div>

          {/* Terminal Screen Output */}
          <div className="p-3.5 sm:p-5 font-mono text-[11px] sm:text-xs text-slate-300 min-h-[260px] sm:min-h-[380px] max-h-[480px] overflow-y-auto leading-relaxed space-y-1.5 touch-scroll overscroll-contain">
            {displayedLines.map((rawLine, idx) => {
              const line = typeof rawLine === 'string' ? rawLine : ''
              return (
                <div key={idx} className={line.startsWith('meena@') ? 'text-cyan-400 font-semibold' : 'text-slate-300'}>
                  {line}
                </div>
              )
            })}
          </div>

          {/* Social Links & One-Click Contact Footer */}
          <div className="p-3.5 sm:p-4 bg-[#060c18] border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Direct Professional Channels:</span>
              <button
                onClick={copyEmailToClipboard}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-mono cursor-pointer underline flex items-center gap-1"
              >
                <span>{resolvedEmail}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a 
                href="https://www.linkedin.com/in/meena-kannan" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Visit Meena Kannan on LinkedIn"
                className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Linkedin className="w-4 h-4 text-cyan-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-cyan-400/70 ml-auto" />
              </a>

              <a 
                href="https://github.com/meenak95" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Visit Meena Kannan on GitHub"
                className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <Github className="w-4 h-4 text-purple-400" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-purple-400/70 ml-auto" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a 
                href={`mailto:${resolvedEmail}`}
                aria-label="Send direct email to Meena Kannan"
                className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Direct Mail</span>
                <ExternalLink className="w-3 h-3 text-emerald-400/70 ml-auto" />
              </a>

              <a 
                href="/Meena_Kannan_Senior_Architect_Resume.pdf"
                download="Meena_Kannan_Senior_Architect_Resume.pdf"
                target="_blank" 
                rel="noreferrer"
                aria-label="Download Executive CV PDF"
                className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Resume (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400/70 ml-auto" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right Column: B2B Consulting & Architecture Inquiry Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className={`lg:col-span-7 rounded-2xl bg-[#090e18]/95 border border-slate-800 p-5 sm:p-7 md:p-8 shadow-2xl backdrop-blur-md min-w-0 w-full specular-card ${
            mobileTab === 'terminal' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Inquiry Header */}
          <div className="pb-4 sm:pb-5 border-b border-slate-800 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>B2B Consulting & Architecture Inquiry</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white">
              Request an Architecture Assessment or Retainer
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1 leading-relaxed">
              Submit your system specifications, cloud migration roadmap, or squad leadership goals. All submissions receive an architectural reply within 24 hours.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-editorial text-white">Inquiry Payload Dispatched</h4>
              <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-md mx-auto leading-relaxed">
                Thank you for your interest! Your email client has been prepared with your architecture brief. Meena will analyze your requirements and follow up within 24 hours.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSubmitted(false)}
                className="mt-3 text-xs font-mono border-slate-700 text-slate-300"
              >
                Send Another Inquiry
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name / Company and Email */}
              <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="inquiry-name" className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Name / Company *</span>
                  </label>
                  <Input 
                    id="inquiry-name"
                    required 
                    placeholder="e.g. David Lin / FinTech Scale Corp"
                    value={nameAndCompany}
                    onChange={(e) => setNameAndCompany(e.target.value)}
                    className="bg-[#050811] border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inquiry-email" className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Direct Email *</span>
                  </label>
                  <Input 
                    id="inquiry-email"
                    type="email" 
                    required 
                    placeholder="david.lin@fintech.io"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-[#050811] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Engagement Type Selector */}
              <div className="space-y-1.5" role="radiogroup" aria-labelledby="engagement-type-label">
                <span id="engagement-type-label" className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>Engagement Type *</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ENGAGEMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      onClick={() => setEngagementType(type)}
                      className={`p-2 rounded-xl text-left text-[11px] font-mono transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#090e18] ${
                        engagementType === type
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-sm'
                          : 'bg-[#050811] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                      aria-checked={engagementType === type}
                    >
                      <div className="truncate">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Brief */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="inquiry-brief" className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Project Brief & Architectural Requirements *</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">Confidentiality Assured</span>
                </div>
                <Textarea 
                  id="inquiry-brief"
                  required 
                  rows={4}
                  placeholder="Detail your system bottlenecks, tech stack (e.g. Java 21, Spring Boot, React, Kafka, AWS), target scale/RPS, timeline, or leadership scope..."
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  className="bg-[#050811] border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-400 text-xs sm:text-sm font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={copyEmailToClipboard}
                  className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-800 bg-slate-900/60 cursor-pointer"
                  aria-label="Copy Meena Kannan's email address"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Direct Email</span>
                </button>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="min-h-[46px] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer text-xs sm:text-sm font-mono"
                  aria-label="Dispatch Architecture Inquiry"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Preparing Dispatch...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Dispatch Architecture Inquiry</span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Direct channels bottom strip */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
              <a
                href={`mailto:${resolvedEmail}`}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                aria-label="Direct Email"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{resolvedEmail}</span>
              </a>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <a
                href="/Meena_Kannan_Senior_Architect_Resume.pdf"
                download="Meena_Kannan_Senior_Architect_Resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
                aria-label="Download Executive CV PDF"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                <span>Resume (PDF)</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.linkedin.com/in/meena-kannan" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                <span>linkedin.com/in/meena-kannan</span>
              </a>
              <a 
                href="https://github.com/meenak95" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-purple-400 transition-colors flex items-center gap-1"
                aria-label="GitHub Profile"
              >
                <Github className="w-3.5 h-3.5 text-purple-400" />
                <span>github.com/meenak95</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
