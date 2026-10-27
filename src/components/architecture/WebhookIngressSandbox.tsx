import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  KeyRound,
  History,
  RotateCcw,
  Copy,
  CheckCircle2,
  Lock,
  FileCode,
  AlertOctagon,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  WEBHOOK_INGRESS_MODELS,
  INITIAL_WEBHOOK_LOGS,
  type WebhookIngressModel,
  type WebhookDeliveryLog
} from '../../data/webhookIngressModels';

export const WebhookIngressSandbox: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>(WEBHOOK_INGRESS_MODELS[0].id);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookDeliveryLog[]>(INITIAL_WEBHOOK_LOGS);
  const [secretKey, setSecretKey] = useState<string>('whsec_prod_live_9a8b7c6d5e4f3a2b1c0d');
  const [rawPayload, setRawPayload] = useState<string>(
    JSON.stringify(
      {
        id: 'evt_3MvY8kLkdIwHu7ix',
        object: 'event',
        type: 'payment_intent.succeeded',
        created: 1793135640,
        data: {
          object: {
            id: 'pi_3MvY8kLkdIwHu7ix',
            amount: 4900,
            currency: 'usd',
            customer: 'cus_N9XvE39kd'
          }
        }
      },
      null,
      2
    )
  );
  const [timestampHeader, setTimestampHeader] = useState<number>(1793135642);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isReplayAttack, setIsReplayAttack] = useState<boolean>(false);
  const [constantTimeEnabled, setConstantTimeEnabled] = useState<boolean>(true);
  const [ingressBuffered, setIngressBuffered] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'playground' | 'logs' | 'spec'>('playground');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    status: number;
    message: string;
    computedHash: string;
    receivedHash: string;
  }>({
    valid: true,
    status: 202,
    message: 'Valid HMAC-SHA256 signature: Enqueued to Kafka webhooks.ingress.v1 (HTTP 202 Accepted)',
    computedHash: '6a8b7c9f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b',
    receivedHash: '6a8b7c9f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b'
  });

  const activeModel = useMemo<WebhookIngressModel>(() => {
    return WEBHOOK_INGRESS_MODELS.find(m => m.id === selectedModelId) || WEBHOOK_INGRESS_MODELS[0];
  }, [selectedModelId]);

  // Compute mock HMAC digest based on payload string length and secret
  const computeDigest = (content: string, secret: string, ts: number) => {
    let hash = 0;
    const combined = `${ts}.${secret}.${content}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b6a8b7c9f1e2d3c4b5a6f7e8d9c0b1a2f`.substring(0, 64);
  };

  // Recompute validation state when inputs change
  const handleVerify = () => {
    const computed = computeDigest(rawPayload, secretKey, timestampHeader);
    const received = isTampered
      ? 'f00d_tampered_payload_signature_mismatch_detected_at_gateway_9999'
      : computed;

    const now = Math.floor(Date.now() / 1000);
    const timeDelta = Math.abs(now - timestampHeader);

    if (isReplayAttack || timeDelta > 300) {
      setVerificationResult({
        valid: false,
        status: 400,
        message: 'HTTP 400 Bad Request: Webhook timestamp expired (>300s window). Replay attack intercepted.',
        computedHash: computed,
        receivedHash: received
      });
      return;
    }

    if (isTampered || computed !== received) {
      setVerificationResult({
        valid: false,
        status: 401,
        message: 'HTTP 401 Unauthorized: HMAC-SHA256 signature verification failed. Payload or secret altered.',
        computedHash: computed,
        receivedHash: received
      });
      return;
    }

    setVerificationResult({
      valid: true,
      status: 202,
      message: 'HTTP 202 Accepted: Valid HMAC-SHA256 signature. Fast-buffered to Kafka cluster in sub-1.8ms.',
      computedHash: computed,
      receivedHash: received
    });
  };

  // Inject Tampered Payload
  const handleInjectTamper = () => {
    setIsTampered(prev => !prev);
    if (!isTampered) {
      const tampered = rawPayload.replace('4900', '490000');
      setRawPayload(tampered);
      setVerificationResult({
        valid: false,
        status: 401,
        message: 'HTTP 401 Unauthorized: Attacker modified amount from 4900 to 490000. Signature mismatch detected.',
        computedHash: computeDigest(tampered, secretKey, timestampHeader),
        receivedHash: 'bad_signature_tampered_payload_intercepted'
      });
    } else {
      const restored = rawPayload.replace('490000', '4900');
      setRawPayload(restored);
      const computed = computeDigest(restored, secretKey, timestampHeader);
      setVerificationResult({
        valid: true,
        status: 202,
        message: 'HTTP 202 Accepted: Restored valid payload. Cryptographic signature matches.',
        computedHash: computed,
        receivedHash: computed
      });
    }
  };

  // Inject Replay Attack
  const handleInjectReplay = () => {
    setIsReplayAttack(prev => !prev);
    if (!isReplayAttack) {
      const expiredTs = 1793130000; // 5000+ seconds in the past
      setTimestampHeader(expiredTs);
      setVerificationResult({
        valid: false,
        status: 400,
        message: 'HTTP 400 Bad Request: Timestamp is 5,640s old. Exceeds max 300s clock skew window.',
        computedHash: computeDigest(rawPayload, secretKey, expiredTs),
        receivedHash: 'stale_nonce_replay_signature'
      });
    } else {
      const validTs = 1793135642;
      setTimestampHeader(validTs);
      const computed = computeDigest(rawPayload, secretKey, validTs);
      setVerificationResult({
        valid: true,
        status: 202,
        message: 'HTTP 202 Accepted: Timestamp freshness restored within 300s window.',
        computedHash: computed,
        receivedHash: computed
      });
    }
  };

  // Reset to Baseline
  const handleResetSandbox = () => {
    setSecretKey('whsec_prod_live_9a8b7c6d5e4f3a2b1c0d');
    setRawPayload(
      JSON.stringify(
        {
          id: 'evt_3MvY8kLkdIwHu7ix',
          object: 'event',
          type: 'payment_intent.succeeded',
          created: 1793135640,
          data: {
            object: {
              id: 'pi_3MvY8kLkdIwHu7ix',
              amount: 4900,
              currency: 'usd',
              customer: 'cus_N9XvE39kd'
            }
          }
        },
        null,
        2
      )
    );
    setTimestampHeader(1793135642);
    setIsTampered(false);
    setIsReplayAttack(false);
    setConstantTimeEnabled(true);
    setIngressBuffered(true);
    setDeliveryLogs(INITIAL_WEBHOOK_LOGS);
    const computed = computeDigest(rawPayload, 'whsec_prod_live_9a8b7c6d5e4f3a2b1c0d', 1793135642);
    setVerificationResult({
      valid: true,
      status: 202,
      message: 'Valid HMAC-SHA256 signature: Enqueued to Kafka webhooks.ingress.v1 (HTTP 202 Accepted)',
      computedHash: computed,
      receivedHash: computed
    });
  };

  // Copy RFC Report
  const copyRfcReport = () => {
    const report = `# RFC-WH-3100: Distributed Webhook Ingress & Cryptographic Signature Verification
Paradigm: ${activeModel.name} [${activeModel.badge}]
Category: ${activeModel.category}
Verification Latency: ${activeModel.verificationLatency}
Throughput SLA: ${activeModel.throughputSla}
Safety Guarantee: ${activeModel.safetyGuaranteeSla}
Formula: ${activeModel.algorithmFormula}
Architectural Invariant: "${activeModel.architecturalInvariant}"

## Ingress Invariant Verification:
* Active Secret Key: ${secretKey}
* Timestamp: ${timestampHeader} (Skew Tolerance: +/-300s)
* Constant-Time Comparison: ${constantTimeEnabled ? 'ENABLED (crypto.timingSafeEqual)' : 'DISABLED (Naive Equality)'}
* Ingress Buffering: ${ingressBuffered ? 'Kafka Partitioned Decoupling (HTTP 202)' : 'Synchronous DB RPC'}
* Tamper Status: ${isTampered ? 'TAMPERED (HTTP 401)' : 'INTEGRITY_VERIFIED'}
* Replay Status: ${isReplayAttack ? 'REPLAY_DETECTED (HTTP 400)' : 'FRESH_WINDOW'}

## Verified Outcomes:
${Object.entries(activeModel.productionOutcomes).map(([k, v]) => `* ${k}: ${v}`).join('\n')}
`;
    navigator.clipboard.writeText(report);
    setCopyFeedback('Copied Webhook Ingress RFC to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyRfc = copyRfcReport;

  // Copy Spec Code
  const copySpecCode = () => {
    navigator.clipboard.writeText(activeModel.specCode);
    setCopyFeedback('Copied Specification Code to Clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div
      id="architecture-webhook-ingress"
      className="p-6 rounded-2xl bg-[#070b12] border border-slate-800 text-slate-200 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background Neon Accent Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 font-mono text-[10px] font-bold tracking-wider border border-violet-500/30 uppercase">
              Sub-Section 31
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold tracking-wider border border-cyan-500/30">
              Constant-Time HMAC
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-editorial text-white mt-1.5 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-violet-400" />
            Distributed Webhook Ingress & Cryptographic Signature Verification
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1">
            HMAC-SHA256 constant-time verification, replay defense via timestamp tolerances and Redis nonce caches,
            asynchronous Kafka buffer decoupling, circuit-guarded fanout, and dead-letter queue re-drive consoles.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRfc}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopyRfc();
              }
            }}
            tabIndex={0}
            role="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Webhook RFC</span>
          </button>
          <button
            onClick={handleResetSandbox}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleResetSandbox();
              }
            }}
            tabIndex={0}
            role="button"
            title="Reset Webhook Ingress to Baseline"
            className="p-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copyFeedback && (
        <div className="p-2.5 rounded-lg bg-violet-500/20 border border-violet-500/50 text-violet-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Model Selector Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {WEBHOOK_INGRESS_MODELS.map(m => {
          const isSelected = m.id === selectedModelId;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedModelId(m.id);
                }
              }}
              tabIndex={0}
              role="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <span>{m.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Key Invariant Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400">
            <Lock className="w-3.5 h-3.5" />
            <span>ARCHITECTURAL INVARIANT</span>
          </div>
          <p className="text-sm font-editorial text-slate-200">
            "{activeModel.architecturalInvariant}"
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">THROUGHPUT SLA</div>
            <div className="text-xs font-bold text-violet-300">{activeModel.throughputSla}</div>
          </div>
          <div className="text-right font-mono border-l border-slate-800 pl-3">
            <div className="text-[10px] text-slate-400">VERIFICATION LATENCY</div>
            <div className="text-xs font-bold text-cyan-300">{activeModel.verificationLatency}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('playground')}
          className={`pb-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'playground'
              ? 'text-violet-400 border-b-2 border-violet-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Ingress Verification HUD</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'logs'
              ? 'text-violet-400 border-b-2 border-violet-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Delivery Audit Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`pb-2.5 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'spec'
              ? 'text-violet-400 border-b-2 border-violet-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Specification & Code</span>
        </button>
      </div>

      {/* Tab 1: Playground & Ingress HUD */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          {/* Status Result Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono ${
              verificationResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {verificationResult.valid ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wide">
                  {verificationResult.valid ? 'GATEWAY VERIFICATION: ACCEPTED' : 'GATEWAY VERIFICATION: REJECTED'}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{verificationResult.message}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                verificationResult.status === 202
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                HTTP {verificationResult.status}
              </span>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={handleInjectTamper}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleInjectTamper();
                }
              }}
              tabIndex={0}
              role="button"
              className={`p-3 rounded-xl border font-mono text-xs transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                isTampered
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">Tamper Payload</span>
                <span className={`w-2 h-2 rounded-full ${isTampered ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[11px] text-slate-400 text-left">
                {isTampered ? 'Altered $49 -> $4900' : 'Mutate 1 byte to trigger 401'}
              </p>
            </button>

            <button
              onClick={handleInjectReplay}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleInjectReplay();
                }
              }}
              tabIndex={0}
              role="button"
              className={`p-3 rounded-xl border font-mono text-xs transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                isReplayAttack
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">Replay Attack</span>
                <span className={`w-2 h-2 rounded-full ${isReplayAttack ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[11px] text-slate-400 text-left">
                {isReplayAttack ? 'Skew > 5000s (Rejected)' : 'Send stale captured packet'}
              </p>
            </button>

            <button
              onClick={() => setConstantTimeEnabled(prev => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setConstantTimeEnabled(prev => !prev);
                }
              }}
              tabIndex={0}
              role="button"
              className={`p-3 rounded-xl border font-mono text-xs transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                constantTimeEnabled
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">Constant-Time</span>
                <span className={`w-2 h-2 rounded-full ${constantTimeEnabled ? 'bg-violet-400' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[11px] text-slate-400 text-left">
                {constantTimeEnabled ? 'timingSafeEqual (Safe)' : 'Naive === (Leaks delta t)'}
              </p>
            </button>

            <button
              onClick={() => setIngressBuffered(prev => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIngressBuffered(prev => !prev);
                }
              }}
              tabIndex={0}
              role="button"
              className={`p-3 rounded-xl border font-mono text-xs transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                ingressBuffered
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">Ingress Buffer</span>
                <span className={`w-2 h-2 rounded-full ${ingressBuffered ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[11px] text-slate-400 text-left">
                {ingressBuffered ? 'Kafka Buffer (50K TPS)' : 'Sync DB Locks (Exhaustion)'}
              </p>
            </button>
          </div>

          {/* Signature Comparison Matrix */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">
                Cryptographic Signature Comparison Matrix
              </span>
              <button
                onClick={handleVerify}
                className="px-2.5 py-1 rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-verify Signatures</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>EXPECTED HMAC-SHA256 (Computed via secret):</span>
                  <span className="text-emerald-400">Matches Secret</span>
                </div>
                <div className="p-2.5 rounded bg-black/60 border border-slate-800 text-emerald-300 font-mono text-[11px] break-all select-all">
                  {verificationResult.computedHash}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>RECEIVED SIGNATURE (Header v1):</span>
                  <span className={isTampered ? 'text-rose-400' : 'text-cyan-400'}>
                    {isTampered ? 'Tampered Mismatch' : 'Matches Computed'}
                  </span>
                </div>
                <div className={`p-2.5 rounded bg-black/60 border font-mono text-[11px] break-all select-all ${
                  isTampered
                    ? 'border-rose-500/50 text-rose-300'
                    : 'border-slate-800 text-cyan-300'
                }`}>
                  {verificationResult.receivedHash}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Column: Headers + Payload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Headers Config */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="text-slate-400 uppercase text-[10px] tracking-wider flex items-center justify-between">
                <span>Webhook Ingress Headers</span>
                <span className="text-violet-400">RFC 8941 Signature Format</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Pre-Shared Signing Secret Key:</label>
                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full p-2 rounded bg-black/50 border border-slate-800 text-slate-200 text-xs font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Stripe-Signature Timestamp (t):</label>
                  <input
                    type="number"
                    value={timestampHeader}
                    onChange={(e) => setTimestampHeader(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded bg-black/50 border border-slate-800 text-slate-200 text-xs font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div className="p-2.5 rounded bg-black/30 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Clock Skew Window:</span>
                    <span className="text-emerald-400">+/- 300 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Replay Defense Nonce:</span>
                    <span className="text-cyan-400">Redis SETNX (TTL 360s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingress Path:</span>
                    <span className="text-slate-300">/api/v1/webhooks/stripe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Canonical Payload Editor */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="text-slate-400 uppercase text-[10px] tracking-wider flex items-center justify-between">
                <span>Canonical Raw Body (JSON)</span>
                <span className="text-emerald-400">Byte-for-byte UTF-8</span>
              </div>
              <textarea
                rows={9}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full p-2 rounded bg-black/50 border border-slate-800 text-slate-300 text-[11px] font-mono focus:border-violet-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Delivery Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Ingress Webhook Delivery Audit Trail (Latest 5 Events)
            </span>
            <span className="text-xs font-mono text-violet-400">
              Zero Head-of-Line Blocking
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Delivery ID</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Received Time</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-black/40">
                {deliveryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 text-slate-300 font-bold">{log.id}</td>
                    <td className="p-3 text-violet-300">{log.sourceProvider}</td>
                    <td className="p-3 text-slate-300">{log.eventType}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{log.receivedTimestamp}</td>
                    <td className="p-3 text-cyan-300">{log.latencyMs}ms</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.status === 'BUFFERED_KAFKA' || log.status === 'DELIVERED_202'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : log.status === 'SIGNATURE_INVALID_401'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Specification & Code */}
      {activeTab === 'spec' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {activeModel.name} - Implementation Specification
            </span>
            <button
              onClick={copySpecCode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-slate-800 overflow-x-auto">
            <pre className="text-xs font-mono text-violet-300 leading-relaxed">
              <code>{activeModel.specCode}</code>
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {Object.entries(activeModel.productionOutcomes).map(([metric, value]) => (
              <div key={metric} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 font-mono">
                <div className="text-[10px] text-slate-400 uppercase">{metric}</div>
                <div className="text-xs text-slate-200 mt-0.5 font-bold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
