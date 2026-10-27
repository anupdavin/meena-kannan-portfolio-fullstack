import { useState, useMemo, useEffect } from 'react'
import {
  Activity,
  Server,
  Copy,
  Check,
  Code,
  Radio,
  Clock
} from 'lucide-react'
import { KAFKA_TOPIC_STREAMS, type KafkaTopicStream, type KafkaPartition } from '@/data/kafkaStreams'

export default function KafkaStreamMonitor() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(KAFKA_TOPIC_STREAMS[0].topicId)
  const [selectedPartitionId, setSelectedPartitionId] = useState<number>(0)
  const [isSimulatingStream, setIsSimulatingStream] = useState<boolean>(true)
  const [copiedRfc, setCopiedRfc] = useState<boolean>(false)
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false)
  const [streamTick, setStreamTick] = useState<number>(0)

  const currentTopic: KafkaTopicStream = useMemo(() => {
    return KAFKA_TOPIC_STREAMS.find(t => t.topicId === selectedTopicId) || KAFKA_TOPIC_STREAMS[0]
  }, [selectedTopicId])

  const selectedPartition: KafkaPartition = useMemo(() => {
    return currentTopic.partitions.find(p => p.partitionId === selectedPartitionId) || currentTopic.partitions[0]
  }, [currentTopic, selectedPartitionId])

  const totalTopicLag = useMemo(() => {
    return currentTopic.partitions.reduce((acc, p) => acc + p.lag, 0)
  }, [currentTopic])

  // Live event generator tick
  useEffect(() => {
    if (!isSimulatingStream) return
    const interval = setInterval(() => {
      setStreamTick(prev => (prev + 1) % 1000000)
    }, 1200)
    return () => clearInterval(interval)
  }, [isSimulatingStream])

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId)
    setSelectedPartitionId(0)
  }

  const handleCopyRfc = () => {
    const rfcMarkdown = [
      `# Kafka Topic Architecture Specification: ${currentTopic.title}`,
      '',
      `**Topic Name:** \`${currentTopic.topicId}\``,
      `**Target System:** ${currentTopic.systemName}`,
      `**Category:** ${currentTopic.category}`,
      `**Governing ADR:** ${currentTopic.governingAdr}`,
      '',
      '## Topology & Partition Invariants',
      `- Partitions: ${currentTopic.partitionsCount}`,
      `- Replication Factor: ${currentTopic.replicationFactor}`,
      `- Cleanup Policy: ${currentTopic.cleanupPolicy}`,
      `- Retention: ${currentTopic.retentionHours} hours`,
      `- Compression: ${currentTopic.compressionType}`,
      `- Target Throughput: ${currentTopic.targetThroughputTps}`,
      `- P99 Publish Latency: ${currentTopic.p99PublishLatency}`,
      '',
      '## Consumer Groups & Lag Status',
      '| Consumer Group ID | Protocol | State | Members | Total Lag |',
      '| :--- | :--- | :--- | :--- | :--- |',
      ...currentTopic.consumerGroups.map(cg =>
        `| \`${cg.groupId}\` | \`${cg.protocol}\` | **${cg.state}** | ${cg.membersCount} | ${cg.totalLag} messages |`
      ),
      '',
      '## Partition Offsets & ISR Ledger',
      '| Partition | Leader Broker | High Watermark | Log End Offset | Consumer Offset | Lag | ISR Status |',
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
      ...currentTopic.partitions.map(p =>
        `| Partition ${p.partitionId} | \`${p.leaderBroker}\` | ${p.highWatermark} | ${p.logEndOffset} | ${p.consumerOffset} | ${p.lag} | ${p.inSync ? 'IN_SYNC' : 'DEGRADED'} |`
      ),
      '',
      '## Architecture Description',
      currentTopic.summary
    ].join('\n')

    navigator.clipboard.writeText(rfcMarkdown)
    setCopiedRfc(true)
    setTimeout(() => setCopiedRfc(false), 2000)
  }

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentTopic.sampleEventPayload.valueJson)
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  return (
    <div className="space-y-6 sm:space-y-8 rounded-2xl border border-slate-800 bg-[#070b12] p-4 sm:p-8 shadow-2xl">
      {/* 1. Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Activity className="w-3.5 h-3.5" />
          <span>KAFKA EVENT STREAMING | PARTITION LAG &amp; ISR TOPOLOGY</span>
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-editorial text-white tracking-tight">
          Kafka Event Stream &amp; Partition Lag Monitor
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed max-w-3xl">
          Real-time event stream observability across 5 enterprise architectures: high-watermark offsets,
          in-sync replica (ISR) quorums, consumer group lag telemetry, and zero-loss partition routing.
        </p>
      </div>

      {/* 2. Topic Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {KAFKA_TOPIC_STREAMS.map(stream => (
          <button
            key={stream.topicId}
            onClick={() => handleSelectTopic(stream.topicId)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedTopicId === stream.topicId
                ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-slate-950/50 border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/10'
            }`}
            aria-label={`Select topic: ${stream.topicId}`}
          >
            <div className={`text-xs font-mono font-bold mb-1 truncate ${
              selectedTopicId === stream.topicId ? 'text-cyan-400' : 'text-slate-400'
            }`}>
              {stream.topicId}
            </div>
            <div className="text-[10px] text-slate-500 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {stream.partitionsCount} parts / {stream.targetThroughputTps}
            </div>
          </button>
        ))}
      </div>

      {/* 3. Topic Architecture & Telemetry Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Topic Invariants */}
        <div className="lg:col-span-2 space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold font-editorial text-white">
                {currentTopic.title}
              </h4>
              <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
                Topic: <span className="text-slate-200">{currentTopic.topicId}</span>
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              {currentTopic.category}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            {currentTopic.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Partitions</span>
              <span className="text-white font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentTopic.partitionsCount}
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Replication</span>
              <span className="text-emerald-400 font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentTopic.replicationFactor}x ISR
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Retention</span>
              <span className="text-amber-400 font-bold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentTopic.retentionHours}h
              </span>
            </div>
            <div className="p-2 rounded bg-[#040810] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Compression</span>
              <span className="text-cyan-400 font-bold text-sm uppercase">
                {currentTopic.compressionType}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Performance & SLA Card */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Broker Performance SLA
            </span>
            <button
              onClick={() => setIsSimulatingStream(prev => !prev)}
              className="text-[10px] font-mono flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              aria-label="Toggle synthetic live stream"
            >
              <Radio className={`w-3 h-3 ${isSimulatingStream ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
              <span>{isSimulatingStream ? 'STREAM LIVE' : 'STREAM PAUSED'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Target Throughput:</span>
              <span className="text-white font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentTopic.targetThroughputTps}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">P99 Publish Latency:</span>
              <span className="text-emerald-400 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {currentTopic.p99PublishLatency}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Total Consumer Lag:</span>
              <span className={`font-bold ${totalTopicLag === 0 ? 'text-emerald-400' : 'text-amber-400'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {totalTopicLag} messages
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Governing ADR:</span>
              <span className="text-cyan-400 font-bold">{currentTopic.governingAdr}</span>
            </div>
          </div>

          {/* Consumer Groups List */}
          <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Active Consumer Groups</span>
            {currentTopic.consumerGroups.map(cg => (
              <div key={cg.groupId} className="p-1.5 rounded bg-[#040810] border border-slate-800/80 text-[10px] font-mono flex justify-between items-center">
                <span className="text-slate-300 truncate max-w-[140px]">{cg.groupId}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">
                  {cg.state} ({cg.membersCount}w)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Partition Offsets & ISR Grid */}
      <div className="rounded-xl border border-slate-800 bg-[#040810] overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white">Partition Health &amp; Lag Matrix</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {currentTopic.partitions.length} Partitions online
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>Stream Offset: +{streamTick}</span>
          </div>
        </div>

        {/* Partition Items Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentTopic.partitions.map(partition => {
            const isSelected = selectedPartitionId === partition.partitionId
            const dynamicOffset = partition.logEndOffset + (isSimulatingStream ? (streamTick % 7) : 0)
            const dynamicConsumerOffset = partition.consumerOffset + (isSimulatingStream ? (streamTick % 7) : 0)

            return (
              <div
                key={partition.partitionId}
                onClick={() => setSelectedPartitionId(partition.partitionId)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPartitionId(partition.partitionId) } }}
                role="button"
                tabIndex={0}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-xs font-mono ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
                aria-label={`Inspect partition ${partition.partitionId}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                    P-{partition.partitionId}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    partition.lag === 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    Lag: {partition.lag}
                  </span>
                </div>

                <div className="space-y-1 text-[10px] text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Leader:</span>
                    <span className="text-slate-300 truncate max-w-[110px]">{partition.leaderBroker.split('.')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Log End:</span>
                    <span className="text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{dynamicOffset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consumer:</span>
                    <span className="text-cyan-300" style={{ fontVariantNumeric: 'tabular-nums' }}>{dynamicConsumerOffset}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500">ISR Quorum:</span>
                    <span className="text-emerald-400 font-bold">{partition.isr.length}/{partition.replicas.length} In-Sync</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Selected Partition & Live Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Selected Partition Deep Dive */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white">
              Partition {selectedPartition.partitionId} Replication Topology
            </h4>
          </div>

          <div className="p-3 rounded-lg bg-[#040810] border border-slate-800 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Leader Broker:</span>
              <span className="text-cyan-400 font-bold">{selectedPartition.leaderBroker}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Replicas:</span>
              <span className="text-slate-300">{selectedPartition.replicas.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">In-Sync Replicas (ISR):</span>
              <span className="text-emerald-400 font-bold">{selectedPartition.isr.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Min In-Sync Replicas Policy:</span>
              <span className="text-white">min.insync.replicas=2</span>
            </div>
          </div>
        </div>

        {/* Right: Live Wire Event Payload */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-white">Live Event Wire Payload</h4>
            </div>
            <button
              onClick={handleCopyPayload}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              aria-label="Copy JSON payload"
            >
              {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-[#040810] border border-slate-800 text-[10px] space-y-2 overflow-x-auto">
            <div>
              <span className="text-slate-500 block mb-0.5">Partition Key:</span>
              <span className="text-cyan-300 font-bold">{currentTopic.sampleEventPayload.key}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Record Headers:</span>
              <div className="space-y-0.5 text-slate-400">
                {Object.entries(currentTopic.sampleEventPayload.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Payload Value (JSON):</span>
              <pre className="text-emerald-400/90 whitespace-pre-wrap font-mono text-[9px] leading-relaxed">
                {currentTopic.sampleEventPayload.valueJson}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Export Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleCopyRfc}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-xs font-mono font-bold cursor-pointer"
          aria-label="Copy Kafka topic architecture RFC report"
        >
          {copiedRfc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedRfc ? 'Copied' : '[ Copy Kafka Topic RFC ]'}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500">
          Enforces at-least-once Debezium CDC delivery with zero head-of-line blocking.
        </span>
      </div>
    </div>
  )
}
