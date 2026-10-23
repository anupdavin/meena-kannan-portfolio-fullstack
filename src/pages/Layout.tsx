import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import MatrixBackground from '@/components/MatrixBackground'
import ChatWidget from '@/components/ChatWidget'
import { Terminal, Menu, X, Shield, Cpu, Code2 } from 'lucide-react'

const NAV_LINKS = [
  { label: '// home', href: '#hero' },
  { label: '// about', href: '#about' },
  { label: '// skills', href: '#skills' },
  { label: '// projects', href: '#projects' },
  { label: '// experience', href: '#experience' },
  { label: '// terminal', href: '#terminal' },
  { label: '// contact', href: '#contact' },
]

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#030704] text-green-400 font-mono relative overflow-x-hidden selection:bg-green-500 selection:text-black">
      {/* Dynamic Matrix Rain Canvas Background */}
      <MatrixBackground speed={35} />

      {/* Subtle Scanlines CRT Effect */}
      <div className="fixed inset-0 scanlines pointer-events-none z-30 opacity-40" />

      {/* Top Cyberpunk Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030805]/85 border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex justify-between items-center">
            {/* Logo Brand */}
            <a href="#hero" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/40 flex items-center justify-center text-green-400 group-hover:border-green-400 group-hover:bg-green-500/25 transition-all glow-border">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white tracking-wider glow-text">
                  &lt;MeenaKannan<span className="text-green-400">.dev</span> /&gt;
                </span>
                <span className="text-[10px] text-gray-500 tracking-tighter">
                  Cloud & Solutions Architect
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-mono text-gray-400 hover:text-green-300 transition-colors py-1 relative hover:glow-text"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Status Badge */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[11px] text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>System Online</span>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-6 py-4 bg-[#040e07] border-b border-green-500/30 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-mono text-gray-300 hover:text-green-400 py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-800 flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Available for Hire & Consulting</span>
            </div>
          </div>
        )}
      </nav>

      {/* Main Page Content */}
      <main className="relative z-10 pt-16">
        {children}
        <Outlet />
      </main>

      {/* Floating AI Chat Widget */}
      <ChatWidget />
    </div>
  )
}
