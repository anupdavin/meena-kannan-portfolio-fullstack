import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Server, 
  Check, 
  Copy, 
  Code, 
  Sparkles
} from 'lucide-react'
import AgenticWorkflowDiagram from '@/components/architecture/AgenticWorkflowDiagram'

const CORE_PILLARS = [
  {
    title: 'Clean Architecture & Domain Core',
    desc: 'Decoupled domain rules from infrastructure via Ports and Adapters, ensuring deterministic unit tests and zero framework lock-in.',
    icon: Layers,
    color: 'text-purple-400'
  },
  {
    title: 'Distributed Sagas & Resilience',
    desc: 'Eliminates distributed locking coordinators via Choreographed Sagas, Transactional Outbox (Debezium CDC), and Resilience4j circuit breakers.',
    icon: ShieldCheck,
    color: 'text-emerald-400'
  },
  {
    title: 'ACID Isolation & Multi-Tier Caching',
    desc: 'Guarantees transactional consistency via PostgreSQL Row-Level Security, composite indexing, and sub-5ms Redis L2 cache-aside.',
    icon: Zap,
    color: 'text-cyan-400'
  },
  {
    title: 'Zero-Trust Security & Auditing',
    desc: 'Hardened identity with stateless JWT/OAuth2 RBAC, AWS KMS envelope tokenization, and immutable append-only ledgers for SOC-2 and PCI-DSS.',
    icon: Server,
    color: 'text-amber-400'
  }
]

const CODE_SPECIFICATIONS = [
  {
    fileName: 'CleanArchitectureSpec.java',
    pattern: 'Hexagonal / Virtual Threads',
    language: 'java',
    code: `package dev.meenakannan.core.architecture;

/**
 * Domain Core Architecture Specification: Ports & Adapters (Hexagonal)
 * Zero framework coupling in core domain layer. Deterministic & testable.
 */
@DomainAggregate(boundedContext = "EnterpriseCore", version = "3.2.0")
public final class CleanArchitectureSpec {

    // Primary Port: Ingress transaction execution boundary
    public record TransactionCommand(TenantId tenantId, OrderId orderId, Money amount) {}

    // Secondary Port: Distributed Event Outbox publication
    public interface OutboxPublisherPort {
        void emitWithGuaranteedDelivery(DomainEvent event, IdempotencyKey key);
    }

    // Secondary Port: Sharded ACID Storage with Row-Level Security
    public interface TenantPersistencePort {
        Optional<TenantContext> loadWithIsolation(TenantId tenantId);
        void commitTransactionWithOutbox(TenantContext ctx, OutboxRecord record);
    }

    // Ingress use-case orchestrator executed on Java 21 Virtual Threads
    public TransactionReceipt orchestrate(TransactionCommand cmd, OutboxPublisherPort outbox) {
        return VirtualThreadDispatcher.execute(() -> {
            var validatedContext = validateDomainInvariants(cmd);
            outbox.emitWithGuaranteedDelivery(new OrderInitiatedEvent(cmd), IdempotencyKey.generate());
            return TransactionReceipt.approved(cmd.orderId(), LatencyBudget.sub80ms());
        });
    }
}`
  },
  {
    fileName: 'SagaPaymentCoordinator.java',
    pattern: 'Choreographed Saga & Rollback',
    language: 'java',
    code: `package dev.meenakannan.distributed.saga;

/**
 * Choreographed Saga Coordinator: Multi-Stage Distributed Settlement
 * Non-blocking rollback handler with idempotency and dead-letter safety.
 */
@SagaParticipant(topic = "financial.settlement.events", partitionKey = "accountId")
public final class SagaPaymentCoordinator {

    private final KafkaTemplate<String, DomainEvent> eventBus;
    private final PaymentLedgerPort ledgerPort;
    private final CircuitBreaker circuitBreaker;

    public CompletableFuture<SagaOutcome> processStage(PaymentIntentEvent intent) {
        return circuitBreaker.executeSupplier(() -> {
            try {
                // Execute local ACID ledger balance deduction
                var transaction = ledgerPort.deductWithLease(intent.accountId(), intent.amount());
                eventBus.send("financial.settlement.cleared", intent.orderId(), transaction.asEvent());
                return CompletableFuture.completedFuture(SagaOutcome.COMMITTED);
            } catch (InsufficientFundsException | LockTimeoutException ex) {
                // Trigger non-blocking compensating compensation
                emitCompensatingRollback(intent, ex.getReason());
                return CompletableFuture.completedFuture(SagaOutcome.COMPENSATED);
            }
        });
    }

    private void emitCompensatingRollback(PaymentIntentEvent intent, FailureReason reason) {
        var compensation = new SagaRollbackEvent(intent.orderId(), intent.accountId(), reason);
        eventBus.send("financial.settlement.failed", intent.orderId(), compensation);
    }
}`
  },
  {
    fileName: 'TenantIsolationFilter.java',
    pattern: 'PostgreSQL RLS & JWT Claims',
    language: 'java',
    code: `package dev.meenakannan.security.multitenancy;

/**
 * Enterprise Multi-Tenant Isolation Filter: PostgreSQL Row-Level Security (RLS)
 * Extracts cryptographically signed claims and enforces tenant session isolation.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public final class TenantIsolationFilter extends OncePerRequestFilter {

    private final JwtTokenValidator tokenValidator;
    private final DataSource dataSource;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        var authHeader = req.getHeader("Authorization");
        var tenantClaims = tokenValidator.extractVerifiedTenant(authHeader);

        // Bind tenant identity to PostgreSQL RLS session context
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement("SET LOCAL app.current_tenant_id = ?")) {
            statement.setString(1, tenantClaims.tenantId().value());
            statement.execute();

            TenantContextHolder.setContext(tenantClaims);
            chain.doFilter(req, res);
        } finally {
            TenantContextHolder.clear();
        }
    }
}`
  }
]

