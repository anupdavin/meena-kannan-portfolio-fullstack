import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import MatrixBackground from '@/components/MatrixBackground'
import ChatWidget from '@/components/ChatWidget'
import ExecutiveBriefingModal from '@/components/portfolio/ExecutiveBriefingModal'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Code2, 
  Send, 
  Github, 
  Linkedin, 
  Mail, 
  ChevronRight,
  Award
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '#hero', id: 'hero' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Skills', href: '#skills', id: 'skills' },
  { label: 'AI Codex', href: '#architecture-ai-codex', id: 'architecture-ai-codex', badge: 'ByteByteGo' },
  { label: 'Architecture', href: '#architecture', id: 'architecture', badge: '22 Engines' },
  { label: 'Projects', href: '#projects', id: 'projects' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Contact', href: '#contact', id: 'contact' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [isBriefingOpen, setIsBriefingOpen] = useState(false)

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Sync active section from Portfolio scroll listener
  useEffect(() => {
    const handleSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setActiveSection(customEvent.detail)
      }
    }

    window.addEventListener('active-section-change', handleSectionChange)
    return () => window.removeEventListener('active-section-change', handleSectionChange)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    document.body.style.overflow = ''

    // Small delay to allow the mobile browser layout engine to unlock scroll
    setTimeout(() => {
      if (href === '#hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }, 60)
  }

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-200 font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Skip to Content for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[100] px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs font-mono rounded-lg border border-emerald-300 shadow-xl"
      >
        Skip to main content
      </a>

      {/* Dynamic Ambient Background Canvas */}
      <MatrixBackground speed={35} />

      {/* Top Navigation Bar */}
      <nav aria-label="Main Navigation" className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#060a12]/90 border-b border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5">
          <div className="flex justify-between items-center gap-2">
            
            {/* Logo Brand */}
            <a 
              href="#hero" 
              onClick={(e) => handleNavClick(e, '#hero')}
              aria-label="Meena Kannan - Principal Systems & Cloud Architect"
              className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/80 group-hover:bg-emerald-500/20 transition-all shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                  Meena Kannan
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-normal truncate max-w-[170px] sm:max-w-none">
                  Principal Systems & Cloud Architect
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links with Active Highlighting */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-xs font-mono transition-all py-1.5 px-3 rounded-lg relative cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'text-white font-bold bg-slate-800/80 border border-slate-700' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full" />
                    )}
                  </a>
                )
              })}
            </div>

            {/* Right Status Badge & Contact CTA (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-2.5">
              <button
                onClick={() => setIsBriefingOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold font-mono text-xs hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive Briefing</span>
              </button>

              <a
                href="https://github.com/meenak95"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Profile"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors"
                title="GitHub Profile"
              >
                <Github className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://linkedin.com/in/meena-kannan"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn Profile"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 flex items-center justify-center transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>

              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold font-mono text-xs hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <Send className="w-3 h-3" />
                <span>Hire / Inquire</span>
              </a>
            </div>

            {/* Mobile Actions: Compact Hire Pill + Hamburger Button */}
            <div className="lg:hidden flex items-center gap-2">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold font-mono text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Contact</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center active:scale-95"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Polished Mobile Drawer / Modal Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 top-[56px] sm:top-[60px] bg-black/80 backdrop-blur-md z-40 overscroll-contain"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden relative z-50 px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-[#060a12]/98 border-b border-slate-800 shadow-2xl space-y-3 max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain touch-scroll"
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Available for Architecture Roles</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Enterprise Advisory</span>
                </div>

                {/* Nav Links List */}
                <div className="space-y-1 pt-1">
                  {NAV_LINKS.map((link) => {
                    const isActive = activeSection === link.id
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className={`flex items-center justify-between text-sm font-mono py-2.5 px-3 rounded-lg transition-colors cursor-pointer ${
                          isActive 
                            ? 'text-white font-bold bg-emerald-500/15 border border-emerald-500/40' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{link.label}</span>
                          {link.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              {link.badge}
                            </span>
                          )}
                        </div>
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </a>
                    )
                  })}
                </div>

                {/* Mobile Direct Channels & Social Row */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Direct Professional Channels
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href="https://github.com/meenak95"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition-colors text-xs gap-1"
                    >
                      <Github className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px]">GitHub</span>
                    </a>

                    <a
                      href="https://linkedin.com/in/meena-kannan"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-colors text-xs gap-1"
                    >
                      <Linkedin className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px]">LinkedIn</span>
                    </a>

                    <a
                      href="#contact"
                      onClick={(e) => handleNavClick(e, '#contact')}
                      aria-label="Direct Email & Contact"
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-400 transition-colors text-xs gap-1"
                    >
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px]">Email</span>
                    </a>
                  </div>

                  {/* Executive Briefing CTA for Mobile */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setIsBriefingOpen(true)
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors font-mono cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Executive Architecture Briefing</span>
                  </button>

                  {/* Primary CTA */}
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, '#contact')}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.99] font-mono"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Inquire for Consulting / Engineering Roles</span>
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Page Content */}
      <main id="main-content" className="relative z-10 pt-14 sm:pt-16">
        <Outlet />
      </main>

      {/* Floating AI Chat Widget */}
      <ChatWidget />

      {/* Executive Briefing Modal Dialog */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />
    </div>
  )
}
