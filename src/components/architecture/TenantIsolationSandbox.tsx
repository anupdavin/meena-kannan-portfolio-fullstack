import React, { useState, useMemo } from 'react';
import {
  TENANT_ISOLATION_MODELS,
  MOCK_TENANTS,
  type TenantProfile,
  type SecurityProbeResult
} from '../../data/tenantIsolationModels';

export const TenantIsolationSandbox: React.FC = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant-acme');
  const [selectedParadigmId, setSelectedParadigmId] = useState<string>('postgres-rls-session-context');
  const [activeVectorId, setActiveVectorId] = useState<string>('vector-url-tampering');
  const [probeResult, setProbeResult] = useState<SecurityProbeResult | null>(null);
  const [isKmsKeyActive, setIsKmsKeyActive] = useState<boolean>(true);
  const [burstRps, setBurstRps] = useState<number>(350);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const activeTenant: TenantProfile = useMemo(() => {
    return MOCK_TENANTS.find((t) => t.id === selectedTenantId) || MOCK_TENANTS[0];
  }, [selectedTenantId]);

  const activeParadigm = useMemo(() => {
    return TENANT_ISOLATION_MODELS.find((m) => m.id === selectedParadigmId) || TENANT_ISOLATION_MODELS[0];
  }, [selectedParadigmId]);

  // Handle cross-tenant leak probe execution
  const runSecurityProbe = (vectorId: string) => {
    setActiveVectorId(vectorId);
    let target = 'tenant-stark';
    let testVectorName = 'URL Path Parameter Tampering (/api/v1/tenants/stark/financials)';
    let mitigation = 'Spring WebFilter AST Header Assertion';

    if (vectorId === 'vector-sql-injection') {
      target = 'tenant-cyberdyne';
      testVectorName = "SQL Injection Payload (' OR 1=1; SELECT * FROM accounts WHERE tenant_id = 'tenant-cyberdyne')";
      mitigation = 'PostgreSQL FORCE ROW LEVEL SECURITY Kernel Policy';
    } else if (vectorId === 'vector-jwt-forgery') {
      target = 'tenant-stark';
      testVectorName = 'Forged RS256 JWT Token with Invalid Kid Header';
      mitigation = 'Envoy Edge SPIFFE mTLS & JWKS Signature Gate';
    }

    const result: SecurityProbeResult = {
      probeId: `probe_${Date.now().toString(36)}`,
      testVector: testVectorName,
      attemptedTenant: activeTenant.id,
      targetTenant: target,
      status: 'INTERCEPTED',
      httpStatus: 403,
      executionTimeMs: 0.14,
      mitigationLayer: mitigation,
      auditLogMessage: `CRITICAL SEC_ALERT: Client ${activeTenant.name} (${activeTenant.id}) attempted unauthorized cross-tenant traversal to ${target}. Operation aborted with HTTP 403 Forbidden.`
    };
    setProbeResult(result);
  };

  const handleCopyRfc = () => {
    const report = `# RFC: Multi-Tenant Row-Level Security & Cryptographic Isolation
Status: Production Enforced (ADR-026)
Active Tenant: ${activeTenant.name} [${activeTenant.tier}]
Allocated RPS: ${activeTenant.allocatedRps} RPS | Region: ${activeTenant.region}
KMS CMK Key ARN: ${activeTenant.kmsKeyId}

Paradigm: ${activeParadigm.name} [${activeParadigm.badge}]
Category: ${activeParadigm.category}
Isolation Overhead: ${activeParadigm.isolationLatency}
Leak Prevention SLA: ${activeParadigm.leakPreventionGuarantee}
Blast Radius Boundary: ${activeParadigm.blastRadiusContainment}

Mathematical Algorithm & Invariant:
  Formula: ${activeParadigm.algorithmFormula}
  Invariant: "${activeParadigm.architecturalInvariant}"

Workflow Phases & Security Invariants:
${activeParadigm.workflowPhases.map((p, idx) => `  ${idx + 1}. [${p.name}] ${p.description}\n     Invariant: ${p.invariants}`).join('\n')}

Production Outcomes:
${Object.entries(activeParadigm.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`).join('\n')}

