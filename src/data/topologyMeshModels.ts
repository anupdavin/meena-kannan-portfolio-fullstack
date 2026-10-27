// Distributed Dynamic Topology Mesh & Service Discovery Consensus Models
// Production architectural specifications for HashiCorp Serf SWIM gossip convergence,
// Envoy Dynamic Endpoint Discovery (EDS) xDS streaming, CoreDNS RFC 2782 SRV record resolution,
// Netflix Eureka heartbeat lease self-preservation, and Kademlia DHT XOR routing.

export interface MeshNode {
  id: string;
  name: string;
  service: string;
  ip: string;
  port: number;
  status: 'ALIVE' | 'SUSPECT' | 'DEAD' | 'HEALTHY_200';
  weight: number;
  rttMs: number;
  incarnation: number;
}

export interface TopologyMeshModel {
  id: string;
  name: string;
  category: string;
  badge: string;
  convergenceLatency: string;
  healthCheckSla: string;
  partitionResilienceSla: string;
  algorithmFormula: string;
  blastRadiusContainment: string;
  architecturalInvariant: string;
  description: string;
  workflowPhases: {
    name: string;
    description: string;
    invariants: string;
  }[];
  productionOutcomes: Record<string, string>;
  specCode: string;
}

export const INITIAL_MESH_NODES: MeshNode[] = [
  {
    id: 'node-mesh-01',
    name: 'order-api-east-1a',
    service: 'order-service',
    ip: '10.240.12.14',
    port: 8080,
    status: 'ALIVE',
    weight: 100,
    rttMs: 1.2,
    incarnation: 1
  },
  {
    id: 'node-mesh-02',
    name: 'order-api-east-1b',
    service: 'order-service',
    ip: '10.240.12.15',
    port: 8080,
    status: 'ALIVE',
    weight: 100,
    rttMs: 1.4,
    incarnation: 1
  },
  {
    id: 'node-mesh-03',
    name: 'payment-vault-east-1a',
    service: 'payment-service',
    ip: '10.240.14.88',
    port: 8443,
    status: 'ALIVE',
    weight: 80,
    rttMs: 2.1,
    incarnation: 2
  },
  {
    id: 'node-mesh-04',
    name: 'inventory-core-east-1b',
    service: 'inventory-service',
    ip: '10.240.16.42',
    port: 9090,
    status: 'ALIVE',
    weight: 120,
    rttMs: 1.8,
    incarnation: 1
  },
  {
    id: 'node-mesh-05',
    name: 'auth-gateway-east-1c',
    service: 'auth-service',
    ip: '10.240.18.99',
    port: 443,
    status: 'ALIVE',
    weight: 150,
    rttMs: 0.9,
    incarnation: 3
  },
  {
    id: 'node-mesh-06',
    name: 'analytics-worker-east-1c',
    service: 'analytics-service',
    ip: '10.240.20.104',
    port: 7070,
    status: 'ALIVE',
    weight: 50,
    rttMs: 3.4,
    incarnation: 1
  }
];

