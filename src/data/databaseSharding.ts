export interface ShardNode {
  id: string
  name: string
  virtualNodeCount: number
  assignedRange: string
  keyCount: number
  storageUsageGb: number
  cpuUtilizationPct: number
  status: 'active' | 'rebalancing' | 'draining'
}

export interface RoutingProbe {
  key: string
  entityType: string
  hashHex: string
  ringAngleDeg: number
  targetShardId: string
  targetShardName: string
  rationale: string
}

export interface DatabaseShardingStrategy {
  id: string
  name: string
  strategyName: string
  subtitle: string
  partitionAlgorithm: string
  rebalancingOverhead: string
  hotspotResilience: string
  crossShardJoinComplexity: string
  governingAdr: string
  summary: string
  shards: ShardNode[]
  routingProbes: RoutingProbe[]
  tradeoffs: {
    pros: string[]
    cons: string[]
  }
  productionUseCase: {
    system: string
    entity: string
    workload: string
    justification: string
  }
  routingCodeSnippet: string
}

export const DATABASE_SHARDING_STRATEGIES: DatabaseShardingStrategy[] = [
  {
    id: 'consistent-hashing',
    name: 'Consistent Hashing Ring',
    strategyName: 'Virtual Node Hash Ring Topology',
    subtitle: 'Dynamo & Cassandra Ring Model',
    partitionAlgorithm: 'MurmurHash3 (32-bit unsigned integer ring [0, 2^32 - 1]) with 150 vnodes per physical node',
    rebalancingOverhead: 'Minimal: Only K/N keys reassigned upon adding or removing a shard node',
    hotspotResilience: 'High: Virtual node interlacing eliminates statistical variance and prevents hot shards',
    crossShardJoinComplexity: 'High: Scatter-gather required across all shards; best paired with localized denormalization',
    governingAdr: 'ADR-004 & ADR-006',
    summary: 'A 360-degree mathematical integer ring where physical nodes map to dozens of virtual positions. Keys hash to ring coordinates and route clockwise to the nearest node. Scaling the cluster reassigns only adjacent key ranges, eliminating full-cluster re-sharding.',
    shards: [
      { id: 'shard-01', name: 'Shard 01 (US-East Cluster)', virtualNodeCount: 150, assignedRange: '0x00000000 - 0x33333332', keyCount: 248910, storageUsageGb: 142.8, cpuUtilizationPct: 44.5, status: 'active' },
      { id: 'shard-02', name: 'Shard 02 (EU-West Cluster)', virtualNodeCount: 150, assignedRange: '0x33333333 - 0x66666665', keyCount: 251430, storageUsageGb: 145.2, cpuUtilizationPct: 46.2, status: 'active' },
      { id: 'shard-03', name: 'Shard 03 (AP-South Cluster)', virtualNodeCount: 150, assignedRange: '0x66666666 - 0x99999998', keyCount: 247190, storageUsageGb: 141.6, cpuUtilizationPct: 43.8, status: 'active' },
      { id: 'shard-04', name: 'Shard 04 (SA-East Cluster)', virtualNodeCount: 150, assignedRange: '0x99999999 - 0xCCCCCCCC', keyCount: 253020, storageUsageGb: 146.9, cpuUtilizationPct: 47.1, status: 'active' },
      { id: 'shard-05', name: 'Shard 05 (Overflow Cluster)', virtualNodeCount: 150, assignedRange: '0xCCCCCCCD - 0xFFFFFFFF', keyCount: 249650, storageUsageGb: 143.5, cpuUtilizationPct: 45.0, status: 'active' },
    ],
    routingProbes: [
      { key: 'tenant_enterprise_nike', entityType: 'Tenant Workspace', hashHex: '0x1F4A8820', ringAngleDeg: 44, targetShardId: 'shard-01', targetShardName: 'Shard 01 (US-East)', rationale: 'Hash falls in quadrant 1; clockwise traversal resolves directly to Shard 01 vnode 42.' },
      { key: 'user_doc_canvas_981', entityType: 'CRDT Document Room', hashHex: '0x4E9A1102', ringAngleDeg: 110, targetShardId: 'shard-02', targetShardName: 'Shard 02 (EU-West)', rationale: 'Hash falls in quadrant 2; closest clockwise successor is Shard 02 vnode 88.' },
      { key: 'session_agent_tool_f49', entityType: 'MCP Tool Context', hashHex: '0x88D2FE10', ringAngleDeg: 192, targetShardId: 'shard-03', targetShardName: 'Shard 03 (AP-South)', rationale: 'Hash falls in quadrant 3; clock hand lands on Shard 03 vnode 104.' },
      { key: 'order_checkout_7721', entityType: 'Saga State Ledger', hashHex: '0xB0129C44', ringAngleDeg: 248, targetShardId: 'shard-04', targetShardName: 'Shard 04 (SA-East)', rationale: 'Hash maps past 180 degrees; nearest virtual node belongs to Shard 04.' },
      { key: 'audit_log_shard_probe_9', entityType: 'Compliance Trail', hashHex: '0xDF9011AB', ringAngleDeg: 314, targetShardId: 'shard-05', targetShardName: 'Shard 05 (Overflow)', rationale: 'Terminal sector hash wraps toward 360 degrees; resolved by Shard 05 vnode 14.' },
    ],
    tradeoffs: {
      pros: [
        'Adding node N+1 invalidates only 1/(N+1) of cluster keys instead of full dataset',
        'Virtual node replication factor prevents statistical skew and load imbalances',
        'Decentralized deterministic client routing with zero central lookup bottleneck',
        'Effortless linear scaling to hundreds of distributed storage instances'
      ],
      cons: [
        'Cross-shard relational queries require scatter-gather orchestration with high network latency',
        'Transactions spanning multiple keys require distributed commit protocols (2PC or Saga)',
        'Virtual node tree lookup incurs in-memory binary search overhead (TreeMap log(M))'
      ]
    },
    productionUseCase: {
      system: 'Real-Time Collaboration & State Synchronization Engine',
      entity: 'CRDT Document Rooms & Session Vectors',
      workload: '50,000 concurrent WebSocket frame diffs per second',
      justification: 'Guarantees document editing rooms stay bound to predictable memory partitions without cascading disconnects during auto-scaling.'
    },
    routingCodeSnippet: `// Consistent Hash Ring Implementation with Virtual Nodes (Java 21)
public class ConsistentHashRouter<T> {
    private final HashFunction hashFunction = Hashing.murmur3_32_fixed();
    private final int numberOfReplicas;
    private final NavigableMap<Integer, T> circle = new ConcurrentSkipListMap<>();

    public ConsistentHashRouter(int numberOfReplicas, Collection<T> nodes) {
        this.numberOfReplicas = numberOfReplicas;
        for (T node : nodes) { add(node); }
    }

    public void add(T node) {
        for (int i = 0; i < numberOfReplicas; i++) {
            int hash = hashFunction.hashString(node.toString() + "-vnode-" + i, StandardCharsets.UTF_8).asInt();
            circle.put(hash, node);
        }
    }

    public T route(String key) {
        if (circle.isEmpty()) return null;
        int hash = hashFunction.hashString(key, StandardCharsets.UTF_8).asInt();
        Map.Entry<Integer, T> entry = circle.ceilingEntry(hash);
        return (entry != null) ? entry.getValue() : circle.firstEntry().getValue();
    }
}`
  },
  {
    id: 'hash-modulo',
    name: 'Hash-Based Modulo Sharding',
    strategyName: 'Deterministic Hash Modulo Partitioning',
    subtitle: 'High-Throughput Fixed-Cluster Slicing',
    partitionAlgorithm: 'h = (MurmurHash3(partition_key) & 0x7FFFFFFF) % NumberOfShards',
    rebalancingOverhead: 'Catastrophic on cluster resize: Adding 1 node reassigns (N-1)/N (~80-90%) of all keys',
    hotspotResilience: 'High: Uniform mathematical distribution across all available storage partitions',
    crossShardJoinComplexity: 'High: Keys with different partition hashes reside on separate physical database nodes',
    governingAdr: 'ADR-001 & ADR-004',
    summary: 'A direct mathematical formula mapping keys to shard IDs without maintaining lookup metadata. Best suited for workloads where cluster node count is fixed or scaled only by doubling (2N) to minimize rebalancing shuffle.',
    shards: [
      { id: 'shard-01', name: 'Shard Node 0', virtualNodeCount: 1, assignedRange: 'hash % 4 == 0', keyCount: 312400, storageUsageGb: 182.1, cpuUtilizationPct: 52.1, status: 'active' },
      { id: 'shard-02', name: 'Shard Node 1', virtualNodeCount: 1, assignedRange: 'hash % 4 == 1', keyCount: 311890, storageUsageGb: 181.8, cpuUtilizationPct: 51.8, status: 'active' },
      { id: 'shard-03', name: 'Shard Node 2', virtualNodeCount: 1, assignedRange: 'hash % 4 == 2', keyCount: 313100, storageUsageGb: 182.7, cpuUtilizationPct: 52.4, status: 'active' },
      { id: 'shard-04', name: 'Shard Node 3', virtualNodeCount: 1, assignedRange: 'hash % 4 == 3', keyCount: 312050, storageUsageGb: 181.9, cpuUtilizationPct: 51.9, status: 'active' },
    ],
    routingProbes: [
      { key: 'tenant_acme_corp', entityType: 'Organization Record', hashHex: '0x3A8F201C', ringAngleDeg: 45, targetShardId: 'shard-01', targetShardName: 'Shard Node 0', rationale: 'Hash 982,464,540 % 4 = 0; routes directly to Shard Node 0.' },
      { key: 'tenant_globex_inc', entityType: 'Organization Record', hashHex: '0x712B00E5', ringAngleDeg: 135, targetShardId: 'shard-02', targetShardName: 'Shard Node 1', rationale: 'Hash 1,898,643,685 % 4 = 1; routes directly to Shard Node 1.' },
      { key: 'tenant_initech_llc', entityType: 'Organization Record', hashHex: '0x99A045B2', ringAngleDeg: 225, targetShardId: 'shard-03', targetShardName: 'Shard Node 2', rationale: 'Hash 2,577,417,650 % 4 = 2; routes directly to Shard Node 2.' },
      { key: 'tenant_umbrella_corp', entityType: 'Organization Record', hashHex: '0xD411FF2B', ringAngleDeg: 315, targetShardId: 'shard-04', targetShardName: 'Shard Node 3', rationale: 'Hash 3,557,949,227 % 4 = 3; routes directly to Shard Node 3.' },
    ],
    tradeoffs: {
      pros: [
        'Zero metadata lookup latency: single CPU hash + modulo calculation (sub-microsecond)',
        'Extremely uniform data distribution with negligible hotspot variance',
        'Simple client-side library integration without cluster topology heartbeats',
        'Eliminates central coordinator failure modes'
      ],
      cons: [
        'Resizing cluster requires offline or complex dual-write live migration for almost all keys',
        'Cannot isolate high-volume whale tenants to specialized hardware without custom overrides',
        'Range queries require full fan-out broadcast to every partition in the cluster'
      ]
    },
    productionUseCase: {
      system: 'Multi-Tenant B2B Cloud SaaS Platform',
      entity: 'Tenant Analytics & Event Ledger',
      workload: '120,000 ingested tenant events/sec across 4 static partitions',
      justification: 'Provides deterministic partition isolation with zero coordination overhead across PostgreSQL Aurora instances.'
    },
    routingCodeSnippet: `// Hash Modulo Deterministic Shard Router
public final class ModuloShardRouter {
    private final int shardCount;

    public ModuloShardRouter(int shardCount) {
        this.shardCount = shardCount;
    }

    public int getShardId(String partitionKey) {
        int hash = Hashing.murmur3_32_fixed().hashString(partitionKey, StandardCharsets.UTF_8).asInt();
        return (hash & 0x7FFFFFFF) % shardCount;
    }
}`
  },
  {
    id: 'range-based',
    name: 'Range-Based Sharding',
    strategyName: 'Lexicographical & Temporal Key Range Slicing',
    subtitle: 'Continuous Partitioning for Range Scans',
    partitionAlgorithm: 'Keys partitioned by lexicographical prefix or monotonic timestamp ranges [min_val, max_val)',
    rebalancingOverhead: 'Moderate: Split and merge operations localized strictly to overflowing boundary partitions',
    hotspotResilience: 'Low: Monotonically increasing keys (e.g. timestamps, auto-increment IDs) funnel all writes into the latest shard',
    crossShardJoinComplexity: 'Low for intra-range scans; High across arbitrary range boundaries',
    governingAdr: 'ADR-002 & ADR-004',
    summary: 'Partitions data into ordered contiguous ranges. Enables sub-millisecond range scans (e.g. BETWEEN dates or alphabetically) to be satisfied by a single shard without scatter-gather. Requires automatic partition splitting to manage data growth.',
    shards: [
      { id: 'shard-01', name: 'Shard 01 [A - E]', virtualNodeCount: 1, assignedRange: 'Lexicographic: A - E', keyCount: 198200, storageUsageGb: 114.5, cpuUtilizationPct: 38.2, status: 'active' },
      { id: 'shard-02', name: 'Shard 02 [F - K]', virtualNodeCount: 1, assignedRange: 'Lexicographic: F - K', keyCount: 224100, storageUsageGb: 129.8, cpuUtilizationPct: 41.5, status: 'active' },
      { id: 'shard-03', name: 'Shard 03 [L - P]', virtualNodeCount: 1, assignedRange: 'Lexicographic: L - P', keyCount: 265400, storageUsageGb: 153.2, cpuUtilizationPct: 49.0, status: 'active' },
      { id: 'shard-04', name: 'Shard 04 [Q - U]', virtualNodeCount: 1, assignedRange: 'Lexicographic: Q - U', keyCount: 187600, storageUsageGb: 108.4, cpuUtilizationPct: 36.1, status: 'active' },
      { id: 'shard-05', name: 'Shard 05 [V - Z]', virtualNodeCount: 1, assignedRange: 'Lexicographic: V - Z', keyCount: 142300, storageUsageGb: 82.3, cpuUtilizationPct: 29.8, status: 'active' },
    ],
    routingProbes: [
      { key: 'Apple_Corporate_ID', entityType: 'Alphabetical Index', hashHex: 'N/A (Lexical: A)', ringAngleDeg: 36, targetShardId: 'shard-01', targetShardName: 'Shard 01 [A - E]', rationale: 'Prefix "A" falls into range [A, E]; routes to Shard 01.' },
      { key: 'Google_Enterprise_ID', entityType: 'Alphabetical Index', hashHex: 'N/A (Lexical: G)', ringAngleDeg: 108, targetShardId: 'shard-02', targetShardName: 'Shard 02 [F - K]', rationale: 'Prefix "G" falls into range [F, K]; routes to Shard 02.' },
      { key: 'Microsoft_Azure_ID', entityType: 'Alphabetical Index', hashHex: 'N/A (Lexical: M)', ringAngleDeg: 180, targetShardId: 'shard-03', targetShardName: 'Shard 03 [L - P]', rationale: 'Prefix "M" falls into range [L, P]; routes to Shard 03.' },
      { key: 'Salesforce_CRM_ID', entityType: 'Alphabetical Index', hashHex: 'N/A (Lexical: S)', ringAngleDeg: 252, targetShardId: 'shard-04', targetShardName: 'Shard 04 [Q - U]', rationale: 'Prefix "S" falls into range [Q, U]; routes to Shard 04.' },
      { key: 'Walmart_Global_ID', entityType: 'Alphabetical Index', hashHex: 'N/A (Lexical: W)', ringAngleDeg: 324, targetShardId: 'shard-05', targetShardName: 'Shard 05 [V - Z]', rationale: 'Prefix "W" falls into range [V, Z]; routes to Shard 05.' },
    ],
    tradeoffs: {
      pros: [
        'Ultra-fast range queries (BETWEEN, >=, <=) execute locally on a single shard node',
        'Data is naturally ordered, drastically reducing sort buffer and disk seek overhead',
        'Partition splits are local: splitting one overflowing range leaves all other shards untouched',
        'Intuitive for temporal time-series, audit trails, and alphabetical customer directories'
      ],
      cons: [
        'Susceptible to write hotspots when sequential keys (e.g. current timestamp) target the active shard',
        'Uneven storage distribution if key cardinality in specific ranges is disproportionate',
        'Requires partition routing coordinators to maintain dynamic boundary maps'
      ]
    },
    productionUseCase: {
      system: 'FinTech Banking & Real-Time Payment Settlement',
      entity: 'Append-Only Ledger Transactions by Quarter',
      workload: 'Historical ledger audit queries covering date intervals',
      justification: 'Enables regulatory audit reports over date intervals to execute localized sequential scans on historical partitions without touching current settlement shards.'
    },
    routingCodeSnippet: `// Range-Based Shard Partition Router with Dynamic Range Boundaries
public class RangeShardRouter {
    private final NavigableMap<String, String> rangeToShardMap = new ConcurrentSkipListMap<>();

    public void registerRange(String upperBoundExclusive, String shardId) {
        rangeToShardMap.put(upperBoundExclusive, shardId);
    }

    public String routeKey(String partitionKey) {
        Map.Entry<String, String> entry = rangeToShardMap.higherEntry(partitionKey);
        return (entry != null) ? entry.getValue() : rangeToShardMap.lastEntry().getValue();
    }
}`
  },
  {
    id: 'directory-lookup',
    name: 'Directory-Based Lookup Sharding',
    strategyName: 'Centralized Metadata Directory Routing',
    subtitle: 'ZooKeeper / Consul Catalog Mapping',
    partitionAlgorithm: 'Explicit mapping table (PartitionKey -> ShardId) maintained in distributed metadata coordinator with local Redis L1 cache',
    rebalancingOverhead: 'Zero Key Movement: Moving a tenant requires updating only 1 directory row after migration',
    hotspotResilience: 'Maximum: High-volume whale tenants can be relocated to dedicated hardware with a single config write',
    crossShardJoinComplexity: 'High: Scatter-gather across multiple assigned partitions',
    governingAdr: 'ADR-001 & ADR-005',
    summary: 'A decoupled architecture where a lookup service tracks the physical location of each partition key. Provides extreme operational flexibility to isolate VIP enterprise customers or migrate overloaded accounts without modifying hashing algorithms.',
    shards: [
      { id: 'shard-shared-01', name: 'Shared Shard Cluster A', virtualNodeCount: 1, assignedRange: 'Tier-2 & Tier-3 Tenants (3,500 orgs)', keyCount: 420100, storageUsageGb: 210.4, cpuUtilizationPct: 58.2, status: 'active' },
      { id: 'shard-shared-02', name: 'Shared Shard Cluster B', virtualNodeCount: 1, assignedRange: 'Tier-2 & Tier-3 Tenants (3,500 orgs)', keyCount: 418900, storageUsageGb: 209.6, cpuUtilizationPct: 57.9, status: 'active' },
      { id: 'shard-vip-nike', name: 'VIP Shard (Nike Dedicated)', virtualNodeCount: 1, assignedRange: 'Single Tenant Isolation: Nike Inc.', keyCount: 1254000, storageUsageGb: 680.2, cpuUtilizationPct: 42.1, status: 'active' },
      { id: 'shard-vip-apple', name: 'VIP Shard (Apple Dedicated)', virtualNodeCount: 1, assignedRange: 'Single Tenant Isolation: Apple Inc.', keyCount: 1890000, storageUsageGb: 940.5, cpuUtilizationPct: 51.0, status: 'active' },
    ],
    routingProbes: [
      { key: 'tenant_nike_direct', entityType: 'VIP Whale Tenant', hashHex: 'Directory Lookup: Shard 3', ringAngleDeg: 90, targetShardId: 'shard-vip-nike', targetShardName: 'VIP Shard (Nike Dedicated)', rationale: 'Directory mapping routes directly to isolated high-memory r6g.4xlarge cluster.' },
      { key: 'tenant_apple_services', entityType: 'VIP Whale Tenant', hashHex: 'Directory Lookup: Shard 4', ringAngleDeg: 180, targetShardId: 'shard-vip-apple', targetShardName: 'VIP Shard (Apple Dedicated)', rationale: 'Guaranteed 100% compute and IOPS isolation from noisy neighbors via explicit mapping.' },
      { key: 'tenant_midmarket_901', entityType: 'Standard Tenant', hashHex: 'Directory Lookup: Shard 1', ringAngleDeg: 270, targetShardId: 'shard-shared-01', targetShardName: 'Shared Shard Cluster A', rationale: 'Mapped to Shared Cluster A with 3,500 multi-tenant peers.' },
      { key: 'tenant_startup_428', entityType: 'Standard Tenant', hashHex: 'Directory Lookup: Shard 2', ringAngleDeg: 360, targetShardId: 'shard-shared-02', targetShardName: 'Shared Shard Cluster B', rationale: 'Mapped to Shared Cluster B with 3,500 multi-tenant peers.' },
    ],
    tradeoffs: {
      pros: [
        'Total operational control: move any tenant to any shard at any time with 0 key rehashing',
        'Enables dedicated physical hardware isolation for tier-1 enterprise SLA accounts',
        'Facilitates live zero-downtime tenant migration during cluster rebalancing',
        'Supports hybrid multi-tenant and single-tenant tenancy in one platform'
      ],
      cons: [
        'Single point of bottleneck: directory service lookup introduces ~1.2ms hop without local cache',
        'Cache invalidation complexity: stale local routing tables can direct writes to vacated shards',
        'Directory metadata table grows linearly with partition key cardinality'
      ]
    },
    productionUseCase: {
      system: 'High-Throughput Distributed E-Commerce Checkout Engine',
      entity: 'Merchant Stores & Catalog Inventory',
      workload: 'Flash sale traffic spikes on enterprise storefronts',
      justification: 'Isolates top enterprise brands onto dedicated database clusters during Black Friday flash sales without impacting standard merchant throughput.'
    },
    routingCodeSnippet: `// Directory-Based Shard Router with Distributed Redis L1 Cache
public class DirectoryLookupShardRouter {
    private final LoadingCache<String, String> localRoutingCache;
    private final MetadataService metadataService;

    public DirectoryLookupShardRouter(MetadataService metadataService) {
        this.metadataService = metadataService;
        this.localRoutingCache = Caffeine.newBuilder()
            .maximumSize(50_000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .build(metadataService::fetchShardMapping);
    }

    public String routeTenant(String tenantId) {
        return localRoutingCache.get(tenantId);
    }
}`
  },
  {
    id: 'geo-partitioning',
    name: 'Geo-Partitioning & Data Sovereignty',
    strategyName: 'Regulatory Jurisdictional Locality Sharding',
    subtitle: 'GDPR / CCPA Multi-Region Compliance',
    partitionAlgorithm: 'Rows tagged with jurisdiction attributes (e.g. jurisdiction = \'EU\') and physically pinned to regional storage clusters',
    rebalancingOverhead: 'Low: Data moves only when customer jurisdiction or residency changes',
    hotspotResilience: 'High: Workloads distribute according to global demographic timezone peaks',
    crossShardJoinComplexity: 'Extremely High: Cross-region transactions incur speed-of-light WAN latencies (70-180ms)',
    governingAdr: 'ADR-003 & ADR-005',
    summary: 'Physically binds database partitions to geographical territories based on customer domicile. Ensures strict compliance with data sovereignty regulations (EU GDPR, US CCPA, AP PDP) while delivering sub-10ms local query latencies to regional users.',
    shards: [
      { id: 'shard-geo-eu', name: 'EU Shard Cluster (Frankfurt)', virtualNodeCount: 1, assignedRange: 'Jurisdiction: GDPR (EU-27)', keyCount: 520400, storageUsageGb: 298.5, cpuUtilizationPct: 54.2, status: 'active' },
      { id: 'shard-geo-us', name: 'US Shard Cluster (N. Virginia)', virtualNodeCount: 1, assignedRange: 'Jurisdiction: CCPA / HIPAA (US)', keyCount: 890100, storageUsageGb: 480.1, cpuUtilizationPct: 62.8, status: 'active' },
      { id: 'shard-geo-ap', name: 'APAC Shard Cluster (Singapore)', virtualNodeCount: 1, assignedRange: 'Jurisdiction: AP-South (ASEAN)', keyCount: 410200, storageUsageGb: 230.7, cpuUtilizationPct: 48.0, status: 'active' },
    ],
    routingProbes: [
      { key: 'user_berlin_compliance_01', entityType: 'EU Citizen Profile', hashHex: 'Locality: EU-Central (Frankfurt)', ringAngleDeg: 60, targetShardId: 'shard-geo-eu', targetShardName: 'EU Shard Cluster (Frankfurt)', rationale: 'GDPR Article 44 mandates data remain strictly inside EU jurisdiction.' },
      { key: 'user_nyc_trading_02', entityType: 'US Citizen Profile', hashHex: 'Locality: US-East (N. Virginia)', ringAngleDeg: 180, targetShardId: 'shard-geo-us', targetShardName: 'US Shard Cluster (N. Virginia)', rationale: 'CCPA and SEC compliance requires physical residency in US financial zone.' },
      { key: 'user_sg_settlement_03', entityType: 'APAC Citizen Profile', hashHex: 'Locality: AP-South (Singapore)', ringAngleDeg: 300, targetShardId: 'shard-geo-ap', targetShardName: 'APAC Shard Cluster (Singapore)', rationale: 'MAS Notice 644 mandates regional financial record retention in Singapore.' },
    ],
    tradeoffs: {
      pros: [
        '100% compliant with global data residency and sovereignty laws (GDPR, CCPA, MAS)',
        'Local read and write transactions achieve sub-10ms latency inside native regions',
        'Region outages isolate fault blast radius; EU outage does not cascade into US operations',
        'Eliminates cross-continental storage transit and expensive inter-region cloud egress'
      ],
      cons: [
        'Cross-jurisdiction queries require distributed WAN queries with 100ms+ round-trip times',
        'Global aggregate reporting requires complex asynchronous ETL data warehouse pipelines',
        'Capacity scaling is uneven and dictated by geopolitical customer density'
      ]
    },
    productionUseCase: {
      system: 'Autonomous Agentic Orchestrator & Model Context Protocol Mesh',
      entity: 'Episodic Memory Vectors & Regulatory Tool Audit Logs',
      workload: 'Jurisdiction-governed agent execution telemetry',
      justification: 'Guarantees AI reasoning traces and customer vector embeddings never violate cross-border data transfer laws.'
    },
    routingCodeSnippet: `// Geo-Partitioning Table Definition (CockroachDB / PostgreSQL Spanner Model)
ALTER TABLE customer_documents PARTITION BY LIST (jurisdiction) (
    PARTITION p_europe VALUES IN ('DE', 'FR', 'IT', 'ES', 'NL', 'SE'),
    PARTITION p_north_america VALUES IN ('US', 'CA', 'MX'),
    PARTITION p_asia_pacific VALUES IN ('SG', 'JP', 'IN', 'AU')
);

ALTER PARTITION p_europe CONFIGURE ZONE USING
    constraints = '[+region=eu-central-1]';
ALTER PARTITION p_north_america CONFIGURE ZONE USING
    constraints = '[+region=us-east-1]';
ALTER PARTITION p_asia_pacific CONFIGURE ZONE USING
    constraints = '[+region=ap-southeast-1]';`
  }
]