Implementation Blueprint:
\`\`\`sql
${activeParadigm.specCode}
\`\`\`
Generated via Meena Kannan Architecture Portfolio Suite.`;

    navigator.clipboard.writeText(report);
    setCopyFeedback('Copied RFC Report to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const copySpecCode = () => {
    navigator.clipboard.writeText(activeParadigm.specCode);
    setCopyFeedback('Copied Specification Code to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Compute noisy-neighbor metrics
  const isThrottled = burstRps > activeTenant.allocatedRps;
  const throttleRatio = isThrottled
    ? Math.min(100, Math.round(((burstRps - activeTenant.allocatedRps) / burstRps) * 100))
    : 0;

  return (
    <div className="w-full bg-[#06090e] border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 text-slate-200 font-sans shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge & Meta Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ADR-026: Multi-Tenant RLS & Cryptographic Isolation
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Engine 26 of 26
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SOC2 Type II & ITAR Compliant
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
            Distributed Multi-Tenant Row-Level Security & Cryptographic Isolation
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Simulate kernel-level PostgreSQL session RLS, dynamic schema-per-tenant routing, AWS KMS envelope encryption with crypto-shredding, active cross-tenant leak intrusion probes, and noisy-neighbor weighted token buckets.
          </p>
        </div>

        {/* 1-Click RFC Copy Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyRfc}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopyRfc();
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Copy Multi-Tenant Isolation RFC Report"
          >
            <span>[ Copy Isolation RFC ]</span>
          </button>
        </div>
      </div>

      {copyFeedback && (
        <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono rounded text-center animate-fade-in relative z-20">
          {copyFeedback}
        </div>
      )}

      {/* Tenant Context Selector Strip */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Active Tenant Context:
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              SET LOCAL app.current_tenant = &apos;{activeTenant.id}&apos;
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Region: <span className="text-slate-200">{activeTenant.region}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOCK_TENANTS.map((tenant) => {
            const isSelected = tenant.id === selectedTenantId;
            return (
              <div
                key={tenant.id}
                onClick={() => setSelectedTenantId(tenant.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTenantId(tenant.id);
                  }
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold font-mono ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {tenant.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      tenant.tier === 'Mission-Critical'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {tenant.tier}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>Schema: <span className="text-slate-300">{tenant.schema}</span></div>
                  <div>SLA Quota: <span className="text-emerald-400 tabular-nums">{tenant.allocatedRps} RPS</span></div>
                  <div>Rows: <span className="text-slate-300 tabular-nums">{tenant.activeRowsCount.toLocaleString()}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paradigm Architecture Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 relative z-10">
        {TENANT_ISOLATION_MODELS.map((m) => {
          const isSelected = m.id === selectedParadigmId;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedParadigmId(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedParadigmId(m.id);
                }
              }}
              className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/70 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              aria-label={`Select paradigm ${m.name}`}
            >
              <span>{m.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Simulation Display */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Interactive Visualizer & Topology */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub-simulator depending on active paradigm */}
          {selectedParadigmId === 'postgres-rls-session-context' && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PostgreSQL Kernel Query Planner Transparent Filter Rewrite
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Overhead: <span className="text-emerald-400 font-bold tabular-nums">0.31ms</span>
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 mb-1">// 1. Developer Application Query (Missing WHERE tenant_id):</div>
                  <div className="text-cyan-300">
                    SELECT id, account_name, balance, created_at FROM accounts;
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-emerald-400 mb-1">// 2. PostgreSQL Kernel Executed AST (Post-Security Policy Rewrite):</div>
                  <div className="text-emerald-200 font-bold">
                    SELECT id, account_name, balance, created_at FROM accounts<br />
                    WHERE tenant_id = current_setting(&apos;app.current_tenant&apos;)::uuid;
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Active Context: <span className="text-emerald-300">{activeTenant.id}</span> ({activeTenant.name})
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-slate-400 text-[11px] font-bold">PostgreSQL Execution Plan (EXPLAIN ANALYZE):</div>
                  <div className="text-[11px] text-slate-300">
                    -&gt; Bitmap Heap Scan on accounts (cost=4.25..128.40 rows=152 width=72)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;Recheck Cond: (tenant_id = &apos;{activeTenant.id}&apos;::uuid)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;Filter: (tenant_id = &apos;{activeTenant.id}&apos;::uuid)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;Rows Removed by Filter: 0 (Foreign rows pruned in B-Tree index scan)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;Planning Time: <span className="text-emerald-400 tabular-nums">0.082 ms</span> | Execution Time: <span className="text-emerald-400 tabular-nums">0.245 ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedParadigmId === 'dynamic-schema-per-tenant' && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  HikariCP Multi-Tenant Connection Router &amp; Namespace Isolation
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Active Schema: <span className="text-cyan-300 font-bold">{activeTenant.schema}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MOCK_TENANTS.map((t) => {
                  const isActive = t.id === selectedTenantId;
                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-lg border text-xs font-mono ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-slate-200">{t.schema}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Catalog Namespace</div>
                      <div className="mt-2 text-[11px] text-cyan-300">
                        {isActive ? 'Active Hikari Route' : 'Idle Connection Pool'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                <div className="text-slate-400 font-bold">Catalog Namespace Isolation Properties:</div>
                <div>+ Dedicated PostgreSQL Search Path: <span className="text-cyan-300">{activeTenant.schema}, public</span></div>
                <div>+ Localized DDL Migration Status: <span className="text-emerald-400">V14_add_audit_indexes (APPLIED)</span></div>
                <div>+ Noisy-Neighbor Index Contention: <span className="text-emerald-400">0.00% (Independent tablespaces)</span></div>
                <div>+ Point-in-Time Restore Scope: <span className="text-slate-200">pg_dump -n {activeTenant.schema}</span></div>
              </div>
            </div>
          )}

          {selectedParadigmId === 'kms-envelope-encryption' && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  AWS KMS Customer Managed Key (CMK) Envelope Encryption
                </span>
                <button
                  onClick={() => setIsKmsKeyActive(!isKmsKeyActive)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsKmsKeyActive(!isKmsKeyActive);
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isKmsKeyActive
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/40 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20'
                  }`}
                >
                  {isKmsKeyActive ? '[ Simulate Crypto-Shred (Revoke CMK) ]' : '[ Re-enable CMK Key ]'}
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tenant CMK Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      isKmsKeyActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/60 animate-pulse'
                    }`}
                  >
                    {isKmsKeyActive ? 'ENABLED (Cryptographic Access Permitted)' : 'REVOKED (Crypto-Shredded / GDPR Erased)'}
                  </span>
                </div>
                <div className="text-slate-400 break-all">
                  Key ARN: <span className="text-amber-300">{activeTenant.kmsKeyId}</span>
                </div>
                <div className="text-slate-400">
                  Ephemeral DEK: <span className="text-slate-300">256-bit AES-GCM (Zeroed in RAM after encryption)</span>
                </div>
                <div className="text-slate-400">
                  AAD Context: <span className="text-emerald-400 font-bold">&#123;&quot;tenant_id&quot;: &quot;{activeTenant.id}&quot;&#125;</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400 font-bold">Decryption Outcome Under Current CMK State:</div>
                {isKmsKeyActive ? (
                  <div className="text-emerald-400 font-bold">
                    + DEK Decrypted via KMS HSM in 11.2ms -&gt; AES-NI Local Decryption in 12 microseconds (Plaintext Restored)
                  </div>
                ) : (
                  <div className="text-rose-400 font-bold">
                    - KMS:KmsKeyDisabledException: CMK is Disabled. 100% of tenant records across all backups permanently unreadable (Crypto-Shredded).
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedParadigmId === 'cross-tenant-leak-probe' && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  Active Cross-Tenant Intrusion Probe &amp; AST Interception
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Zero False Negatives
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Select Penetration Attack Vector to Inject:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => runSecurityProbe('vector-url-tampering')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        runSecurityProbe('vector-url-tampering');
                      }
                    }}
                    className={`p-2 rounded border text-[11px] font-mono text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      activeVectorId === 'vector-url-tampering'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    1. URL ID Tampering
                  </button>
                  <button
                    onClick={() => runSecurityProbe('vector-sql-injection')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        runSecurityProbe('vector-sql-injection');
                      }
                    }}
                    className={`p-2 rounded border text-[11px] font-mono text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      activeVectorId === 'vector-sql-injection'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    2. SQL AST Injection
                  </button>
                  <button
                    onClick={() => runSecurityProbe('vector-jwt-forgery')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        runSecurityProbe('vector-jwt-forgery');
                      }
                    }}
                    className={`p-2 rounded border text-[11px] font-mono text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      activeVectorId === 'vector-jwt-forgery'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    3. Forged JWT Token
                  </button>
                </div>
              </div>

              {probeResult && (
                <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Status: {probeResult.status} ({probeResult.httpStatus} Forbidden)
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      Intercepted in {probeResult.executionTimeMs}ms
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Attack Vector: <span className="text-rose-300 font-bold">{probeResult.testVector}</span>
                  </div>
                  <div className="text-slate-400">
                    Mitigation Guard: <span className="text-emerald-400">{probeResult.mitigationLayer}</span>
                  </div>
                  <div className="p-2 bg-slate-950/80 rounded border border-rose-900/50 text-[11px] text-slate-300 leading-relaxed font-mono">
                    {probeResult.auditLogMessage}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedParadigmId === 'tenant-noisy-neighbor-qos' && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  Distributed Weighted Token Bucket Noisy-Neighbor Isolation
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  SLA Ceiling: <span className="text-purple-300 font-bold tabular-nums">{activeTenant.allocatedRps} RPS</span>
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Simulated Tenant Surge Traffic:</span>
                  <span className="text-emerald-400 font-bold tabular-nums text-sm">{burstRps} RPS</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={burstRps}
                  onChange={(e) => setBurstRps(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                  aria-label="Simulated Tenant Traffic Surge Slider"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>50 RPS (Normal)</span>
                  <span>{activeTenant.allocatedRps} RPS (Tenant Quota Ceiling)</span>
                  <span>1500 RPS (Severe Burst)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="text-slate-400 mb-1">Active Tenant Throttle Rate:</div>
                  <div className={`text-base font-bold tabular-nums ${isThrottled ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isThrottled ? `${throttleRatio}% Dropped (HTTP 429)` : '0% Dropped (100% Ingress Allowed)'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {isThrottled ? 'Excess requests shed at Envoy edge gateway' : 'Within provisioned tier capacity'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="text-slate-400 mb-1">Neighboring Tenants Latency Impact:</div>
                  <div className="text-base font-bold text-emerald-400 tabular-nums">
                    0.00% Degradation (38ms P99)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Co-tenant connection pools 100% protected
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Phases & Security Invariants */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Execution Lifecycle &amp; Security Invariants:
            </h4>
            <div className="space-y-2">
              {activeParadigm.workflowPhases.map((phase, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{phase.name}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed ml-7">
                    {phase.description}
                  </p>
                  <div className="mt-1.5 ml-7 text-[10px] text-emerald-400/90 font-mono">
                    Security Invariant: {phase.invariants}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invariant Metrics & Code Specification */}
        <div className="lg:col-span-5 space-y-6">
          {/* Production Outcomes Card */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Architectural Invariants &amp; Verified SLAs:
            </h4>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-300 leading-relaxed">
              <span className="font-bold text-emerald-400">Core Invariant:</span> {activeParadigm.architecturalInvariant}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">ISOLATION LATENCY</span>
                <span className="text-emerald-400 font-bold tabular-nums">{activeParadigm.isolationLatency}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LEAK PREVENTION</span>
                <span className="text-cyan-400 font-bold tabular-nums">{activeParadigm.leakPreventionGuarantee}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {Object.entries(activeParadigm.productionOutcomes).map(([label, val]) => (
                <div key={label} className="text-xs font-mono flex items-start justify-between gap-2">
                  <span className="text-slate-400 shrink-0">{label}:</span>
                  <span className="text-white text-right font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Specification Inspector */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Production Implementation Spec:
              </h4>
              <button
                onClick={copySpecCode}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copySpecCode();
                  }
                }}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10"
              >
                [ Copy Code ]
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
              <code>{activeParadigm.specCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantIsolationSandbox;
