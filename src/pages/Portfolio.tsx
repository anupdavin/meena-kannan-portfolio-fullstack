import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import TerminalHero from '@/components/portfolio/TerminalHero'
import AboutTerminal from '@/components/portfolio/AboutTerminal'
import TechStack from '@/components/portfolio/TechStack'
import ProjectsShowcase from '@/components/portfolio/ProjectsShowcase'
import ExperienceTimeline from '@/components/portfolio/ExperienceTimeline'
import InteractiveCli from '@/components/portfolio/InteractiveCli'
import ContactTerminal from '@/components/portfolio/ContactTerminal'
import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react'

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'terminal', label: 'CLI' },
  { id: 'contact', label: 'Contact' }
]

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('hero')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen text-green-400">
      {/* 1. Hero Section */}
      <section 
        id="hero" 
        ref={(el) => { sectionRefs.current.hero = el }} 
        className="min-h-screen flex items-center justify-center relative pt-8 pb-16"
      >
        <TerminalHero />
      </section>

      {/* 2. About & Architecture Section */}
      <section 
        id="about" 
        ref={(el) => { sectionRefs.current.about = el }} 
        className="py-24 px-6 relative border-t border-green-500/15"
      >
        <AboutTerminal />
      </section>

      {/* 3. Tech Stack & Skills Section */}
      <section 
        id="skills" 
        ref={(el) => { sectionRefs.current.skills = el }} 
        className="py-24 px-6 bg-gradient-to-b from-[#030704] via-[#051108]/90 to-[#030704] relative border-t border-green-500/15"
      >
        <TechStack />
      </section>

      {/* 4. Enterprise Projects Showcase Section */}
      <section 
        id="projects" 
        ref={(el) => { sectionRefs.current.projects = el }} 
        className="py-24 px-6 relative border-t border-green-500/15"
      >
        <ProjectsShowcase />
      </section>

      {/* 5. Career Journey & Experience Section */}
      <section 
        id="experience" 
        ref={(el) => { sectionRefs.current.experience = el }} 
        className="py-24 px-6 bg-gradient-to-b from-[#030704] via-[#051108]/90 to-[#030704] relative border-t border-green-500/15"
      >
        <ExperienceTimeline />
      </section>

      {/* 6. Interactive Terminal CLI Section */}
      <section 
        id="terminal" 
        ref={(el) => { sectionRefs.current.terminal = el }} 
        className="py-24 px-6 relative border-t border-green-500/15"
      >
        <InteractiveCli />
      </section>

      {/* 7. Contact Terminal Section */}
      <section 
        id="contact" 
        ref={(el) => { sectionRefs.current.contact = el }} 
        className="py-24 px-6 bg-gradient-to-b from-[#030704] via-[#05140b] to-[#020503] relative border-t border-green-500/15"
      >
        <ContactTerminal />
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-green-500/20 bg-black/80 font-mono text-xs text-center text-gray-500 space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-bold text-white">&lt;MeenaKannan.dev /&gt;</span>
            <span className="text-gray-500">• Production Architecture</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400">
            <a href="https://github.com/meenak95" target="_blank" rel="noreferrer" className="hover:text-green-400 transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/in/meena-kannan" target="_blank" rel="noreferrer" className="hover:text-green-400 transition-colors">
              LinkedIn
            </a>
            <a href="mailto:meenakannan.dev@gmail.com" className="hover:text-green-400 transition-colors">
              Email
            </a>
            <button onClick={scrollToTop} className="hover:text-green-400 transition-colors flex items-center gap-1 cursor-pointer">
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-gray-600">
          Engineered with React 19, TypeScript, Vite, Tailwind CSS 4 & Framer Motion. Zero tracking cookies.
        </p>
      </footer>

      {/* Left Vertical Section Tracker Dots */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
        {SECTIONS.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            title={sec.label}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <div
              className={`transition-all duration-300 rounded-full ${
                activeSection === sec.id
                  ? 'w-2.5 h-8 bg-green-400 glow-border'
                  : 'w-2 h-2 bg-gray-700 hover:bg-gray-500'
              }`}
            />
            <span className="text-[10px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-0.5 rounded border border-gray-800">
              {sec.label}
            </span>
          </a>
        ))}
      </div>

      {/* Fixed Social Quick Dock (Right Side) */}
      <div className="fixed bottom-24 right-6 z-40 hidden sm:flex flex-col gap-3">
        <motion.a
          whileHover={{ scale: 1.15, x: -3 }}
          whileTap={{ scale: 0.9 }}
          href="https://github.com/meenak95"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-full bg-black/80 border border-green-500/40 hover:border-green-400 text-gray-300 hover:text-green-400 flex items-center justify-center shadow-lg transition-colors"
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
          className="w-10 h-10 rounded-full bg-black/80 border border-cyan-500/40 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 flex items-center justify-center shadow-lg transition-colors"
          title="LinkedIn Profile"
        >
          <Linkedin className="w-4 h-4" />
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.15, x: -3 }}
          whileTap={{ scale: 0.9 }}
          href="mailto:meenakannan.dev@gmail.com"
          className="w-10 h-10 rounded-full bg-black/80 border border-purple-500/40 hover:border-purple-400 text-gray-300 hover:text-purple-400 flex items-center justify-center shadow-lg transition-colors"
          title="Direct Email"
        >
          <Mail className="w-4 h-4" />
        </motion.a>
      </div>
    </div>
  )
}
