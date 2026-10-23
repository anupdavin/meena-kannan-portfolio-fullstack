import { motion } from 'framer-motion'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  Award,
  Terminal,
  ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Experience {
  title: string
  company: string
  location: string
  duration: string
  type: string
  industry: string
  clientOutcome: string
  achievements: { text: string; icon: any }[]
  technologies: string[]
  metrics: Record<string, string>
  highlight: boolean
}

const EXPERIENCES: Experience[] = [
  {
    title: 'Lead Full-Stack & Cloud Solutions Architect',
    company: 'Enterprise Cloud & SaaS Consulting',
    location: 'Remote / Singapore & Global',
    duration: '2022 - Present',
    type: 'Full-time / Consulting',
    industry: 'Enterprise SaaS / Cloud Native',
    clientOutcome: 'Architected high-availability multi-tenant SaaS platforms and distributed microservices serving global customers.',
    achievements: [
      { text: 'Decomposed monolithic architectures into 12 autonomous microservices with Kafka -> 99.99% SLA uptime', icon: TrendingUp },
      { text: 'Built automated GitHub Actions CI/CD pipelines -> Cut release turnaround from 2 days to under 15 minutes', icon: Zap },
      { text: 'Optimized PostgreSQL and Redis multi-tier caching -> Slashed monthly cloud spend by 40%', icon: DollarSign },
      { text: 'Established Clean Architecture & DDD standards, mentoring 10+ cross-functional engineers', icon: Users },
    ],
    technologies: ['Java 21', 'Spring Boot 3', 'React 19', 'Kafka', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
    metrics: { 'System SLA': '99.99%', 'Latency Cut': '-65%', 'Cloud Saved': '40%', 'Coverage': '92%' },
    highlight: true,
  },
  {
    title: 'Senior Full-Stack Software Engineer',
    company: 'FinTech & Scale-up Technologies',
    location: 'Singapore / India',
    duration: '2020 - 2022',
    type: 'Full-time',
    industry: 'FinTech & High-Throughput E-Commerce',
    clientOutcome: 'Designed high-concurrency payment APIs, real-time WebSocket state streaming, and responsive frontend portals.',
    achievements: [
      { text: 'Engineered high-throughput REST APIs serving 50,000+ concurrent active sessions without degradation', icon: Users },
      { text: 'Implemented WebSocket real-time event streaming -> 95% boost in live collaboration engagement', icon: Zap },
      { text: 'Implemented JWT & OAuth2 authorization flows with Spring Security -> 100% compliance audit pass', icon: ShieldCheck },
      { text: 'Tuned database connection pools and indexes -> 60% faster database execution time', icon: TrendingUp },
    ],
    technologies: ['Java 17', 'Spring Boot', 'Spring Security', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'Flyway'],
    metrics: { 'API Endpoints': '120+', 'Response Cut': '-60%', 'Test Coverage': '90%', 'Downtime': '0 hrs' },
    highlight: false,
  },
  {
    title: 'Software Engineer',
    company: 'Enterprise Web Solutions',
    location: 'Chennai, India',
    duration: '2018 - 2020',
    type: 'Full-time',
    industry: 'Enterprise Software & Database Systems',
    clientOutcome: 'Developed mission-critical enterprise inventory management systems and third-party gateway integrations.',
    achievements: [
      { text: 'Built core inventory and order processing modules managing 25M+ relational records', icon: Building2 },
      { text: 'Integrated payment gateways and asynchronous notification webhooks with zero packet loss', icon: Zap },
      { text: 'Automated unit and integration testing suites using JUnit & Mockito -> 75% drop in production defects', icon: CheckCircle2 },
      { text: 'Delivered consistent 5/5 client satisfaction scores across all delivered milestones', icon: Award },
    ],
    technologies: ['Java 8', 'Spring MVC', 'Hibernate', 'Oracle DB', 'MySQL', 'JavaScript', 'HTML5/CSS3'],
    metrics: { 'Records': '25M+', 'Bugs Reduced': '-75%', 'Client Rating': '5/5', 'Delivery': '100%' },
    highlight: false,
  },
]

export default function ExperienceTimeline() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/50 mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ git log --experience --graph --oneline</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white glow-text tracking-tight font-mono">
          Career Journey & Engineering Impact
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mt-3 font-mono text-sm md:text-base">
          Proven history of architecting, building, and delivering enterprise software solutions.
        </p>
      </motion.div>

      {/* Timeline Container */}
      <div className="relative border-l-2 border-green-500/30 ml-4 md:ml-32 space-y-12">
        {EXPERIENCES.map((exp, idx) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            className="relative pl-6 md:pl-10"
          >
            {/* Timeline Node Point */}
            <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-2 ${
              exp.highlight 
                ? 'bg-green-400 border-green-200 shadow-lg shadow-green-500/50' 
                : 'bg-black border-green-500/50'
            }`}>
              <div className="w-2 h-2 rounded-full bg-black m-auto mt-[4px]" />
            </div>

            {/* Date Pill (Left on desktop) */}
            <div className="md:absolute md:-left-36 md:top-1 text-xs font-mono text-green-400 font-bold mb-2 md:mb-0">
              <span className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 inline-block">
                {exp.duration}
              </span>
            </div>

            {/* Main Experience Card */}
            <div className={`p-6 md:p-8 rounded-2xl bg-[#040e07]/90 border ${
              exp.highlight ? 'border-green-400/60 shadow-xl glow-card' : 'border-green-500/20'
            } backdrop-blur-md`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-mono text-white">
                    {exp.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 mt-1">
                    <span className="text-green-400 font-semibold">{exp.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      {exp.location}
                    </span>
                    <span>•</span>
                    <span className="text-cyan-400">{exp.industry}</span>
                  </div>
                </div>

                {exp.highlight && (
                  <Badge variant="cyan" className="self-start sm:self-center">
                    Current Focus
                  </Badge>
                )}
              </div>

              {/* Client Outcome Summary */}
              <p className="text-xs md:text-sm text-gray-300 font-mono mb-5 italic border-l-2 border-green-500/50 pl-3 py-0.5">
                "{exp.clientOutcome}"
              </p>

              {/* Key Achievements Checklist */}
              <div className="space-y-2.5 mb-6">
                {exp.achievements.map((ach, aIdx) => (
                  <div key={aIdx} className="flex items-start gap-2.5 text-xs font-mono text-gray-300">
                    <ach.icon className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{ach.text}</span>
                  </div>
                ))}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-y border-gray-800/80 mb-5">
                {Object.entries(exp.metrics).map(([k, v]) => (
                  <div key={k} className="p-2 rounded bg-black/50 border border-green-500/20 text-center">
                    <div className="text-sm font-bold font-mono text-green-400">{v}</div>
                    <div className="text-[10px] font-mono text-gray-500">{k}</div>
                  </div>
                ))}
              </div>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-1.5">
                {exp.technologies.map(tech => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-black/60 border border-gray-800 text-gray-400 hover:text-green-300 hover:border-green-500/40 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