export const TOPOLOGY_MESH_MODELS: TopologyMeshModel[] = [
  {
    id: 'serf-swim-gossip',
    name: 'HashiCorp Serf SWIM Gossip Protocol',
    category: 'Weakly-Consistent Cluster Membership',
    badge: 'SWIM Gossip',
    convergenceLatency: 'sub-250ms full cluster membership convergence across 1,000 nodes',
    healthCheckSla: 'Direct ping with indirect probe delegation within 200ms',
    partitionResilienceSla: 'Monotonic incarnation sequence numbers override stale suspect rumors',
    algorithmFormula: 'Probe: Ping(Target) -> Timeout -> Indirect Ping via K Random Peers -> Suspect -> Confirm Dead',
    blastRadiusContainment: 'Eliminates centralized discovery coordinator single point of failure; network splits resolve via incarnation numbers',
    architecturalInvariant: 'No single central authority dictates cluster state; node liveness is determined by randomized peer probe delegation and gossip piggybacking.',
    description: 'Decentralized cluster membership and failure detection based on the SWIM (Structured Weakly-Consistent Infection-Style Process Group Membership) protocol. Employs indirect pinging via k peer nodes to eliminate false positives caused by asymmetric network packet drops.',
    workflowPhases: [
      {
        name: 'Periodic Direct Probe',
        description: 'Node selects random peer from membership list and sends UDP ping packet with short timeout (200ms).',
        invariants: 'Random selection guarantees O(log N) epidemic spread of state updates.'
      },
      {
        name: 'Indirect Peer Delegation (Ping-Req)',
        description: 'If direct ping times out, node requests k=3 peers to probe the target node indirectly.',
        invariants: 'Filters out transient local network edge drops between single pairs of nodes.'
      },
      {
        name: 'Suspect State & Monotonic Incarnation',
        description: 'Target enters SUSPECT state for grace period; target can refute suspicion by incrementing its monotonic incarnation number.',
        invariants: 'Dead status is declared only after suspect timer expires without refutation.'
      }
    ],
    productionOutcomes: {
      'Cluster Scale Limit': '10,000+ nodes with constant per-node network overhead',
      'Failure Detection Latency': 'sub-450ms detection of crashed or severed instances',
      'False Positive Rate': 'sub-0.01% via indirect k-peer probe delegation',
      'Network Bandwidth Usage': 'sub-15 KB/s background UDP gossip per instance'
    },
    specCode: `// Go HashiCorp Memberlist / Serf SWIM Configuration
package main

import (
    "time"
    "github.com/hashicorp/memberlist"
)

func NewSerfTopologyMesh() (*memberlist.Memberlist, error) {
    config := memberlist.DefaultLANConfig()
    config.Name = "order-api-01"
    config.BindPort = 7946
    
    // SWIM Failure Detector Tuning
    config.ProbeInterval = 200 * time.Millisecond
    config.ProbeTimeout = 100 * time.Millisecond
    config.IndirectChecks = 3 // k peer delegations
    config.SuspicionMult = 4  // Grace period before confirming DEAD
    config.GossipNodes = 3    // Piggybacked gossip fanout per round

    list, err := memberlist.Create(config)
    if err != nil {
        return nil, err
    }
    
    _, err = list.Join([]string{"seed-01.mesh.internal:7946", "seed-02.mesh.internal:7946"})
    return list, err
}`
  },
  {
    id: 'envoy-dynamic-eds',
    name: 'Envoy Dynamic Endpoint Discovery Service (EDS)',
    category: 'Control Plane Dynamic Service Mesh',
    badge: 'gRPC xDS v3',
    convergenceLatency: 'sub-45ms delta endpoint propagation to edge Envoy sidecars',
    healthCheckSla: 'Active L7 HTTP health checking with passive outlier ejection',
    partitionResilienceSla: 'Local Envoy proxy maintains last-known good endpoint cache during control-plane disconnect',
    algorithmFormula: 'DeltaDiscoveryRequest -> gRPC BiDi Stream -> EDS Delta ClusterLoadAssignment Push',
    blastRadiusContainment: 'Control plane outage does not disrupt active data plane traffic; sidecars continue routing to cached healthy hosts',
    architecturalInvariant: 'Data plane proxies must never poll control planes; dynamic endpoints are pushed via bidirectional persistent gRPC xDS streams.',
    description: 'Envoy dynamic service discovery leveraging the xDS v3 API protocol. Control planes push delta endpoint updates over long-lived bidirectional gRPC streams, providing instant endpoint addition and removal without proxy reload downtime.',
    workflowPhases: [
      {
        name: 'Persistent gRPC xDS Connection',
        description: 'Envoy establishes bidirectional streaming gRPC connection to control plane (Istio / custom Go control plane).',
        invariants: 'Connection multiplexes EDS, CDS, LDS, and RDS over a single HTTP/2 session.'
      },
      {
        name: 'Delta Endpoint Streaming Push',
        description: 'When pod scales up or passes readiness probe, control plane pushes Delta ClusterLoadAssignment.',
        invariants: 'Zero Envoy process reloads; zero active TCP connection drops.'
      },
      {
        name: 'Locality & Priority Weighted Routing',
        description: 'Envoy routes traffic prioritizing local Availability Zone (zone-aware routing) with failover to remote AZs.',
        invariants: 'Minimizes cross-AZ data transfer costs and network latency.'
      }
    ],
    productionOutcomes: {
      'Endpoint Push Latency': 'sub-45ms global convergence across 5,000 proxy sidecars',
      'Memory Overhead': 'Incremental delta streaming reduces memory footprint by 75%',
      'Active Health Checking': 'Sub-100ms eviction of pods with consecutive 5xx responses',
      'Zero-Downtime Reload': '100% graceful in-memory endpoint table hot updates'
    },
    specCode: `// Java 21 Envoy xDS v3 EDS Resource Provider via gRPC
import io.envoyproxy.envoy.config.endpoint.v3.ClusterLoadAssignment;
import io.envoyproxy.envoy.config.endpoint.v3.LocalityLbEndpoints;
import io.envoyproxy.envoy.config.endpoint.v3.LbEndpoint;
import io.envoyproxy.envoy.config.core.v3.Address;
import io.envoyproxy.envoy.config.core.v3.SocketAddress;

public class EnvoyEdsManager {

    public ClusterLoadAssignment buildClusterLoadAssignment(String clusterName, List<PodEndpoint> healthyPods) {
        LocalityLbEndpoints.Builder localityBuilder = LocalityLbEndpoints.newBuilder()
            .setPriority(0); // Priority tier 0: Same AZ

        for (PodEndpoint pod : healthyPods) {
            LbEndpoint endpoint = LbEndpoint.newBuilder()
                .setEndpoint(io.envoyproxy.envoy.config.endpoint.v3.Endpoint.newBuilder()
                    .setAddress(Address.newBuilder()
                        .setSocketAddress(SocketAddress.newBuilder()
                            .setAddress(pod.ip())
                            .setPortValue(pod.port())
                            .build())
                        .build())
                    .build())
                .setLoadBalancingWeight(UInt32Value.of(pod.weight()))
                .build();
            localityBuilder.addLbEndpoints(endpoint);
        }

        return ClusterLoadAssignment.newBuilder()
            .setClusterName(clusterName)
            .addEndpoints(localityBuilder.build())
            .build();
    }
}`
  },
  {
    id: 'coredns-srv-records',
    name: 'CoreDNS Dynamic SRV Weight Records',
    category: 'Standards-Based DNS Service Discovery',
    badge: 'RFC 2782 SRV',
    convergenceLatency: 'sub-2.5ms DNS UDP query resolution with local CoreDNS cache',
    healthCheckSla: 'Integrated Kubernetes Endpoints controller sync within 1 second',
    partitionResilienceSla: 'Client-side fallback to secondary DNS nameserver on timeout',
    algorithmFormula: 'SRV Record: _service._proto.name. TTL Class SRV Priority Weight Port Target',
    blastRadiusContainment: 'DNS caching at node-local cache layer (NodeLocal DNSCache) shields CoreDNS cluster from query storms',
    architecturalInvariant: 'Service discovery uses standard IETF RFC 2782 DNS SRV records, enabling language-agnostic discovery without custom SDK client libraries.',
    description: 'Dynamic DNS-based service discovery utilizing RFC 2782 SRV records. Encodes target hostname, port, priority tier, and weighted load distribution directly into standard DNS responses, allowing any programming language to balance traffic without proprietary client libraries.',
    workflowPhases: [
      {
        name: 'SRV Record Query',
        description: 'Microservice resolves _http._tcp.order-service.production.svc.cluster.local via UDP port 53.',
        invariants: 'Compliant with standard POSIX getaddrinfo and DNS resolver implementations.'
      },
      {
        name: 'Priority & Weight Selection',
        description: 'Client sorts records by lowest priority integer; within same priority, traffic is distributed proportionally by weight.',
        invariants: 'Enables active-standby failover and canary traffic split at DNS layer.'
      },
      {
        name: 'NodeLocal DNS Cache Acceleration',
        description: 'Queries are resolved locally in sub-0.8ms by daemonset caching proxy running on the host node.',
        invariants: 'Eliminates iptables conntrack race conditions and UDP socket drops.'
      }
    ],
    productionOutcomes: {
      'Query Resolution Latency': 'sub-1.2ms P99 DNS lookup via NodeLocal DNSCache',
      'Port Discovery Support': 'Dynamic port allocation without hardcoded client configs',
      'Language Interoperability': '100% compatibility across all runtimes (Java, Python, Rust, Go)',
      'Canary Weight Accuracy': 'Precise traffic splitting based on SRV record weights'
    },
    specCode: `// CoreDNS Corefile Configuration for Dynamic SRV Records
.:53 {
    errors
    health {
        lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods verified
        endpoint_pod_names
        fallthrough in-addr.arpa ip6.arpa
        ttl 5
    }
    prometheus :9153
    forward . /etc/resolv.conf {
        max_concurrent 1000
    }
    cache 30 {
        success 10000 30
        denial 5000 5
    }
    loop
    reload
    loadbalance round_robin
}`
  },
  {
    id: 'eureka-heartbeat-leases',
    name: 'Netflix Eureka Heartbeat Registry with Self-Preservation',
    category: 'AP-Mode High-Availability Registry',
    badge: 'Eureka Self-Preservation',
    convergenceLatency: 'sub-30s peer registry delta replication across server instances',
    healthCheckSla: 'Heartbeat every 30s; lease expiration after 90s without renewal',
    partitionResilienceSla: 'Self-preservation mode freezes node eviction when renewal rate drops below 85%',
    algorithmFormula: 'Threshold = TotalInstances * (60 / ExpectedInterval) * RenewalPercentThreshold (0.85)',
    blastRadiusContainment: 'Network partitions do not trigger mass de-registration of healthy nodes that are merely severed from registry',
    architecturalInvariant: 'Under network partitions, preserving stale registrations is safer than evicting healthy instances (CAP AP model prioritizing availability over consistency).',
    description: 'High-availability service registry following the Netflix Eureka AP architecture. Instances renew leases every 30 seconds; if a network split causes renewals to drop below 85% of expectation, the registry enters Self-Preservation Mode to freeze evictions, protecting service availability.',
    workflowPhases: [
      {
        name: 'Instance Registration & Heartbeat Stream',
        description: 'Service registers metadata and schedules recurring HTTP PUT heartbeat every 30 seconds.',
        invariants: 'Registry tracks renewal count per minute against dynamic mathematical threshold.'
      },
      {
        name: 'Network Split Renewal Drop',
        description: 'WAN partition severs communication between registry and 40% of microservice instances.',
        invariants: 'Total renewals drop below 85% expected threshold (e.g., 510/min vs 600/min required).'
      },
      {
        name: 'Self-Preservation Activation',
        description: 'Registry triggers Self-Preservation Mode: automated eviction timer is frozen; zero nodes are deleted.',
        invariants: 'Clients continue routing with cached registry tables; catastrophic cascading outage prevented.'
      }
    ],
    productionOutcomes: {
      'Availability Guarantee': '99.999% availability during severe multi-AZ network splits',
      'Eviction Protection': 'Zero false evictions of live instances during WAN degradation',
      'Client-Side Load Balancing': 'Spring Cloud LoadBalancer / Ribbon cached table routing',
      'Cluster Synchronization': 'Peer-to-peer eventual consistency between Eureka servers'
    },
    specCode: `// Java 21 Spring Cloud Netflix Eureka Self-Preservation Configuration
@Configuration
public class EurekaRegistryConfig {

    @Bean
    public EurekaServerConfigBean eurekaServerConfigBean() {
        EurekaServerConfigBean config = new EurekaServerConfigBean();
        
        // Heartbeat and Eviction Invariants
        config.setExpectedClientRenewalIntervalSeconds(30);
        config.setEvictionIntervalTimerInMs(60_000); // Check evictions every 60s
        
        // Self-Preservation Invariant: 85% threshold
        config.setEnableSelfPreservation(true);
        config.setRenewalPercentThreshold(0.85);
        config.setRenewalThresholdUpdateIntervalMs(15 * 60 * 1000); // Recompute threshold every 15m
        
        // Peer node replication
        config.setPeerEurekaNodesUpdateIntervalMs(10 * 60 * 1000);
        return config;
    }
}`
  },
  {
    id: 'kademlia-dht-routing',
    name: 'Decentralized Kademlia Distributed Hash Table (DHT)',
    category: 'Decentralized P2P Metric Space Routing',
    badge: 'XOR Metric DHT',
    convergenceLatency: 'sub-80ms iterative lookup across 100,000 nodes within O(log N) hops',
    healthCheckSla: 'LRU-eviction k-bucket ping verification on new node discovery',
    partitionResilienceSla: 'Parallel alpha=3 query lookups bypass degraded or disconnected peers',
    algorithmFormula: 'Distance: d(x, y) = x XOR y; Routing Table: 160 k-buckets of size k=20',
    blastRadiusContainment: 'Fully decentralized topology with zero central servers or single points of failure',
    architecturalInvariant: 'Distance between nodes is mathematically determined by the bitwise XOR metric d(x, y) = x XOR y, satisfying triangle inequality d(x, z) <= d(x, y) XOR d(y, z).',
    description: 'Decentralized peer-to-peer service discovery and key-value routing based on the Kademlia algorithm. Organizes nodes in a 160-bit metric space using the XOR distance metric, guaranteeing that any service endpoint can be discovered in at most O(log N) hops.',
    workflowPhases: [
      {
        name: 'XOR Metric Calculation',
        description: 'Compute distance between node ID and target service key using bitwise exclusive OR: d = x ^ y.',
        invariants: 'Symmetric metric: d(x, y) == d(y, x); identity of indiscernibles: d(x, y) == 0 iff x == y.'
      },
      {
        name: 'k-Bucket Routing Lookup',
        description: 'Node maintains 160 k-buckets (k=20 peers per bucket) indexed by distance prefix.',
        invariants: 'Buckets prioritize long-lived stable nodes; least-recently-seen node is pinged before eviction.'
      },
      {
        name: 'Parallel Iterative Search (alpha=3)',
        description: 'Initiate 3 parallel FIND_NODE RPCs to the alpha closest nodes to the target key, converging exponentially.',
        invariants: 'Lookup terminates in O(log N) steps with target node contact details.'
      }
    ],
    productionOutcomes: {
      'Lookup Bound': 'O(log N) maximum hops (under 6 hops for 1,000,000 nodes)',
      'Churn Tolerance': '99.8% query success rate under 30% node join/leave churn',
      'Decentralization': 'Zero central seed servers required after bootstrap join',
      'Routing Table Size': 'Fixed O(log N) storage overhead (under 50 KB per node)'
    },
    specCode: `// Rust Kademlia DHT XOR Metric Distance & Routing Lookup
pub struct KademliaNodeId(pub [u8; 20]); // 160-bit Node ID

impl KademliaNodeId {
    /// Compute XOR metric distance between two node identifiers
    pub fn distance(&self, other: &KademliaNodeId) -> [u8; 20] {
        let mut result = [0u8; 20];
        for i in 0..20 {
            result[i] = self.0[i] ^ other.0[i];
        }
        result
    }

    /// Calculate leading zero bits representing k-bucket index (0..160)
    pub fn bucket_index(&self, other: &KademliaNodeId) -> usize {
        let dist = self.distance(other);
        for (byte_idx, &byte) in dist.iter().enumerate() {
            if byte != 0 {
                return (byte_idx * 8) + byte.leading_zeros() as usize;
            }
        }
        159 // Identical IDs (distance 0)
    }
}`
  }
];

export const TOPOLOGY_MESH_PARADIGMS = TOPOLOGY_MESH_MODELS;
