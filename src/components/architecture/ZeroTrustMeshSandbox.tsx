import { useState } from 'react';
import {
  MOCK_WORKLOADS,
  ZERO_TRUST_MESH_MODELS,
  type WorkloadIdentityProfile,
  type ServiceMeshModel
} from '@/data/zeroTrustMeshModels';

export function ZeroTrustMeshSandbox() {
  const [activeParadigmId, setActiveParadigmId] = useState<string>(ZERO_TRUST_MESH_MODELS[0].id);
  const [activeWorkloadId, setActiveWorkloadId] = useState<string>(MOCK_WORKLOADS[0].id);
  const [handshakeStep, setHandshakeStep] = useState<number>(4);
  const [isRotatingCert, setIsRotatingCert] = useState<boolean>(false);
  const [svidRemainingMinutes, setSvidRemainingMinutes] = useState<number>(48);
  const [securityProbeResult, setSecurityProbeResult] = useState<{
    status: 'ALLOWED' | 'DENIED';
    caller: string;
    targetPath: string;
    httpCode: number;
    reason: string;
  } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const activeParadigm: ServiceMeshModel =
    ZERO_TRUST_MESH_MODELS.find((m) => m.id === activeParadigmId) || ZERO_TRUST_MESH_MODELS[0];
  const activeWorkload: WorkloadIdentityProfile =
    MOCK_WORKLOADS.find((w) => w.id === activeWorkloadId) || MOCK_WORKLOADS[0];

  const handleSimulateRotation = () => {
    setIsRotatingCert(true);
    setTimeout(() => {
      setSvidRemainingMinutes(60);
      setIsRotatingCert(false);
      setCopyFeedback('Rotated SVID: New 60-min X.509 certificate loaded into Envoy memory!');
      setTimeout(() => setCopyFeedback(null), 3000);
    }, 750);
  };

  const handleTestProbe = (authorized: boolean) => {
    if (authorized) {
      setSecurityProbeResult({
        status: 'ALLOWED',
        caller: 'spiffe://prod.internal/ns/commerce/sa/order-saga-sa',
        targetPath: '/v1/payments/authorize',
        httpCode: 200,
        reason: 'Matches AuthorizationPolicy: source principal verified via mTLS and path is permitted.'
      });
    } else {
      setSecurityProbeResult({
        status: 'DENIED',
        caller: 'spiffe://prod.internal/ns/untrusted/sa/anonymous-pod-sa',
        targetPath: '/v1/vault/keys/export',
        httpCode: 403,
        reason: 'RBAC Policy Violation: Source principal not in allowed list; lateral traversal blocked.'
      });
    }
  };

  const handleCopyRfc = () => {
    const report = `# RFC: Distributed Zero-Trust Service Mesh & Envoy SPIFFE/SPIRE Mutual TLS
Status: Production Enforced (ADR-027)
Active Workload: ${activeWorkload.name}
SPIFFE ID: ${activeWorkload.spiffeId}
Trust Domain: ${activeWorkload.trustDomain} | Namespace: ${activeWorkload.namespace}
Cipher Suite: ${activeWorkload.cipherSuite}

Selected Model: ${activeParadigm.name} [${activeParadigm.badge}]
Category: ${activeParadigm.category}
Handshake Overhead: ${activeParadigm.handshakeLatency}
Verification SLA: ${activeParadigm.identityVerificationSla}
Blast Radius Boundary: ${activeParadigm.blastRadiusContainment}

Mathematical Formula:
  ${activeParadigm.algorithmFormula}

Architectural Invariant:
"${activeParadigm.architecturalInvariant}"

Workflow Phases:
${activeParadigm.workflowPhases.map((p, idx) => `  ${idx + 1}. [${p.name}] ${p.description}\n     Invariant: ${p.invariants}`).join('\n')}

Production Outcomes:
${Object.entries(activeParadigm.productionOutcomes).map(([k, v]) => `  + ${k}: ${v}`).join('\n')}

Implementation Blueprint:
\`\`\`yaml
${activeParadigm.specCode}
\`\`\`
Generated via Meena Kannan Architecture Portfolio Suite.`;

    navigator.clipboard.writeText(report);
    setCopyFeedback('Copied Zero-Trust RFC to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const copySpecCode = () => {
    navigator.clipboard.writeText(activeParadigm.specCode);
    setCopyFeedback('Copied Implementation Blueprint!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-4 sm:p-6 lg:p-8 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              ENGINE 27 | ZERO-TRUST SERVICE MESH & SPIFFE
            </span>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-[10px] font-mono">
              mTLS 1.3 Strict
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white tracking-tight">
            Distributed Zero-Trust Service Mesh & Envoy SPIFFE/SPIRE Mutual TLS
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Cryptographic workload attestation without static secrets, bidirectional Envoy TLS 1.3 sidecar validation with SPIFFE Subject Alternative Names, dynamic method-scoped AuthorizationPolicies, and zero-trust egress filtering.
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
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Copy Zero-Trust Service Mesh RFC Report"
          >
            <span>[ Copy Service Mesh RFC ]</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {copyFeedback && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono text-center animate-fade-in">
          {copyFeedback}
        </div>
      )}

      {/* Paradigm Selector Bar */}
      <div className="mt-6 flex flex-wrap gap-2 relative z-10">
        {ZERO_TRUST_MESH_MODELS.map((p) => {
          const isSelected = p.id === activeParadigmId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveParadigmId(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveParadigmId(p.id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{p.name}</span>
              <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                {p.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Workload Context Picker */}
      <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60 text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">Active Workload Context:</span>
            <span>Select target workload pod to evaluate cryptographic attestation:</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Trust Domain: <span className="text-slate-300 font-bold">{activeWorkload.trustDomain}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOCK_WORKLOADS.map((w) => {
            const isSelected = w.id === activeWorkloadId;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWorkloadId(w.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveWorkloadId(w.id);
                  }
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono text-cyan-300">{w.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    ns: {w.namespace}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate" title={w.spiffeId}>
                  {w.spiffeId}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  Cipher: <span className="text-slate-400">{w.cipherSuite.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Simulation Dashboard: 2-Column Split */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Handshake Sequencer & SVID Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mutual TLS 1.3 Handshake Sequencer */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Live Bidirectional mTLS 1.3 Handshake
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setHandshakeStep(s => Math.max(1, s - 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  &larr; Prev
                </button>
                <span className="text-cyan-400 px-1 font-bold">Step {handshakeStep} of 4</span>
                <button
                  onClick={() => setHandshakeStep(s => Math.min(4, s + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>

            {/* Handshake Visual Steps */}
            <div className="space-y-2 text-xs font-mono">
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  handshakeStep >= 1
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">1. Client Hello (ALPN: h2, TLS 1.3 KeyShare)</span>
                  <span className="text-[10px] text-cyan-400">0.24ms</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Originating Envoy generates ephemeral X25519 key share; enforces TLS 1.3 minimum.
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  handshakeStep >= 2
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">2. Server Hello & Certificate (Presents Server SVID)</span>
                  <span className="text-[10px] text-cyan-400">0.31ms</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Target Envoy responds with server X.509 SVID and sends CertificateRequest.
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  handshakeStep >= 3
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">3. Client SVID Verification & Finished</span>
                  <span className="text-[10px] text-cyan-400">0.38ms</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Client presents client SVID; server validates CA trust chain and SPIFFE Subject Alternative Name.
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  handshakeStep >= 4
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-900/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">4. Encrypted Session Stream (AES-256-GCM Wire Protection)</span>
                  <span className="text-[10px] text-emerald-400">P99: 1.15ms</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Authenticated symmetric session established; zero plaintext exposed across cluster network.
                </div>
              </div>
            </div>
          </div>

          {/* SVID Ephemeral Certificate Details & Auto-Rotation */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase tracking-wider">
                Ephemeral X.509 SVID Certificate Status
              </span>
              <button
                onClick={handleSimulateRotation}
                disabled={isRotatingCert}
                className="px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 transition-all cursor-pointer font-bold disabled:opacity-50"
              >
                {isRotatingCert ? '[ Rotating SVID... ]' : '[ Trigger SVID Rotation ]'}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-slate-800/80 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">URI SAN:</span>
                <span className="text-cyan-300 font-bold">{activeWorkload.spiffeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Account:</span>
                <span className="text-slate-300">{activeWorkload.serviceAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issuer CA:</span>
                <span className="text-slate-400">spire-server.internal (ECDSA P-256)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Expiry Lifespan:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${(svidRemainingMinutes / 60) * 100}%` }}
                    />
                  </div>
                  <span className="text-cyan-300 font-bold">{svidRemainingMinutes}m remaining</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">In-Memory Hot Reload:</span>
                <span className="text-emerald-400">Enabled (Zero socket drops)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Zero-Trust RBAC & Intrusion Interception Probe */}
        <div className="lg:col-span-5 space-y-6">
          {/* Zero-Trust RBAC Probe */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                Least-Privilege RBAC Policy Evaluation
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Inject authorized vs unauthorized requests to test Envoy sidecar enforcement:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleTestProbe(true)}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                [ Test Permitted Call ]
              </button>
              <button
                onClick={() => handleTestProbe(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                [ Inject Lateral Intrusion ]
              </button>
            </div>

            {securityProbeResult && (
              <div
                className={`p-3 rounded-lg border font-mono text-xs space-y-1.5 animate-fade-in ${
                  securityProbeResult.status === 'ALLOWED'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>
                    {securityProbeResult.status === 'ALLOWED'
                      ? 'HTTP 200 OK - PERMITTED'
                      : 'HTTP 403 FORBIDDEN - BLOCKED'}
                  </span>
                  <span>{securityProbeResult.status}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Caller: <span className="text-slate-300 truncate">{securityProbeResult.caller}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Endpoint: <span className="text-slate-300">{securityProbeResult.targetPath}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 border-t border-slate-800/60 pt-1">
                  {securityProbeResult.reason}
                </div>
              </div>
            )}
          </div>

          {/* Model Specification Metrics */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs space-y-2">
            <span className="font-bold text-white uppercase tracking-wider block">
              Architectural Invariant & Metrics
            </span>
            <div className="p-2.5 rounded bg-black/40 border border-slate-800/60 text-slate-300 text-[11px] leading-relaxed italic">
              &quot;{activeParadigm.architecturalInvariant}&quot;
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                <span className="text-slate-500 block">Verification SLA:</span>
                <span className="text-cyan-300 font-bold">{activeParadigm.identityVerificationSla}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                <span className="text-slate-500 block">Handshake Latency:</span>
                <span className="text-emerald-300 font-bold">{activeParadigm.handshakeLatency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Blueprint & Spec Viewer */}
      <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">
              Implementation Blueprint:
            </span>
            <span className="text-slate-400">{activeParadigm.name}</span>
          </div>
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
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer font-bold"
          >
            [ Copy YAML / Blueprint ]
          </button>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-[#050810] border border-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 leading-relaxed touch-scroll">
          <pre>{activeParadigm.specCode}</pre>
        </div>
      </div>
    </div>
  );
}
export default ZeroTrustMeshSandbox;
