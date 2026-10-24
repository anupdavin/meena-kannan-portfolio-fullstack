import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import MatrixBackground from '@/components/MatrixBackground'
import ChatWidget from '@/components/ChatWidget'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Code2, 
  Send, 
  Github, 
  Linkedin, 
  Mail, 
  ChevronRight
} from 'lucide-react'

const NAV_LINKS = [
  { label: '// home', href: '#hero', id: 'hero' },
  { label: '// about', href: '#about', id: 'about' },
  { label: '// skills', href: '#skills', id: 'skills' },
  { label: '// projects', href: '#projects', id: 'projects' },
  { label: '// experience', href: '#experience', id: 'experience' },
  { label: '// terminal', href: '#terminal', id: 'terminal' },
  { label: '// contact', href: '#contact', id: 'contact' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

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
    <div className="min-h-screen bg-[#030704] text-green-400 font-mono relative overflow-x-hidden selection:bg-green-500 selection:text-black">
      {/* Skip to Content for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[100] px-3.5 py-1.5 bg-green-500 text-black font-bold text-xs font-mono rounded-lg border border-green-300 shadow-xl"
      >
        Skip to main content
      </a>

      {/* Dynamic Matrix Rain Canvas Background */}
      <MatrixBackground speed={35} />

      {/* Subtle Scanlines CRT Effect */}
      <div className="fixed inset-0 scanlines pointer-events-none z-30 opacity-40" />

      {/* Top Cyberpunk Navigation Bar */}
      <nav aria-label="Main Navigation" className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030805]/92 border-b border-green-500/20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5">
          <div className="flex justify-between items-center gap-2">
            
            {/* Logo Brand */}
            <a 
              href="#hero" 
              onClick={(e) => handleNavClick(e, '#hero')}
              aria-label="Meena Kannan Homepage"
              className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500/15 border border-green-500/40 flex items-center justify-center text-green-400 group-hover:border-green-400 group-hover:bg-green-500/25 transition-all glow-border shrink-0">
                <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wider glow-text leading-tight">
                  &lt;MeenaKannan<span className="text-green-400">.dev</span> /&gt;
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 tracking-tighter truncate max-w-[150px] sm:max-w-none">
                  Cloud & Solutions Architect
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links with Active Highlighting */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-xs font-mono transition-all py-1.5 px-2 rounded relative cursor-pointer ${
                      isActive 
                        ? 'text-white font-bold glow-text bg-green-500/10' 
                        : 'text-gray-400 hover:text-green-300'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-400 rounded-full glow-border" />
                    )}
                  </a>
                )
              })}
            </div>

            {/* Right Status Badge & Contact CTA (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center gap-2.5 lg:gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] lg:text-[11px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>System Online</span>
              </div>

              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="px-3 py-1.5 rounded-lg bg-green-500 text-black font-bold text-xs hover:bg-green-400 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
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
                className="px-2.5 py-1.5 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 font-bold text-[11px] hover:bg-green-500 hover:text-black transition-all cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Contact</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="w-10 h-10 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
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
                className="lg:hidden relative z-50 px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-[#030905]/98 border-b border-green-500/30 shadow-2xl space-y-3 max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain touch-scroll"
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between py-2 border-b border-gray-800 text-xs">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>System Online & Available</span>
                  </div>
                  <span className="text-[10px] text-gray-500">v3.2.0-cloud</span>
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
                            ? 'text-white font-bold bg-green-500/15 border border-green-500/40 glow-text' 
                            : 'text-gray-300 hover:text-green-300 hover:bg-green-500/5'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={isActive ? 'text-green-400' : 'text-gray-600'}>&gt;</span>
                          <span>{link.label}</span>
                        </span>
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-green-400 glow-border" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        )}
                      </a>
                    )
                  })}
                </div>

                {/* Mobile Direct Channels & Social Row */}
                <div className="pt-3 border-t border-gray-800 space-y-3">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                    Direct Professional Channels
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href="https://github.com/meenak95"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/60 border border-gray-800 hover:border-green-500/40 text-gray-300 hover:text-green-400 transition-colors text-xs gap-1"
                    >
                      <Github className="w-4 h-4 text-green-400" />
                      <span className="text-[10px]">GitHub</span>
                    </a>

                    <a
                      href="https://linkedin.com/in/meena-kannan"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/60 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-cyan-400 transition-colors text-xs gap-1"
                    >
                      <Linkedin className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px]">LinkedIn</span>
                    </a>

                    <a
                      href="mailto:meenakannan.dev@gmail.com"
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/60 border border-gray-800 hover:border-purple-500/40 text-gray-300 hover:text-purple-400 transition-colors text-xs gap-1"
                    >
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px]">Email</span>
                    </a>
                  </div>

                  {/* Primary CTA */}
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, '#contact')}
                    className="w-full py-3 px-4 rounded-xl bg-green-500 text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 active:scale-[0.99]"
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
    </div>
  )
}