export default function AboutTerminal() {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const activeSpec = CODE_SPECIFICATIONS[activeTab]

  const copyCode = () => {
    navigator.clipboard.writeText(activeSpec.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <span>SPECIFICATIONS & ARCHITECTURAL FOUNDATION</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-editorial">
          System Specifications & Architecture
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 sm:mt-3 font-sans text-xs sm:text-sm md:text-base leading-relaxed">
          Engineering clean, maintainable, and highly resilient cloud-native software built for enterprise scale.
        </p>
      </motion.div>

      {/* Code Card & Overview */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-10 sm:mb-16">
        {/* Left: Interactive Class Specification */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-2xl min-w-0 w-full"
        >
          {/* Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0d1424] border-b border-slate-800 px-2 sm:px-3 py-2 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto touch-scroll" role="tablist" aria-label="Architecture code specifications">
              {CODE_SPECIFICATIONS.map((spec, idx) => (
                <button
                  key={spec.fileName}
                  role="tab"
                  aria-selected={activeTab === idx}
                  tabIndex={0}
                  onClick={() => setActiveTab(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeTab === idx
                      ? 'bg-slate-900 text-emerald-400 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{spec.fileName}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 px-1">
              <span className="hidden md:inline font-mono text-[11px] text-slate-500 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                {activeSpec.pattern}
              </span>
              <button 
                onClick={copyCode}
                aria-label={`Copy ${activeSpec.fileName} code snippet`}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <pre className="p-3.5 sm:p-5 text-[11px] sm:text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto touch-scroll max-w-full h-[360px]">
            {activeSpec.code}
          </pre>
        </motion.div>

        {/* Right: Engineering Philosophy Bio */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="lg:col-span-6 space-y-4 min-w-0 w-full"
        >
          <div className="rounded-2xl bg-[#090e18]/90 border border-slate-800 p-5 sm:p-7 specular-card">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXECUTIVE ENGINEERING PROFILE</span>
            </div>
            <p className="text-slate-200 font-sans text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              I am a <strong className="text-white font-bold">Senior Full-Stack Software Engineer & Solutions Architect</strong> specializing in decomposing monolithic enterprise systems into resilient, event-driven microservices.
            </p>
            <p className="text-slate-400 font-sans text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Across 8+ years of production delivery for enterprise platforms in Singapore and global markets, I have architected high-throughput financial ingest pipelines, multi-tenant B2B SaaS platforms, and low-latency WebSocket meshes. My engineering practice centers on Clean Architecture, Domain-Driven Design, Choreographed Sagas, and strict ACID transaction boundaries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-3 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono block">Primary Methodology</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">Clean Architecture / DDD</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono block">Delivery Cycle</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400">CI/CD Continuous Delivery</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Agentic AI Architecture Blueprint: ByteByteGo Style Orchestrator-Worker Engine */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }} 
        className="mb-10 sm:mb-16"
      >
        <AgenticWorkflowDiagram />
      </motion.div>

      {/* Core Engineering Pillars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {CORE_PILLARS.map((pillar) => (
          <div key={pillar.title} className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all specular-card">
            <pillar.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${pillar.color} mb-2 sm:mb-3`} />
            <h4 className="text-xs sm:text-sm font-bold font-editorial text-white mb-1.5 sm:mb-2">{pillar.title}</h4>
            <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
