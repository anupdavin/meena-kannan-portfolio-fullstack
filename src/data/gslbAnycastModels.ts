// Distributed Global Server Load Balancing (GSLB) & BGP Anycast Routing Models
// Production architectural specifications for Border Gateway Protocol (BGP) Anycast,
// Equal-Cost Multi-Path (ECMP), GeoDNS latency-based proximity routing, Maglev consistent hashing,
// automated Route53/Cloudflare GSLB health steering, and BGP Flowspec DDoS mitigation.

export interface EdgePoP {
  id: string;
  name: string;
  city: string;
  region: string;
  bgpAsn: number;
  status: 'ACTIVE' | 'WITHDRAWN' | 'DEGRADED' | 'SCRUBBING';
  activeRoutesCount: number;
  latencyToOriginMs: number;
  egressBps: string;
  healthScore: number;
  coordinates: { x: number; y: number };
}

export interface GslbAnycastModel {
  id: string;
  name: string;
  category: string;
  badge: string;
  routingConvergenceLatency: string;
  failoverConvergenceSla: string;
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

export interface SyntheticProbeResult {
  clientLocation: string;
  routedPoPId: string;
  routedPoPCity: string;
  measuredRttMs: number;
  bgpHops: number;
  protocol: 'HTTP/3 QUIC' | 'TLS 1.3 TCP' | 'BGP ECMP';
  status: 'OPTIMAL' | 'FAILOVER_REROUTED' | 'SCRUBBED';
}

export const INITIAL_EDGE_POPS: EdgePoP[] = [
  {
    id: 'pop-iad',
    name: 'US-East Edge (IAD)',
    city: 'Ashburn, Virginia',
    region: 'North America',
    bgpAsn: 13335,
    status: 'ACTIVE',
    activeRoutesCount: 42,
    latencyToOriginMs: 4.2,
    egressBps: '48.5 Gbps',
    healthScore: 99.98,
    coordinates: { x: 195, y: 135 }
  },
  {
    id: 'pop-fra',
    name: 'EU-Central Edge (FRA)',
    city: 'Frankfurt, Germany',
    region: 'Europe',
    bgpAsn: 13335,
    status: 'ACTIVE',
    activeRoutesCount: 38,
    latencyToOriginMs: 14.8,
    egressBps: '36.2 Gbps',
    healthScore: 99.95,
    coordinates: { x: 375, y: 110 }
  },
  {
    id: 'pop-sin',
    name: 'AP-South Edge (SIN)',
    city: 'Singapore',
    region: 'Southeast Asia',
    bgpAsn: 13335,
    status: 'ACTIVE',
    activeRoutesCount: 34,
    latencyToOriginMs: 22.4,
    egressBps: '29.8 Gbps',
    healthScore: 99.92,
    coordinates: { x: 535, y: 220 }
  },
  {
    id: 'pop-nrt',
    name: 'AP-East Edge (NRT)',
    city: 'Tokyo, Japan',
    region: 'East Asia',
    bgpAsn: 13335,
    status: 'ACTIVE',
    activeRoutesCount: 31,
    latencyToOriginMs: 18.6,
    egressBps: '24.1 Gbps',
    healthScore: 99.96,
    coordinates: { x: 595, y: 138 }
  },
  {
    id: 'pop-syd',
    name: 'OC-South Edge (SYD)',
    city: 'Sydney, Australia',
    region: 'Oceania',
    bgpAsn: 13335,
    status: 'ACTIVE',
    activeRoutesCount: 26,
    latencyToOriginMs: 31.2,
    egressBps: '18.4 Gbps',
    healthScore: 99.91,
    coordinates: { x: 615, y: 275 }
  }
];

export const GSLB_ANYCAST_MODELS: GslbAnycastModel[] = [
  {
    id: 'bgp-anycast-ecmp-routing',
    name: 'BGP Anycast with ECMP Equal-Cost Multi-Path',
    category: 'Edge Network Ingress',
    badge: 'BGP Anycast / ECMP',
    routingConvergenceLatency: 'sub-12ms edge convergence',
    failoverConvergenceSla: '99.999% packet delivery during route withdrawals',
    algorithmFormula: 'Cost(path) = (10^8 / Bandwidth) + AS_PATH_Length',
    blastRadiusContainment: 'Autonomous System perimeter isolation; zero cascading BGP flaps',
    architecturalInvariant: 'All PoPs announce identical /24 IPv4 and /48 IPv6 prefixes to Tier-1 transit providers',
    description: 'Announces unified global VIP IP addresses across 200+ PoPs worldwide via BGP AS 13335. Tier-1 transit providers leverage Equal-Cost Multi-Path (ECMP) to route client packets to the topologically closest edge point of presence, reducing global P95 network latency by 68%.',
    workflowPhases: [
      {
        name: 'Prefix Announcement & Route Propagation',
        description: 'BGP speakers at each PoP announce identical /24 IPv4 prefixes to upstream transit providers via eBGP peering sessions.',
        invariants: 'Announced prefix length >= /24 for IPv4 and >= /48 for IPv6 to prevent transit filtering'
      },
      {
        name: 'Tier-1 AS-PATH Best Path Selection',
        description: 'Internet routers select the shortest AS-PATH and lowest IGP metric to forward client SYN packets to nearest PoP.',
        invariants: 'Shortest AS-PATH length guarantees sub-15ms edge latency for 92% of global clients'
      },
      {
        name: 'ECMP Hardware Hash Distribution',
        description: 'Top-of-Rack edge switches use 5-tuple packet hashing to spray incoming flows across redundant L4 load balancers.',
        invariants: 'MurmurHash-based 5-tuple hashing ensures zero packet reordering within active TCP streams'
      },
      {
        name: 'Graceful BGP Route Withdrawal',
        description: 'During maintenance or health degradation, PoP withdraws BGP prefix, triggering sub-12ms transit reconvergence to secondary PoP.',
        invariants: 'BGP WITHDRAW message executed before draining connections prevents TCP blackholes'
      }
    ],
    productionOutcomes: {
      'Edge Latency Reduction': '68% reduction in global P95 client handshake latency',
      'Prefix Failover Time': 'sub-12ms BGP transit reconvergence on PoP withdrawal',
      'DDoS Absorption Capacity': 'Distributed across 200+ PoPs without single-point transit saturation',
      'ECMP Hash Balance': '99.7% uniform flow distribution across edge cluster workers'
    },
    specCode: `// Bird BGP Daemon Configuration for Anycast VIP Advertisement
router id 198.51.100.1;

protocol kernel {
  scan time 10;
  ipv4 { import none; export all; };
}

protocol device {
  scan time 10;
}

// BGP Peering with Tier-1 Transit Provider
protocol bgp transit_upstream {
  local as 13335;
  neighbor 203.0.113.1 as 64512;
  multihop;
  
  ipv4 {
    import none;
    export filter {
      if net = 198.51.100.0/24 then {
        bgp_community.add((13335, 100)); // Standard PoP tag
        bgp_med = 10;
        accept;
      }
      reject;
    };
  };
}`
  },
  {
    id: 'geodns-latency-proximity-routing',
    name: 'GeoDNS & Latency-Based Dynamic Proximity Routing',
    category: 'Global DNS Resolution',
    badge: 'EDNS0 / GeoDNS',
    routingConvergenceLatency: 'sub-2.4ms DNS lookup',
    failoverConvergenceSla: 'sub-15s TTL failover propagation',
    algorithmFormula: 'Proximity = GeohashMatch(Client_Subnet) * Weight + LatencyBias',
    blastRadiusContainment: 'EDNS Client Subnet (ECS) caching isolates local DNS resolver scope',
    architecturalInvariant: 'Authoritative nameservers parse RFC 7871 EDNS0 Client Subnet for precise client geocoding',
    description: 'Dynamic GeoDNS routing engine utilizing EDNS0 Client Subnet (RFC 7871) to inspect the client actual ISP network prefix. Synthesizes real-time Internet latency telemetry matrix to return optimal regional A/AAAA VIPs, preventing poor ISP routing decisions.',
    workflowPhases: [
      {
        name: 'Recursive Resolver EDNS0 Injection',
        description: 'Recursive DNS resolvers forward client /24 subnet in EDNS0 option 8 to authoritative nameservers.',
        invariants: 'Client privacy preserved by truncating IPv4 to /24 and IPv6 to /56'
      },
      {
        name: 'Geographic IP & ASN Topology Lookup',
        description: 'Authoritative nameserver evaluates MaxMind GeoIP2 and real-time RUM latency matrix in memory in sub-0.3ms.',
        invariants: 'Deterministic geohash match yields lowest RTT datacenter endpoint'
      },
      {
        name: 'Health-Biased Dynamic Weighting',
        description: 'Endpoints with health scores below 90% receive reduced DNS traffic weight via continuous Route53 synthetic checks.',
        invariants: 'Unhealthy datacenters excluded from A-record answer set in sub-10 seconds'
      },
      {
        name: 'Adaptive Low-TTL Record Synthesis',
        description: 'Synthesizes A/AAAA DNS records with 30-second TTL to guarantee rapid client cutover during regional incidents.',
        invariants: '30s TTL balances DNS cache efficiency against disaster failover speed'
      }
    ],
    productionOutcomes: {
      'DNS Resolution Speed': 'P99 < 2.4ms resolution via global Anycast authoritative nameservers',
      'Regional Mapping Accuracy': '98.6% accurate client-to-datacenter proximity assignment',
      'Failover Propagation': 'sub-15s global traffic evacuation from impaired datacenters',
      'ISP Loop Bypassing': 'Eliminates recursive resolver geographic mismatch via EDNS0'
    },
    specCode: `// CoreDNS GeoDNS & EDNS Client Subnet Policy Plugin
.:53 {
  ecs {
    ipv4-mask 24
    ipv6-mask 56
  }
  
  geodns {
    database /etc/coredns/GeoLite2-City.mmdb
    policy proximity_latency
    fallback pop-iad
    
    endpoint us_east {
      region NA
      vip 198.51.100.10
      weight 100
      health_check /healthz 2s
    }
    
    endpoint eu_central {
      region EU
      vip 198.51.100.20
      weight 100
      health_check /healthz 2s
    }
  }
  
  cache 30
  prometheus :9153
}`
  },
  {
    id: 'tcp-anycast-connection-migration',
    name: 'Cross-Continent TCP Anycast with Maglev Consistent Hashing',
    category: 'Layer-4 Load Balancing',
    badge: 'Maglev / Consistent Hash',
    routingConvergenceLatency: 'sub-0.15ms lookup overhead',
    failoverConvergenceSla: 'Zero TCP RST resets on BGP route flaps',
    algorithmFormula: 'Lookup(5-tuple) = Entry[Hash1(5-tuple) + i * Hash2(5-tuple) mod M]',
    blastRadiusContainment: 'Connection tracking synchronization eliminates cross-PoP session aborts',
    architecturalInvariant: 'Consistent hashing lookup table M=65537 guarantees minimal disruption on backend node changes',
    description: 'Solves the fundamental flaw of Anycast TCP: route flaps causing packet delivery to alternative PoPs mid-connection. Deploys Google Maglev-style consistent hashing lookup tables combined with cross-PoP QUIC connection migration and eBPF socket handoffs to prevent TCP resets.',
    workflowPhases: [
      {
        name: 'Maglev Consistent Hashing Table Lookup',
        description: 'L4 load balancer maps TCP 5-tuple to backend pool through a permutation table with prime size M=65537.',
        invariants: 'Backend addition or removal shifts at most 1/N existing connections'
      },
      {
        name: 'Encapsulated Generic Routing (GRE/GUE)',
        description: 'Packets forwarded to application hosts via Generic UDP Encapsulation (GUE) preserving original client IP.',
        invariants: 'Direct Server Return (DSR) bypasses L4 balancer for outbound response traffic'
      },
      {
        name: 'BGP Route Flap Resilient Handoff',
        description: 'If intermediate ISP flaps route to a different PoP, secondary PoP verifies QUIC Connection ID or forwards over backbone.',
        invariants: 'QUIC Connection ID matches independent of client IP/Port or ingress PoP'
      },
      {
        name: 'Kernel eBPF Socket Dispatch',
        description: 'Kernel sockops program extracts socket lookup directly in XDP layer before Linux network stack allocation.',
        invariants: 'Sub-15us kernel bypass packet dispatch with zero memory allocations'
      }
    ],
    productionOutcomes: {
      'TCP Reset Rate': '0.001% TCP RST rate during major BGP route withdrawal events',
      'DSR Throughput': '80 Gbps Direct Server Return line rate per 1U L4 router',
      'QUIC Migration Success': '100% seamless connection migration across IP changes',
      'Lookup Complexity': 'O(1) deterministic hardware packet routing in < 0.15 microseconds'
    },
    specCode: `// Linux XDP / eBPF Maglev Consistent Hashing Implementation
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

#define MAGLEV_TABLE_SIZE 65537

struct {
  __uint(type, BPF_MAP_TYPE_ARRAY);
  __type(key, __u32);
  __type(value, __u32);
  __uint(max_entries, MAGLEV_TABLE_SIZE);
} maglev_lookup_table SEC(".maps");

SEC("xdp")
int xdp_maglev_balancer(struct xdp_md *ctx) {
  void *data = (void *)(long)ctx->data;
  void *data_end = (void *)(long)ctx->data_end;
  
  // 5-tuple hash calculation
  __u32 hash = compute_5tuple_hash(data, data_end);
  __u32 index = hash % MAGLEV_TABLE_SIZE;
  
  __u32 *backend_id = bpf_map_lookup_elem(&maglev_lookup_table, &index);
  if (!backend_id) return XDP_PASS;
  
  return route_to_backend(ctx, *backend_id);
}`
  },
  {
    id: 'automated-gslb-traffic-steering',
    name: 'Multi-Cloud GSLB Traffic Steering with Weighted Canaries',
    category: 'Traffic Control Plane',
    badge: 'Multi-Cloud GSLB',
    routingConvergenceLatency: 'sub-8s global control plane sync',
    failoverConvergenceSla: 'Zero downtime automated regional evacuation',
    algorithmFormula: 'Weight(region) = BaseWeight * AvailabilityFactor * (1 - LatencyPenalty)',
    blastRadiusContainment: 'Canary weight increments capped at 5% per 10-minute stabilization interval',
    architecturalInvariant: 'Health checker monitors both Layer-4 TCP port and Layer-7 deep dependency canary endpoint',
    description: 'Centralized multi-cloud GSLB control plane orchestrating traffic steering across AWS, GCP, and on-premises colocation. Dynamically calculates regional weights using synthetic canary latency, error rates, and capacity limits, automatically draining impaired regions in sub-8 seconds.',
    workflowPhases: [
      {
        name: 'Deep Synthetic Health Probing',
        description: 'Multi-region probing agents execute 5-second HTTP/2 health checks validating database and cache read/write vitality.',
        invariants: 'Health check requires 3 consecutive successes to declare region operational'
      },
      {
        name: 'Automated Weight Recalculation',
        description: 'Control plane recalculates DNS and Anycast route weights based on real-time P99 latency and CPU saturation.',
        invariants: 'Automated down-scaling occurs instantly; recovery ramping follows stepped canary'
      },
      {
        name: 'Synchronized DNS & BGP Control Plane',
        description: 'Pushes updated weights simultaneously to Route53 ARC, Cloudflare Traffic Director, and edge BGP communities.',
        invariants: 'Sub-8 second global distribution of routing control plane updates'
      },
      {
        name: 'Safe Evacuation & Drain Verification',
        description: 'Gradual weight reduction to 0% ensures in-flight transactions complete without premature connection teardown.',
        invariants: 'Draining interval of 60 seconds honors database transaction lifecycles'
      }
    ],
    productionOutcomes: {
      'Regional Failover Time': 'sub-8s automated traffic diversion on regional outage',
      'Multi-Cloud Utilization': '99.4% balanced traffic distribution across AWS and GCP',
      'False-Positive Resistance': 'Zero false-alarm traffic shifts over 24 consecutive months',
      'Disaster Recovery RTO': 'RTO < 10s for complete datacenter loss with 0 data corruption'
    },
    specCode: `// OpenTofu / Terraform AWS Route53 Application Recovery Controller (ARC)
resource "aws_route53recoverycontrolconfig_routing_control" "primary_east" {
  name        = "primary-us-east-routing-gate"
  cluster_arn = aws_route53recoverycontrolconfig_cluster.production.arn
}

resource "aws_route53recoverycontrolconfig_safety_rule" "minimum_alive" {
  name                   = "minimum-two-regions-active"
  control_panel_arn      = aws_route53recoverycontrolconfig_control_panel.main.arn
  rule_config {
    inverted  = false
    threshold = 2
    type      = "ATLEAST"
  }
  gating_controls = [
    aws_route53recoverycontrolconfig_routing_control.primary_east.arn,
    aws_route53recoverycontrolconfig_routing_control.primary_eu.arn,
    aws_route53recoverycontrolconfig_routing_control.primary_apac.arn
  ]
}`
  },
  {
    id: 'ddos-scrubbing-bgp-flowspec',
    name: 'Distributed PoP DDoS Scrubbing & BGP Flowspec Rate Limiting',
    category: 'Perimeter DDoS Defense',
    badge: 'BGP Flowspec / XDP',
    routingConvergenceLatency: 'sub-350ms rule dissemination',
    failoverConvergenceSla: '1.2 Tbps volumetric attack absorption',
    algorithmFormula: 'Action(flow) = FlowspecRule(SrcPrefix, DstPort, PacketLength) -> RateLimit / Drop',
    blastRadiusContainment: 'Flowspec rules target exact attack signature, preserving legitimate tenant traffic',
    architecturalInvariant: 'RFC 5575 BGP Flowspec rules propagate upstream to Tier-1 transit within 350ms of anomaly detection',
    description: 'Automated perimeter DDoS defense architecture combining FastNetMon telemetry with RFC 5575 BGP Flowspec. Detects volumetric SYN floods, DNS amplification, and NTP reflection attacks in sub-second time, advertising granular discard rules to upstream transit providers to scrub attacks before edge ingestion.',
    workflowPhases: [
      {
        name: 'sFlow & IPFIX Anomaly Detection',
        description: 'Real-time telemetry collectors analyze 1-in-1000 sampled packets identifying anomalous volumetric spikes.',
        invariants: 'Attack detection threshold triggered when traffic exceeds 300% of rolling 1-hour baseline'
      },
      {
        name: 'Dynamic BGP Flowspec Rule Generation',
        description: 'Automated mitigation daemon synthesizes granular RFC 5575 Flowspec filters targeting attack IP and packet lengths.',
        invariants: 'Exact tuple matching prevents collateral drops of legitimate customer traffic'
      },
      {
        name: 'Upstream Transit Rule Dissemination',
        description: 'BGP speaker injects Flowspec NLRI into peering sessions with Tier-1 carriers (Lumen, Telia, NTT).',
        invariants: 'Upstream edge transit drops attack traffic before it crosses client peering links'
      },
      {
        name: 'XDP Line-Rate Packet Drop Fallback',
        description: 'Edge servers execute eBPF XDP programs dropping residual volumetric packets in the network card ring buffer.',
        invariants: 'Sub-microsecond XDP_DROP processing 14.88M packets per second per 100GbE NIC'
      }
    ],
    productionOutcomes: {
      'Attack Scrubbing Capacity': '1.2 Tbps volumetric flood mitigated with zero origin impact',
      'Mitigation Reaction Time': 'sub-350ms from attack onset to BGP Flowspec rule enforcement',
      'Legitimate Traffic Retention': '100% legitimate client request delivery during active floods',
      'CPU Saturation Shield': 'Zero CPU overhead on application layer due to XDP NIC-level discard'
    },
    specCode: `// GoBGP RFC 5575 Flowspec Rule Injection for Volumetric Attack Scrubbing
package main

import (
  "context"
  gobgp "github.com/osrg/gobgp/v3/api"
)

func advertiseFlowspecFilter(client gobgp.GobgpApiClient, targetIP string, attackPort uint32) error {
  flowspecNLRI := &gobgp.FlowSpecNLRI{
    Rules: []*gobgp.FlowSpecRule{
      {Type: gobgp.FLOW_SPEC_TYPE_DST_PREFIX, Value: targetIP + "/32"},
      {Type: gobgp.FLOW_SPEC_TYPE_DST_PORT, Value: fmt.Sprintf("==%d", attackPort)},
      {Type: gobgp.FLOW_SPEC_TYPE_PKT_LEN, Value: ">=1200"},
    },
  }

  // Action: Rate limit to 0 (Drop packet at upstream transit router)
  action := &gobgp.TrafficRateExtended{Rate: 0.0}

  _, err := client.AddPath(context.Background(), &gobgp.AddPathRequest{
    TableType: gobgp.TableType_GLOBAL,
    Path: &gobgp.Path{
      Family: &gobgp.Family{Afi: gobgp.Family_AFI_IP, Safi: gobgp.Family_SAFI_FLOW_SPEC_UNICAST},
      Nlri:   flowspecNLRI,
      Actions: []*gobgp.Action{action},
    },
  })
  return err
}`
  }
];

export const SYNTHETIC_PROBES: SyntheticProbeResult[] = [
  {
    clientLocation: 'New York, USA',
    routedPoPId: 'pop-iad',
    routedPoPCity: 'Ashburn, Virginia',
    measuredRttMs: 6.8,
    bgpHops: 3,
    protocol: 'HTTP/3 QUIC',
    status: 'OPTIMAL'
  },
  {
    clientLocation: 'London, UK',
    routedPoPId: 'pop-fra',
    routedPoPCity: 'Frankfurt, Germany',
    measuredRttMs: 14.2,
    bgpHops: 4,
    protocol: 'HTTP/3 QUIC',
    status: 'OPTIMAL'
  },
  {
    clientLocation: 'Jakarta, Indonesia',
    routedPoPId: 'pop-sin',
    routedPoPCity: 'Singapore',
    measuredRttMs: 18.5,
    bgpHops: 4,
    protocol: 'TLS 1.3 TCP',
    status: 'OPTIMAL'
  },
  {
    clientLocation: 'Seoul, South Korea',
    routedPoPId: 'pop-nrt',
    routedPoPCity: 'Tokyo, Japan',
    measuredRttMs: 22.1,
    bgpHops: 3,
    protocol: 'HTTP/3 QUIC',
    status: 'OPTIMAL'
  },
  {
    clientLocation: 'Auckland, New Zealand',
    routedPoPId: 'pop-syd',
    routedPoPCity: 'Sydney, Australia',
    measuredRttMs: 27.4,
    bgpHops: 4,
    protocol: 'TLS 1.3 TCP',
    status: 'OPTIMAL'
  }
];

export const GSLB_ANYCAST_PARADIGMS = GSLB_ANYCAST_MODELS;

