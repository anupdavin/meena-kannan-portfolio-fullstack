import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TerminalHero from '@/components/portfolio/TerminalHero'
import AboutTerminal from '@/components/portfolio/AboutTerminal'
import TechStack from '@/components/portfolio/TechStack'
import ArchitectureLab from '@/components/portfolio/ArchitectureLab'
import ProjectsShowcase from '@/components/portfolio/ProjectsShowcase'
import ExperienceTimeline from '@/components/portfolio/ExperienceTimeline'
import ContactTerminal from '@/components/portfolio/ContactTerminal'
import { Github, Linkedin, Mail, ArrowUp, FileText } from 'lucide-react'

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' }
]

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('hero')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // Ensure fresh landing on Hero section if no hash is present in URL
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } else {
      const target = document.querySelector(window.location.hash)
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [])

  // Track active section and scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(currentProgress)
        setShowScrollTop(window.scrollY > 400)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // IntersectionObserver to sync active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const secId = entry.target.id
            setActiveSection(secId)
            // Dispatch custom event to notify navigation bar in Layout
            window.dispatchEvent(new CustomEvent('active-section-change', { detail: secId }))
          }
        })
      },
      { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen text-slate-200">
      {/* 1. Hero Section */}
      <section 
        id="hero" 
        ref={(el) => { sectionRefs.current.hero = el }} 
        className="min-h-[calc(100dvh-5rem)] flex items-center justify-center relative pt-2 sm:pt-4 pb-6 sm:pb-8 scroll-mt-20"
      >
        <TerminalHero />
      </section>

      {/* 2. About & Architecture Section */}
      <section 
        id="about" 
        ref={(el) => { sectionRefs.current.about = el }} 
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative border-t border-slate-800/80 scroll-mt-20"
      >
        <AboutTerminal />
      </section>

      {/* 3. Tech Stack & Skills Section */}
      <section 
        id="skills" 
        ref={(el) => { sectionRefs.current.skills = el }} 
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#06090e] via-[#080d19]/80 to-[#06090e] relative border-t border-slate-800/80 scroll-mt-20"
      >
        <TechStack />
      </section>

      {/* 4. Interactive ByteByteGo Architecture Lab Section */}
      <section 
        id="architecture" 
        ref={(el) => { sectionRefs.current.architecture = el }} 
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative border-t border-slate-800/80 scroll-mt-20"
      >
        <ArchitectureLab />
      </section>

      {/* 5. Enterprise Projects Showcase Section */}
      <section 
        id="projects" 
        ref={(el) => { sectionRefs.current.projects = el }} 
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative border-t border-slate-800/80 scroll-mt-20"
      >
        <ProjectsShowcase />
      </section>

      {/* 6. Career Journey & Experience Section */}
      <section 
        id="experience" 
        ref={(el) => { sectionRefs.current.experience = el }} 
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#06090e] via-[#080d19]/80 to-[#06090e] relative border-t border-slate-800/80 scroll-mt-20"
      >
        <ExperienceTimeline />
      </section>

      {/* 7. Contact Terminal Section */}
      <section 
        id="contact" 
        ref={(el) => { sectionRefs.current.contact = el }} 
        className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#06090e] via-[#091122] to-[#060a12] relative border-t border-slate-800/80 scroll-mt-20"
      >
        <ContactTerminal />
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-slate-800 bg-[#04070c]/90 font-mono text-xs text-center text-slate-500 space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-white tracking-tight">Meena Kannan</span>
            <span className="text-slate-500 hidden sm:inline font-mono">| Principal Systems & Cloud Architect</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-400">
            <a href="https://github.com/meenak95" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors py-1 px-1">
              GitHub
            </a>
            <a href="https://linkedin.com/in/meena-kannan" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors py-1 px-1" aria-label="LinkedIn Profile">
              LinkedIn
            </a>
            <a 
              href="/Meena_Kannan_Senior_Architect_Resume.pdf" 
              download="Meena_Kannan_Senior_Architect_Resume.pdf" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors py-1 px-1"
              aria-label="Download Meena Kannan's Resume PDF"
            >
              Resume (PDF)
            </a>
            <a href="mailto:meenakannan.dev@gmail.com" className="hover:text-emerald-400 transition-colors py-1 px-1" aria-label="Direct Email to Meena Kannan">
              Email
            </a>
            <button onClick={scrollToTop} className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer py-1 px-1" aria-label="Scroll to top of page">
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
          Engineered with React 19, TypeScript, Vite, Tailwind CSS 4 & Framer Motion. Built for resilient performance across all desktop and mobile viewports.
        </p>
      </footer>

      {/* Left Vertical Section Tracker Dots (Desktop only) */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            title={sec.label}
            aria-label={`Scroll to ${sec.label} section`}
            className="group flex items-center gap-3 cursor-pointer text-left bg-transparent border-none p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
          >
            <div
              className={`transition-all duration-300 rounded-full ${
                activeSection === sec.id
                  ? 'w-2.5 h-8 bg-emerald-400 glow-border'
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
            <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
              {sec.label}
            </span>
          </button>
        ))}
      </div>

      {/* Floating Scroll to Top Button with Progress Ring */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            title="Scroll to Top"
            aria-label="Scroll to top of page"
            className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-4 sm:bottom-8 sm:left-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/90 border border-emerald-500/40 text-emerald-400 hover:text-white hover:border-emerald-400 flex items-center justify-center shadow-xl transition-all cursor-pointer backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ArrowUp className="w-4 h-4" />
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="113.1"
                strokeDashoffset={113.1 - (113.1 * scrollProgress) / 100}
                className="transition-all duration-150"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fixed Social Quick Dock (Right Side - Desktop/Tablet) */}
      <div className="fixed bottom-24 right-6 z-40 hidden sm:flex flex-col gap-3">
        <motion.a
          whileHover={{ scale: 1.15, x: -3 }}
          whileTap={{ scale: 0.9 }}
          href="https://github.com/meenak95"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub Profile"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-emerald-500/40 hover:border-emerald-400 text-slate-300 hover:text-emerald-400 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          title="GitHub Profile"
        >
          <Github className="w-4 h-4" />
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.15, x: -3 }}
          whileTap={{ scale: 0.9 }}
          href="https://www.linkedin.com/in/meena-kannan"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn Profile"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="LinkedIn Profile"
        >
          <Linkedin className="w-4 h-4" />
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.15, x: -3 }}
          whileTap={{ scale: 0.9 }}
          href="/Meena_Kannan_Senior_Architect_Resume.pdf"
          download="Meena_Kannan_Senior_Architect_Resume.pdf"
          target="_blank"
          rel="noreferrer"
          aria-label="Download Executive CV PDF"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-slate-700 hover:border-white text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          title="Download Resume (PDF)"
        >
          <FileText className="w-4 h-4" />
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.15, x: -3 }}
          whileTap={{ scale: 0.9 }}
          href="mailto:meenakannan.dev@gmail.com"
          aria-label="Direct Email Meena Kannan"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-purple-500/40 hover:border-purple-400 text-slate-300 hover:text-purple-400 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          title="Direct Email"
        >
          <Mail className="w-4 h-4" />
        </motion.a>
      </div>
    </div>
  )
}
