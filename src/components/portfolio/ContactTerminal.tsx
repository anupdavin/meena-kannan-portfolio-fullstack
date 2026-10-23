import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Linkedin, 
  Github, 
  Terminal, 
  Clock, 
  CheckCircle, 
  Globe, 
  Send, 
  Sparkles,
  Calendar,
  Check,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const terminalScript = [
  'meena@portfolio:~$ contact --info --verbose',
  '> Email: meenakannan.dev@gmail.com',
  '> LinkedIn: linkedin.com/in/meena-kannan',
  '> GitHub: github.com/meenak95',
  '> Location: Remote / Global (Singapore / India timezone with US/EU overlap)',
  '',
  'meena@portfolio:~$ availability --status',
  '> Current Status: OPEN to new opportunities & consulting engagements',
  '> Capacity: Full-time Senior/Lead Architect OR high-impact advisory contracts',
  '> Onboarding Window: Available within 2-3 weeks',
  '',
  'meena@portfolio:~$ engagement --models',
  '> 1. Full-Stack SaaS Architecture & End-to-End Build',
  '> 2. Monolith to Distributed Microservices Migration',
  '> 3. High-Concurrency Backend Tuning (Java 21 / Spring Boot 3 / Kafka)',
  '> 4. Cloud Infrastructure & CI/CD Modernization (AWS / Kubernetes)',
  '',
  'meena@portfolio:~$ sla --response-time',
  '> Guarantee: All business inquiries receive a tailored reply within 24 hours',
  'meena@portfolio:~$ _'
]

export default function ContactTerminal() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: 'Full-Stack Enterprise SaaS',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  useEffect(() => {
    if (currentLine < terminalScript.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, terminalScript[currentLine]])
        setCurrentLine(prev => prev + 1)
      }, currentLine === 0 ? 500 : 150)
      return () => clearTimeout(timer)
    }
  }, [currentLine])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        company: '',
        projectType: 'Full-Stack Enterprise SaaS',
        message: ''
      })
    }, 1200)
  }

  const copyEmail = () => {
    navigator.clipboard.writeText('meenakannan.dev@gmail.com')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-green-400 bg-green-950/40 px-3 py-1 rounded-full border border-green-800/50 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ ./contact_me.sh --secure-dispatch</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white glow-text tracking-tight font-mono">
          Initialize Contact & Collaborate
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mt-3 font-mono text-sm md:text-base">
          Ready to scale your enterprise architecture, build a modern full-stack SaaS, or optimize cloud infrastructure?
        </p>

        {/* Value badges strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-xs font-mono text-green-400">
            <Clock className="w-4 h-4" />
            <span>&lt;24h Response SLA</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Globe className="w-4 h-4" />
            <span>Remote Worldwide</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
            <CheckCircle className="w-4 h-4" />
            <span>Available for Hire</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Terminal Info (Left) + Contact Form (Right) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Terminal Printout */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="lg:col-span-6 rounded-2xl overflow-hidden border border-green-500/30 bg-[#030a05]/95 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#06160b] border-b border-green-500/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-400">
                daemon://dispatch-service
              </span>
            </div>
            <button 
              onClick={copyEmail}
              className="text-xs font-mono text-green-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
            </button>
          </div>

          <div className="p-5 font-mono text-xs sm:text-sm text-green-300 min-h-[360px] max-h-[460px] overflow-y-auto leading-relaxed space-y-1">
            {displayedLines.map((line, idx) => (
              <div key={idx} className={line.startsWith('meena@') ? 'text-cyan-400 font-semibold' : 'text-gray-300'}>
                {line}
              </div>
            ))}
          </div>

          {/* Social Links Footer */}
          <div className="p-4 bg-[#05140b] border-t border-green-500/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-gray-400">Direct Channels:</span>
            <div className="flex items-center gap-2">
              <a 
                href="mailto:meenakannan.dev@gmail.com" 
                className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/meena-kannan" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://github.com/meenak95" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Dispatch Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="lg:col-span-6 rounded-2xl bg-[#040e07]/90 border border-green-500/30 p-6 md:p-8 shadow-xl backdrop-blur-md"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" />
              <span>Direct Project / Role Inquiry</span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Send a direct message detailing your project scope, requirements, or role details.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="p-6 rounded-xl bg-green-500/10 border border-green-400/40 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center mx-auto text-green-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-mono text-white">Transmission Successful</h4>
              <p className="text-xs text-gray-300 font-mono max-w-sm mx-auto">
                Thank you for reaching out! Your message has been received. Meena will review your inquiry and follow up within 24 hours.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSubmitted(false)}
                className="mt-3 text-xs font-mono"
              >
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Your Name *</label>
                  <Input 
                    required 
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Email Address *</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="sarah@enterprise.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Company / Organization</label>
                  <Input 
                    placeholder="e.g. Acme Cloud Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">Project / Role Domain</label>
                  <select 
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full bg-[#040c06] border border-green-500/30 text-green-100 px-4 py-2.5 rounded-lg focus:border-green-400 focus:outline-none font-mono text-sm"
                  >
                    <option value="Full-Stack Enterprise SaaS">Full-Stack Enterprise SaaS</option>
                    <option value="Microservices Decomposition">Microservices Decomposition</option>
                    <option value="Java 21 / Spring Boot Modernization">Java 21 / Spring Boot Modernization</option>
                    <option value="Senior / Lead Full-Stack Role">Senior / Lead Full-Stack Role</option>
                    <option value="Architecture Consulting">Architecture Consulting</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Project Scope & Details *</label>
                <Textarea 
                  required 
                  rows={4}
                  placeholder="Describe your current system challenges, architectural targets, or role requirements..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Transmitting Payload...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Send Secure Message</span>
                  </span>
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
