import { motion } from 'framer-motion'
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  GitBranch, 
  Cpu, 
  Layers
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ArchitecturalAchievement {
  text: string
  metricLabel: string
  metricValue: string
  icon: typeof TrendingUp
}

interface MilestoneExperience {
  title: string
  company: string
  domain: string
  location: string
  duration: string
  type: string
  scopeSummary: string
  achievements: ArchitecturalAchievement[]
  techAndPatterns: string[]
  highlight: boolean
}

const MILESTONES: MilestoneExperience[] = [
  {
    title: 'Lead Full-Stack & Cloud Solutions Architect',
    company: 'Enterprise Cloud & SaaS Modernization',
    domain: 'Enterprise Cloud Transformation | Tier-1 Financial & SaaS Clients (Singapore & Regional)',
    location: 'Remote / Singapore & Global',
    duration: '2022 - Present',
    type: 'Full-time / Advisory',
    scopeSummary: 'Leading enterprise cloud transformation, monolith-to-microservices decomposition, and distributed systems architecture for high-growth global platforms.',
    achievements: [
      {
        text: 'Zero-Downtime Monolith-to-Microservices Migration: Decomposed legacy monolithic core into autonomous event-driven services with Apache Kafka, Spring Boot 3, and Java 21 Virtual Threads, raising system SLA from 99.85% to 99.99% under 12,000 peak req/s.',
        metricLabel: 'System SLA',
        metricValue: '99.85% -> 99.99%',
        icon: TrendingUp
      },
      {
        text: 'Kubernetes/EKS & AWS Cost Optimization: Cut AWS monthly infrastructure spend by 38% ($42,000 to $26,000/mo) through ECS Fargate Graviton migration, Karpenter spot instance bin-packing, and two-tier Redis caching.',
        metricLabel: 'AWS Cloud Spend',
        metricValue: '$42k -> $26k/mo (-38%)',
        icon: DollarSign
      },
      {
        text: 'Cross-Functional Squad Leadership: Directed 12+ engineers across 3 squads and automated GitHub Actions CI/CD pipelines with containerized Testcontainers validation, accelerating release turnaround from 48 hours to under 15 minutes.',
        metricLabel: 'Release Cycle',
        metricValue: '48h -> 15m',
        icon: Users
      }
    ],
    techAndPatterns: [
      'Java 21 (Virtual Threads)',
      'Spring Boot 3',
      'React 19',
      'Apache Kafka',
      'AWS EKS',
      'Clean Architecture',
      'Choreographed Saga',
      'Transactional Outbox',
      'PostgreSQL',
      'Redis Cluster',
      'Terraform'
    ],
    highlight: true
  },
  {
    title: 'Senior Full-Stack & Distributed Systems Engineer',
    company: 'FinTech & High-Frequency Scale-ups',
    domain: 'Distributed Systems Core & High-Frequency Ingest Infrastructure',
    location: 'Singapore / India',
    duration: '2020 - 2022',
    type: 'Full-time',
    scopeSummary: 'Designed and deployed high-concurrency payment APIs, real-time WebSocket state streaming pipelines, and secure financial data storage vaults.',
    achievements: [
      {
        text: 'High-Throughput Payment & Telemetry APIs: Engineered non-blocking asynchronous REST and gRPC ingest pipelines serving 50,000+ concurrent active sessions, sustaining sub-90ms P99 response times during flash-trading surges.',
        metricLabel: 'Active Ingest',
        metricValue: '50k+ Sessions',
        icon: Zap
      },
      {
        text: 'Real-Time Sync Latency Reduction: Architected a clustered WebSocket mesh backed by Redis Pub/Sub, reducing live collaboration sync latency from 5,000ms HTTP polling to 18ms instant broadcasts.',
        metricLabel: 'Broadcast Latency',
        metricValue: '5,000ms -> 18ms',
        icon: Cpu
      },
      {
        text: 'PCI-DSS Tier 1 Security Hardening: Designed an append-only double-entry ledger with AWS KMS envelope encryption, eliminating duplicate transaction anomalies from 0.35% to 0.00% and passing PCI-DSS Tier 1 audits with zero findings.',
        metricLabel: 'Duplicate Errors',
        metricValue: '0.35% -> 0.00%',
        icon: ShieldCheck
      }
    ],
    techAndPatterns: [
      'Java 17',
      'Spring Cloud',
      'React',
      'TypeScript',
      'WebSockets',
      'Redis Pub/Sub',
      'AWS KMS',
      'Docker',
      'PostgreSQL',
      'Idempotent APIs',
      'Flyway'
    ],
    highlight: false
  },
  {
    title: 'Full-Stack Software Engineer',
    company: 'Enterprise SaaS & Workflow Automation',
    domain: 'Full-Lifecycle Enterprise Microservices & Cloud Architecture',
    location: 'Chennai, India / Remote',
    duration: '2018 - 2020',
    type: 'Full-time',
    scopeSummary: 'Spearheaded core multi-tenant billing engines, asynchronous webhook delivery infrastructure, and automated testing harnesses.',
    achievements: [
      {
        text: 'Relational Database Performance Tuning: Reduced P99 reporting query latency from 480ms to 120ms across 25M+ rows in PostgreSQL by replacing sequential CTE scans with composite partial indexes and PgBouncer transaction pooling.',
        metricLabel: 'Query P99 Latency',
        metricValue: '480ms -> 120ms',
        icon: TrendingUp
      },
      {
        text: 'Fault-Tolerant Webhook Delivery: Engineered resilient asynchronous webhook delivery with exponential backoff queues and dead-letter topics, elevating transaction event delivery success from 98.2% to 99.999% across $2M+ monthly transfers.',
        metricLabel: 'Delivery Success',
        metricValue: '98.2% -> 99.999%',
        icon: GitBranch
      },
      {
        text: 'Automated Test Harness Modernization: Instituted contract-first testing harnesses using JUnit 5, Testcontainers, and Mockito, driving down post-deployment production defect escape rates from 16% to under 4%.',
        metricLabel: 'Defect Escape',
        metricValue: '16% -> < 4%',
        icon: ShieldCheck
      }
    ],
    techAndPatterns: [
      'Java 11 / 8',
      'Spring Boot',
      'Hibernate / JPA',
      'PostgreSQL',
      'MySQL',
      'REST APIs',
      'JavaScript',
      'Testcontainers',
      'JUnit 5',
      'Docker',
      'CI/CD'
    ],
    highlight: false
  },
  {
    title: 'Software Engineer & Solutions Developer',
    company: 'Enterprise Web Solutions & Core Systems',
    domain: 'Relational Database Optimization & Enterprise Core Services',
    location: 'Chennai, India',
    duration: '2016 - 2018',
    type: 'Full-time',
    scopeSummary: 'Developed mission-critical inventory management systems, client-facing SPA portals, and operational telemetry monitoring dashboards.',
    achievements: [
      {
        text: 'Distributed Relational Database Optimization: Normalized schema architecture and tuned HikariCP connection pool configurations, increasing analytics reporting query throughput from 250 to 1,050 queries per second (4.2x gain).',
        metricLabel: 'Query Throughput',
        metricValue: '250 -> 1,050 QPS',
        icon: TrendingUp
      },
      {
        text: 'Modular Frontend Component Library: Built a reusable modular frontend design system with TypeScript and React, accelerating multi-tenant enterprise portal feature release cycles from 6 weeks to 3.5 weeks.',
        metricLabel: 'Feature Cycle',
        metricValue: '6w -> 3.5w',
        icon: Layers
      },
      {
        text: 'Production Observability & Monitoring: Implemented Prometheus metrics scrapers and Grafana anomaly dashboards across 40+ virtual host instances, decreasing Mean Time to Detect (MTTD) production incidents from 45 minutes to 4 minutes.',
        metricLabel: 'Incident MTTD',
        metricValue: '45m -> 4m',
        icon: Users
      }
    ],
    techAndPatterns: [
      'Java',
      'Spring MVC',
      'PostgreSQL',
      'JavaScript',
      'HTML5 / CSS3',
      'Linux Administration',
      'Git',
      'Prometheus',
      'Grafana'
    ],
    highlight: false
  }
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
        className="text-center mb-10 sm:mb-16"
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/50 mb-3 shadow-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>8+ YEARS ARCHITECTURAL LEADERSHIP & TRACK RECORD</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-editorial">
          Experience & Architecture Leadership
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 sm:mt-3 font-sans text-xs sm:text-sm md:text-base leading-relaxed">
          Over 8+ years leading engineering squads, decomposing monoliths into resilient microservices, optimizing cloud costs, and building mission-critical enterprise systems.
        </p>
      </motion.div>

      {/* Timeline Container */}
      <div className="relative border-l-2 border-slate-800 ml-2.5 sm:ml-6 md:ml-36 space-y-8 sm:space-y-12">
        {MILESTONES.map((milestone, idx) => (
          <motion.div
            key={milestone.title + milestone.duration}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.12, duration: 0.5 }}
            className="relative pl-4 sm:pl-6 md:pl-10"
          >
            {/* Timeline Node Point */}
            <div className={`absolute -left-[9px] sm:-left-[11px] top-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${
              milestone.highlight 
                ? 'bg-emerald-400 border-white shadow-lg shadow-emerald-500/50' 
                : 'bg-slate-900 border-slate-700'
            }`}>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-950 m-auto mt-[3px] sm:mt-[4px]" />
            </div>

            {/* Date Pill (Left on desktop, above on mobile) */}
            <div className="md:absolute md:-left-40 md:top-1 text-xs font-mono text-emerald-400 font-bold mb-2 md:mb-0">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 inline-block text-[10px] sm:text-xs shadow-sm">
                {milestone.duration}
              </span>
            </div>

            {/* Main Experience Card */}
            <div className={`p-5 sm:p-7 md:p-8 rounded-2xl bg-[#090e18]/90 border ${
              milestone.highlight ? 'border-emerald-500/50 shadow-2xl specular-card-elevated' : 'border-slate-800/90'
            } backdrop-blur-md specular-card`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-editorial text-white leading-snug">
                    {milestone.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-slate-400 mt-1">
                    <span className="text-emerald-400 font-semibold">{milestone.company}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {milestone.location}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-cyan-400 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                      {milestone.domain}
                    </span>
                  </div>
                </div>

                {milestone.highlight && (
                  <Badge variant="cyan" className="self-start sm:self-center shrink-0">
                    Current Focus
                  </Badge>
                )}
              </div>

              {/* Scope Summary */}
              <p className="text-xs sm:text-sm text-slate-300 font-sans mb-4 sm:mb-5 italic border-l-2 border-emerald-500/60 pl-3.5 py-0.5 leading-relaxed">
                "{milestone.scopeSummary}"
              </p>

              {/* Key Architectural Achievements */}
              <div className="space-y-3 mb-5 sm:mb-6">
                <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Key Architectural Achievements</span>
                </div>

                <div className="space-y-2.5">
                  {milestone.achievements.map((ach, aIdx) => (
                    <div key={aIdx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-slate-200">
                        <ach.icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ach.text}</span>
                      </div>
                      <div className="shrink-0 self-end sm:self-center px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/30 text-right">
                        <div className="text-xs font-bold font-mono text-emerald-400">{ach.metricValue}</div>
                        <div className="text-[9px] font-mono text-slate-400 truncate">{ach.metricLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech & Patterns Used Pill Badges */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Tech & Patterns Used</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {milestone.techAndPatterns.map(tech => (
                    <span
                      key={tech}
                      className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
