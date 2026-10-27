import React, { useState, useMemo } from 'react';
import {
  FEATURE_FLAG_MODELS,
  INITIAL_COHORTS,
  type CanaryTargetCohort
} from '../../data/featureFlagModels';

// Pure JavaScript MurmurHash3 32-bit implementation for deterministic in-browser evaluation
function computeMurmurHash3(key: string, seed: number = 0x9747b28c): number {
  let h1 = seed;
  const remainder = key.length & 3;
  const bytes = key.length - remainder;

  for (let i = 0; i < bytes; i += 4) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = Math.imul(k1, 0xcc9e2d51);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, 0x1b873593);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  let k1 = 0;
  if (remainder >= 3) {
    k1 ^= (key.charCodeAt(bytes + 2) & 0xff) << 16;
  }
  if (remainder >= 2) {
    k1 ^= (key.charCodeAt(bytes + 1) & 0xff) << 8;
  }
  if (remainder >= 1) {
    k1 ^= key.charCodeAt(bytes) & 0xff;
    k1 = Math.imul(k1, 0xcc9e2d51);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, 0x1b873593);
    h1 ^= k1;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

export const FeatureFlagSandbox: React.FC = () => {
  const [selectedParadigmId, setSelectedParadigmId] = useState<string>('murmurhash3-consistent-bucketing');
  const [rolloutPercent, setRolloutPercent] = useState<number>(25);
  const [probeUserId, setProbeUserId] = useState<string>('user_9921_vip');
  const [flagKey] = useState<string>('billing.v2.instant-checkout');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Canary splitter state
  const [canaryWeight, setCanaryWeight] = useState<number>(10);
  const [canaryErrorRate, setCanaryErrorRate] = useState<number>(0.04);
  const [circuitTripped, setCircuitTripped] = useState<boolean>(false);
  const [cohorts] = useState<CanaryTargetCohort[]>(INITIAL_COHORTS);

  const activeParadigm = FEATURE_FLAG_MODELS.find(p => p.id === selectedParadigmId) || FEATURE_FLAG_MODELS[0];

  // Evaluate user bucket deterministically
  const userEvaluation = useMemo(() => {
    const compositeKey = `${flagKey}:${probeUserId}`;
    const hash = computeMurmurHash3(compositeKey);
    const bucket = hash % 100;
    const isEnabled = bucket < rolloutPercent;

    return {
      hashHex: '0x' + hash.toString(16).toUpperCase().padStart(8, '0'),
      bucket,
      isEnabled,
      variant: isEnabled ? 'TREATMENT_V2 (Streaming)' : 'CONTROL_V1 (Baseline)'
    };
  }, [flagKey, probeUserId, rolloutPercent]);

  // Inject Canary Error Spike to demonstrate automatic circuit trip
  const handleInjectCanaryErrorSpike = () => {
    setCanaryErrorRate(4.82);
    setTimeout(() => {
      setCircuitTripped(true);
      setCanaryWeight(0);
    }, 180);
  };

  // Reset Canary Circuit
  const handleResetCanaryCircuit = () => {
    setCircuitTripped(false);
    setCanaryErrorRate(0.04);
    setCanaryWeight(10);
  };

  // Clipboard Helpers
  const showCopiedToast = (label: string) => {
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleCopyRfc = () => {
    const rfcMarkdown = `# Architectural RFC: Distributed Dynamic Feature Flagging & Canary Traffic Splitter
## Model: ${activeParadigm.name}
- Category: ${activeParadigm.category}
- Evaluation Latency: ${activeParadigm.evaluationLatency}
- Rollback Guarantee: ${activeParadigm.rollbackGuarantee}
- Algorithm Formula: ${activeParadigm.algorithmFormula}
- Uniformity: ${activeParadigm.distributionUniformity}

### Architectural Description
${activeParadigm.description}

### Production Outcomes & SLA Invariants
${Object.entries(activeParadigm.productionOutcomes).map(([k, v]) => `* ${k}: ${v}`).join('\n')}

### Core Architectural Invariant
"${activeParadigm.architecturalInvariant}"

### Workflow Phases
${activeParadigm.workflowPhases.map(p => `* [${p.name}] ${p.description} -> Invariant: ${p.invariants}`).join('\n')}

### Production Implementation Reference
\`\`\`
${activeParadigm.specCode}
\`\`\`
`;
    navigator.clipboard.writeText(rfcMarkdown);
    showCopiedToast('RFC Spec Copied to Clipboard!');
  };

  const handleCopyConfigJson = () => {
    const config = {
      flagKey,
      rolloutPercentage: rolloutPercent,
      canary: {
        weight: canaryWeight,
        errorRate: canaryErrorRate,
        circuitTripped
      },
      userProbe: {
        userId: probeUserId,
        hashHex: userEvaluation.hashHex,
        bucket: userEvaluation.bucket,
        variant: userEvaluation.variant
      },
      cohorts
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    showCopiedToast('Flag Config JSON Copied!');
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Engine 25 - Dynamic Feature Management
              </span>
              <span className="text-xs text-slate-500 font-mono">RFC-OPENFEATURE-CANARY</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Distributed Dynamic Feature Flagging & Canary Splitter
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive simulation of consistent MurmurHash3 percentage bucketing, OpenFeature multi-attribute rule evaluation, and canary circuit rollbacks.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyRfc}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Copy Architectural RFC to clipboard"
            >
              <span>Copy RFC Spec</span>
            </button>
            <button
              onClick={handleCopyConfigJson}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1.5"
              title="Export configuration JSON"
            >
              <span>Export Config</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {copyFeedback && (
          <div className="mt-3 py-1 px-3 rounded text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block animate-fade-in">
            {copyFeedback}
          </div>
        )}

        {/* Paradigm Switcher Tabs */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-thin">
          {FEATURE_FLAG_MODELS.map(paradigm => {
            const isSelected = paradigm.id === selectedParadigmId;
            return (
              <button
                key={paradigm.id}
                onClick={() => setSelectedParadigmId(paradigm.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {paradigm.name.split(' ')[0]} {paradigm.name.split(' ')[1]}
              </button>
            );
          })}
        </div>

        {/* Active Paradigm Overview Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Evaluation Latency</span>
            <span className="text-emerald-400 font-semibold">{activeParadigm.evaluationLatency}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Rollback Guarantee</span>
            <span className="text-cyan-400 font-semibold">{activeParadigm.rollbackGuarantee}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Algorithm Formula</span>
            <span className="text-white font-semibold truncate block" title={activeParadigm.algorithmFormula}>
              {activeParadigm.algorithmFormula}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Uniformity Proof</span>
            <span className="text-indigo-300 font-semibold truncate block" title={activeParadigm.distributionUniformity}>
              {activeParadigm.distributionUniformity}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: MurmurHash3 Bucketing & Canary Traffic Splitter (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* MurmurHash3 Percentage Bucketing Playground */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Consistent Percentage Rollout
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Flag: {flagKey}
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-400 font-bold">
                {rolloutPercent}% Enabled
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>0% (Kill-Switch)</span>
                <span className="text-white font-bold text-sm">{rolloutPercent}% Rollout</span>
                <span>100% (Full GA)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={rolloutPercent}
                onChange={(e) => setRolloutPercent(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>

            {/* 10-Segment Bucket Visualization Bar */}
            <div className="grid grid-cols-10 gap-1 mb-5">
              {Array.from({ length: 10 }).map((_, idx) => {
                const bucketRangeStart = idx * 10;
                const isPartiallyOrFullyActive = rolloutPercent > bucketRangeStart;
                const isActive = rolloutPercent >= (idx + 1) * 10;

                return (
                  <div
                    key={idx}
                    className={`h-9 rounded flex flex-col items-center justify-center text-[10px] font-mono transition-all border ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : isPartiallyOrFullyActive
                        ? 'bg-cyan-950/40 border-cyan-600/40 text-cyan-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                    title={`Bucket range [${bucketRangeStart}..${bucketRangeStart + 9}]`}
                  >
                    <span>{bucketRangeStart}</span>
                  </div>
                );
              })}
            </div>

            {/* User ID Deterministic Probe Box */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Deterministic User Evaluation Probe
                </span>
                <span className="text-[10px] text-slate-500">
                  Formula: MurmurHash3(flag:userId) % 100
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={probeUserId}
                  onChange={(e) => setProbeUserId(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter custom user ID..."
                />
              </div>

              {/* Quick Chip Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-slate-400">
                <span>Presets:</span>
                {['user_9921_vip', 'dev_alpha_01', 'retail_buyer_77', 'enterprise_user_99'].map(id => (
                  <button
                    key={id}
                    onClick={() => setProbeUserId(id)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>

              {/* Probe Result Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Hash Hex</span>
                  <span className="text-indigo-300 font-semibold">{userEvaluation.hashHex}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Bucket Index</span>
                  <span className="text-white font-semibold">Bucket #{userEvaluation.bucket}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Variant</span>
                  <span className={`font-semibold ${userEvaluation.isEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {userEvaluation.variant.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Canary Splitter & Health Circuit Breaker */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Canary Ingress Splitter & Error-Budget Guard
                </h4>
                <p className="text-[11px] text-slate-400">
                  Envoy weighted cluster routing with automated 1.5% HTTP 5xx trip kill-switch
                </p>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                  circuitTripped
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {circuitTripped ? 'CIRCUIT TRIPPED (0% CANARY)' : 'CANARY HEALTHY'}
                </span>
              </div>
            </div>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Baseline Weight</span>
                <span className="text-white font-bold">{100 - canaryWeight}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Canary Weight</span>
                <span className={`font-bold ${circuitTripped ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {canaryWeight}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Canary 5xx Rate</span>
                <span className={`font-bold ${canaryErrorRate > 1.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {canaryErrorRate.toFixed(2)}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Trip Threshold</span>
                <span className="text-amber-400 font-bold">&gt; 1.50%</span>
              </div>
            </div>

            {circuitTripped && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-700/60 text-rose-300 text-xs font-mono leading-relaxed">
                AUTOMATED KILL-SWITCH ENGAGED: Canary error rate spiked to {canaryErrorRate.toFixed(2)}%, exceeding the 1.50% SLA threshold. Envoy cluster weight was patched to 0% in sub-15ms, preventing catastrophic blast radius propagation.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInjectCanaryErrorSpike}
                disabled={circuitTripped}
                className="px-3.5 py-2 rounded-lg text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all font-semibold disabled:opacity-40"
              >
                Inject Canary 500 Error Spike (4.82%)
              </button>

              {circuitTripped && (
                <button
                  onClick={handleResetCanaryCircuit}
                  className="px-3.5 py-2 rounded-lg text-xs font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 transition-all font-semibold animate-pulse"
                >
                  Reset Circuit & Restore Baseline
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Targeted Cohorts & OpenFeature Code Spec (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cohorts & Targeting Rules List */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  OpenFeature Target Cohorts
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ordered rule evaluation with priority matching
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {cohorts.map(cohort => (
                <div
                  key={cohort.cohortId}
                  className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">
                      {cohort.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {cohort.matchRatio}
                    </span>
                  </div>

                  <div className="text-[10px] text-amber-300/90 font-mono">
                    Condition: {cohort.condition}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Variant: <strong className="text-emerald-400">{cohort.assignedVariant}</strong></span>
                    <span>{cohort.activeUsersCount.toLocaleString()} Users</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Implementation Code Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Implementation Spec - {activeParadigm.name.split(' ')[0]}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeParadigm.specCode);
                  showCopiedToast('Spec Code Copied!');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Copy Code
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-80 scrollbar-thin">
              <code>{activeParadigm.specCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
