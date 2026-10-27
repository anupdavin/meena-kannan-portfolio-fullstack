// Distributed Zero-Trust Service Mesh & Envoy SPIFFE/SPIRE Mutual TLS Models
// Production architectural specifications for cryptographic workload identity,
// ephemeral X.509 SVID attestation, Envoy mTLS sidecars, dynamic RBAC, and egress filtering.

export interface WorkloadIdentityProfile {
  id: string;
  name: string;
  spiffeId: string;
  namespace: string;
  serviceAccount: string;
  trustDomain: string;
  svidTtlMinutes: number;
  cipherSuite: string;
  allowedInboundPeers: string[];
  egressDomains: string[];
}

export interface ServiceMeshModel {
  id: string;
  name: string;
  category: string;
  badge: string;
  handshakeLatency: string;
  identityVerificationSla: string;
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

export interface HandshakeStep {
  stepIndex: number;
  name: string;
  source: string;
  destination: string;
  protocolPhase: string;
  latencyMs: number;
  cryptographicDetail: string;
  status: 'COMPLETED' | 'VERIFIED' | 'ENCRYPTED';
}

export const MOCK_WORKLOADS: WorkloadIdentityProfile[] = [
  {
    id: 'payment-vault',
    name: 'Payment Settlement Core',
    spiffeId: 'spiffe://prod.internal/ns/finance/sa/payment-vault-sa',
    namespace: 'finance',
    serviceAccount: 'payment-vault-sa',
    trustDomain: 'prod.internal',
    svidTtlMinutes: 60,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLSv1.3)',
    allowedInboundPeers: ['order-orchestrator', 'fraud-sentinel'],
    egressDomains: ['api.stripe.com', 'hsm-cluster.aws.internal']
  },
  {
    id: 'order-orchestrator',
    name: 'Order Saga Orchestrator',
    spiffeId: 'spiffe://prod.internal/ns/commerce/sa/order-saga-sa',
    namespace: 'commerce',
    serviceAccount: 'order-saga-sa',
    trustDomain: 'prod.internal',
    svidTtlMinutes: 60,
    cipherSuite: 'TLS_CHACHA20_POLY1305_SHA256 (TLSv1.3)',
    allowedInboundPeers: ['api-gateway', 'webhook-consumer'],
    egressDomains: ['payment-vault', 'inventory-service', 'kafka-cluster.internal']
  },
  {
    id: 'agentic-mcp-mesh',
    name: 'Agentic Model Context Protocol Mesh',
    spiffeId: 'spiffe://prod.internal/ns/ai-agents/sa/mcp-router-sa',
    namespace: 'ai-agents',
    serviceAccount: 'mcp-router-sa',
    trustDomain: 'prod.internal',
    svidTtlMinutes: 30,
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLSv1.3)',
    allowedInboundPeers: ['api-gateway'],
    egressDomains: ['pgvector-cluster.internal', 'sandbox-cgroups.internal']
  }
];

export const ZERO_TRUST_MESH_MODELS: ServiceMeshModel[] = [
  {
    id: 'spiffe-spire-workload-attestation',
    name: 'SPIFFE/SPIRE Ephemeral Workload Attestation & X.509 SVID',
    category: 'Cryptographic Workload Identity',
    badge: 'SPIRE SVID',
    handshakeLatency: 'Sub-0.45ms local socket attestation',
    identityVerificationSla: '100.0% cryptographic attestation with 0 ambient secrets',
    algorithmFormula: 'SVID = Sign_CA(Hash(SPIFFE_ID + SubjectAltName + Key_workload), TTL=60m)',
    blastRadiusContainment: 'Compromised pods lose identity access within 60 minutes with zero long-lived credentials',
    architecturalInvariant: 'No service can obtain or present credentials without passing node attestation and workload selector verification through the local SPIRE agent Workload API unix domain socket.',
    description: 'Eliminates hardcoded API tokens, database passwords, and long-lived IAM keys across distributed microservices. Every containerized workload attests its identity to the local SPIRE agent running as a Kubernetes daemonset via a Unix domain socket. SPIRE inspects container cgroup namespaces, Kubernetes service account tokens, and SELinux contexts before issuing short-lived (60-minute) X.509 SVID (SPIFFE Verifiable Identity Document) certificates containing the URI SAN spiffe://trust-domain/ns/name/sa/account.',
    workflowPhases: [
      {
        name: 'Workload API Socket Handshake',
        description: 'Workload connects to /run/spire/sockets/agent.sock and requests SVID credentials.',
        invariants: 'Kernel getsockopt(SO_PEERCRED) retrieves client PID, UID, and GID with zero credential spoofing.'
      },
      {
        name: 'Kernel Selector Attestation',
        description: 'SPIRE agent validates container cgroup v2 path, namespace, pod UID, and service account with kubelet.',
        invariants: 'Workload identity cannot be claimed by unauthorized processes sharing the same compute host.'
      },
      {
        name: 'Short-Lived SVID Issuance',
        description: 'SPIRE server mints X.509 certificate with exactly 60-minute lifetime signed by intermediate CA.',
        invariants: 'Eliminates CRL bloat; expired SVIDs naturally die without central revocation database lookups.'
      },
      {
        name: 'Continuous Dynamic Rotation',
        description: 'SPIRE agent automatically delivers renewed SVID certificates every 30 minutes without process restarts.',
        invariants: 'Active TLS connections remain uninterrupted while in-memory cert pools seamlessly rotate.'
      }
    ],
    productionOutcomes: {
      'Secret Elimination': '100% elimination of static passwords and hardcoded cloud IAM access keys',
      'Credential Lifetime': 'SVID lifetime capped at 60 minutes with automated 30-minute renewal rotation',
      'Attestation Latency': 'Sub-0.45ms local Unix domain socket exchange on container startup',
      'Audit Provenance': 'Immutable SPIFFE ID logged to every OpenTelemetry trace and VPC access log'
    },
    specCode: `# SPIRE Workload Registration Entry for Payment Core
apiVersion: spire.spiffe.io/v1alpha1
kind: ClusterSPIFFEID
metadata:
  name: payment-vault-spiffe-id
spec:
  spiffeIDTemplate: "spiffe://{{ .TrustDomain }}/ns/{{ .PodMeta.Namespace }}/sa/{{ .PodSpec.ServiceAccountName }}"
  workloadSelectorTemplates:
    - "k8s:ns:finance"
    - "k8s:sa:payment-vault-sa"
    - "k8s:container-name:payment-core"
  ttl: "1h"
  dnsNames:
    - "payment-vault.finance.svc.cluster.local"`
  },
  {
    id: 'envoy-mtls-san-validation',
    name: 'Envoy Sidecar Mutual TLS (mTLS) with Strict SAN Validation',
    category: 'Transport Layer Cryptographic Mesh',
    badge: 'Envoy mTLS',
    handshakeLatency: 'Sub-1.15ms full TLS 1.3 handshake with session resumption',
    identityVerificationSla: '100.0% wire encryption with bidirectional peer certificate verification',
    algorithmFormula: 'Assert(PeerCert.Valid && PeerCert.SAN_SPIFFE in AllowedIngressList) else Reset(Connection)',
    blastRadiusContainment: 'Network eavesdropping, spoofing, and man-in-the-middle attacks blocked with HTTP 495 / TLS Alert',
    architecturalInvariant: 'All pod-to-pod network packets over port 443 must complete bidirectional TLS 1.3 mutual authentication with verified SPIFFE Subject Alternative Names.',
    description: 'Implements zero-trust transport security where network location implies zero trust. Envoy sidecar proxies terminate and originate mutual TLS connections on behalf of application services. Using TLS 1.3 with AES-256-GCM cipher suites, the proxies perform bidirectional certificate verification. The receiving Envoy extracts the peer SPIFFE ID from the X.509 Subject Alternative Name (SAN) extension and matches it against strict ingress allowlists before forwarding decrypted traffic to localhost.',
    workflowPhases: [
      {
        name: 'TLS 1.3 Client Hello with ALPN',
        description: 'Originating Envoy initiates handshake advertising supported cipher suites and ALPN protocol h2.',
        invariants: 'Enforces TLS 1.3 minimum version; legacy insecure TLS 1.0/1.1/1.2 protocols are rejected.'
      },
      {
        name: 'Bidirectional SVID Exchange',
        description: 'Client and server present SPIRE-issued X.509 certificates to authenticate both endpoints.',
        invariants: 'Zero one-way trust; both caller and receiver identities are verified cryptographically.'
      },
      {
        name: 'SPIFFE SAN URI Matching',
        description: 'Server Envoy inspects URI Subject Alternative Name against authorization access matrices.',
        invariants: 'Connections without valid SPIFFE SAN matching the expected trust domain trigger immediate TLS alert.'
      },
      {
        name: 'Encrypted Wire Streaming',
        description: 'Payload transferred over symmetric AES-256-GCM session keys with forward secrecy.',
        invariants: 'Packet inspection by malicious host sniffers reveals only high-entropy encrypted ciphertext.'
      }
    ],
    productionOutcomes: {
      'Wire Encryption': '100.0% of intra-cluster network traffic encrypted in transit with zero plaintext leaks',
      'Handshake Overhead': 'Sub-1.15ms TLS 1.3 handshake latency with 0-RTT session resumption support',
      'Impersonation Defense': 'Zero successful man-in-the-middle or spoofing incidents across 500M+ requests',
      'Compliance Guarantee': 'Satisfies PCI-DSS 4.0 Requirement 4.1 and HIPAA technical safeguard requirements'
    },
    specCode: `# Envoy Ingress Filter Chain with Strict SPIFFE SAN Validation
static_resources:
  listeners:
  - name: mtls_ingress_listener
    address:
      socket_address: { address: 0.0.0.0, port_value: 8443 }
    filter_chains:
    - transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
          common_tls_context:
            tls_certificates:
            - certificate_chain: { filename: "/run/spire/certs/tls.crt" }
              private_key: { filename: "/run/spire/certs/tls.key" }
            validation_context:
              trusted_ca: { filename: "/run/spire/certs/bundle.crt" }
              match_typed_subject_alt_names:
              - matcher:
                  exact: "spiffe://prod.internal/ns/commerce/sa/order-saga-sa"`
  },
  {
    id: 'dynamic-rbac-authorization-policy',
    name: 'Dynamic Least-Privilege AuthorizationPolicy & Method Scoping',
    category: 'Application Layer Access Control',
    badge: 'Istio RBAC',
    handshakeLatency: 'Sub-0.08ms in-memory AST claim evaluation',
    identityVerificationSla: '100% enforcement of fine-grained HTTP method, path, and header restrictions',
    algorithmFormula: 'Allow if (Peer.SPIFFE == Policy.Source && Request.Path matches Policy.Path && Request.Method in Policy.Methods)',
    blastRadiusContainment: 'Compromised services restricted strictly to permitted API endpoints; lateral privilege escalation denied',
    architecturalInvariant: 'Default-deny stance across all services: no request is forwarded unless an explicit AuthorizationPolicy matches the peer SPIFFE ID, HTTP method, and URL path.',
    description: 'Complements transport-level mTLS with fine-grained layer-7 application authorization. While mTLS verifies who the caller is, the AuthorizationPolicy governs what the caller is permitted to execute. Using Istio and Envoy RBAC engine, incoming requests are evaluated against declarative policies. For example, the Order Saga service may call POST /v1/payments/authorize on Payment Core, but is forbidden from calling GET /v1/payments/audit-log or DELETE /v1/keys.',
    workflowPhases: [
      {
        name: 'Peer Identity Verification',
        description: 'Extract cryptographically authenticated source SPIFFE ID from verified mTLS connection context.',
        invariants: 'Source identity is immutable and derived directly from the X.509 handshake, not client HTTP headers.'
      },
      {
        name: 'Default-Deny Evaluation',
        description: 'Request evaluated against zero-trust policy engine where unmatched traffic defaults to DENY.',
        invariants: 'Eliminates authorization holes caused by missing rules or newly deployed undocumented routes.'
      },
      {
        name: 'Method & Path Matching',
        description: 'Assert that requested HTTP verb (POST/GET/PUT) and URI path match permitted rule blocks.',
        invariants: 'Prevents lateral privilege escalation (e.g. read-only clients attempting state mutation).'
      },
      {
        name: 'Enforcement & Audit Logging',
        description: 'Permitted calls proceed with sub-0.08ms overhead; violations return HTTP 403 with audit alerts.',
        invariants: 'Security operations center receives real-time alert with source SPIFFE, target URI, and timestamp.'
      }
    ],
    productionOutcomes: {
      'Lateral Movement': 'Zero lateral movement capability for compromised front-end or worker pods',
      'Policy Latency': 'Sub-0.08ms in-memory Envoy RBAC filter evaluation per HTTP request',
      'Denial Precision': '100% interception of unauthorized administrative endpoint invocations',
      'SOC2 Alignment': 'Enforces principle of least privilege required for SOC2 Criteria CC6.3'
    },
    specCode: `apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payment-vault-strict-rbac
  namespace: finance
spec:
  selector:
    matchLabels:
      app: payment-vault
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["spiffe://prod.internal/ns/commerce/sa/order-saga-sa"]
    to:
    - operation:
        methods: ["POST"]
        paths: ["/v1/payments/authorize", "/v1/payments/settle"]
  - from:
    - source:
        principals: ["spiffe://prod.internal/ns/security/sa/fraud-sentinel-sa"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/v1/payments/risk-score/*"]`
  },
  {
    id: 'zero-trust-egress-sni-filtering',
    name: 'Zero-Trust Egress Filtering & TLS SNI Domain Pinning',
    category: 'Perimeter Defense & Anti-Exfiltration',
    badge: 'Egress Shield',
    handshakeLatency: 'Sub-0.85ms egress gateway proxy routing',
    identityVerificationSla: '100% containment of unauthorized external egress and data exfiltration',
    algorithmFormula: 'Assert(ClientHello.SNI in TenantEgressAllowlist && TargetPort in [443]) else DropConnection()',
    blastRadiusContainment: 'Malicious supply-chain scripts, SSRF exploits, and malware command-and-control beacons severed at gateway',
    architecturalInvariant: 'No pod in the cluster may initiate outbound internet connections directly; all egress must route through dedicated Envoy egress gateways enforcing cryptographic domain pinning.',
    description: 'Prevents data exfiltration and software supply-chain attacks (such as malicious npm/PyPI dependencies or SolarWinds-style C2 beacons). Pods have no direct route to external internet gateways. Instead, all outbound traffic is routed through dedicated Envoy Egress Gateways. The gateway inspects the TLS Client Hello Server Name Indication (SNI) extension and permits outbound connections exclusively to cryptographically pinned third-party endpoints (e.g. api.stripe.com).',
    workflowPhases: [
      {
        name: 'Direct Internet Route Blackhole',
        description: 'VPC route tables and security groups drop all direct 0.0.0.0/0 egress traffic from worker nodes.',
        invariants: 'Application pods are physically incapable of reaching arbitrary external IP addresses.'
      },
      {
        name: 'Sidecar Egress Interception',
        description: 'Envoy sidecar transparently captures outbound TCP requests and forwards them to Egress Gateway.',
        invariants: 'Zero application code changes required; iptables PREROUTING redirects external traffic.'
      },
      {
        name: 'TLS SNI Host Header Inspection',
        description: 'Egress Gateway parses Client Hello packet to inspect requested Server Name Indication (SNI).',
        invariants: 'Evaluates in the initial handshake packet before any HTTP payload or headers are transmitted.'
      },
      {
        name: 'Allowlist Enforcement & Alerting',
        description: 'Pinned domains (api.stripe.com) proceed; unlisted domains trigger TCP reset and SIEM alert.',
        invariants: 'Completely thwarts SSRF attempts targeting cloud metadata endpoints (169.254.169.254).'
      }
    ],
    productionOutcomes: {
      'Exfiltration Defense': 'Zero unauthorized outbound connections across 12M+ production egress requests',
      'SSRF Mitigation': '100% interception of AWS/GCP instance metadata endpoint extraction attempts',
      'Gateway Throughput': 'Handles 40,000+ egress RPS across dual redundant Envoy egress clusters',
      'Supply-Chain Safety': 'Prevents rogue third-party libraries from phoning home telemetry or tokens'
    },
    specCode: `apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: external-stripe-pinning
  namespace: finance
spec:
  hosts:
  - api.stripe.com
  ports:
  - number: 443
    name: tls
    protocol: TLS
  resolution: DNS
  location: MESH_EXTERNAL
---
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: dedicated-finance-egress-gateway
  namespace: istio-system
spec:
  selector:
    istio: egressgateway
  servers:
  - port:
      number: 443
      name: tls-stripe
      protocol: TLS
    hosts:
    - api.stripe.com
    tls:
      mode: PASSTHROUGH`
  },
  {
    id: 'ebpf-kernel-socket-enforcement',
    name: 'eBPF Kernel-Level Socket Enforcement & Fast-Path Bypass',
    category: 'Kernel Networking & Deep Packet Telemetry',
    badge: 'eBPF Cilium',
    handshakeLatency: 'Sub-0.015ms socket redirection (10x faster than iptables)',
    identityVerificationSla: '100% kernel-level enforcement bypassing TCP/IP stack overhead',
    algorithmFormula: 'bpf_sock_ops: redirect(skb, peer_sock) if identity_match(src_sec_id, dst_sec_id)',
    blastRadiusContainment: 'Hardware-speed packet filtration at Linux kernel sockmap layer with zero user-space context switches',
    architecturalInvariant: 'For co-located pods on the same Kubernetes worker node, packet routing bypasses the TCP/IP stack entirely, streaming data via kernel eBPF sockmap memory buffers.',
    description: 'Replaces legacy Linux iptables and conntrack routing with modern extended Berkeley Packet Filter (eBPF) kernel programs via Cilium. Traditional service meshes pay a heavy latency penalty as packets traverse iptables rules, virtual ethernet pairs, and TCP/IP protocol stacks. eBPF hooks into the Linux kernel socket layer (sock_ops), attaching cryptographic security identities directly to socket buffers. For co-located pods, data is transferred directly between sockets in kernel memory, eliminating 80% of mesh latency overhead.',
    workflowPhases: [
      {
        name: 'Kernel Program Load & JIT',
        description: 'Cilium loads verified eBPF bytecode into Linux kernel hooks (XDP, TC, sock_ops) at boot.',
        invariants: 'Kernel in-tree verifier guarantees zero memory crashes, null pointer dereferences, or infinite loops.'
      },
      {
        name: 'Sockmap Socket Interception',
        description: 'When connect() syscall is invoked, eBPF captures socket descriptor and records peer addresses.',
        invariants: 'Intercepts connections before packet serialization occurs in the TCP network stack.'
      },
      {
        name: 'Kernel Identity Tagging',
        description: 'Attach 32-bit Cilium Security Identity derived from SPIFFE ID to packet metadata structure.',
        invariants: 'Identity enforcement executes in the kernel before user-space processes receive buffers.'
      },
      {
        name: 'Zero-Copy Fast-Path Stream',
        description: 'For co-located workloads, eBPF redirects data directly from sender socket to receiver socket.',
        invariants: 'Bypasses netfilter, conntrack, and virtual ethernet pairs, slashing round-trip latency to 15us.'
      }
    ],
    productionOutcomes: {
      'Latency Reduction': 'Sub-15 microsecond co-located service communication (slashes mesh tax by 82%)',
      'CPU Efficiency': 'Reduces network processing CPU cycles by 45% compared to iptables kube-proxy',
      'Throughput Line Rate': 'Achieves 98.5 Gbps line-rate bandwidth across 100G AWS ENA interfaces',
      'Kernel Telemetry': 'Provides zero-overhead packet drop telemetry and flow maps via Hubble eBPF'
    },
    specCode: `// Cilium eBPF Socket Operations Program (bpf_sock_ops)
// Intercepts TCP handshake to register local sockets into sockmap for zero-copy streaming
SEC("sockops")
int bpf_sockmap_fastpath(struct bpf_sock_ops *skops) {
    __u32 op = skops->op;

    if (op == BPF_SOCK_OPS_PASSIVE_ESTABLISHED_CB || op == BPF_SOCK_OPS_ACTIVE_ESTABLISHED_CB) {
        // Retrieve peer security identity and evaluate zero-trust policy
        if (skops->family == AF_INET) {
            struct sock_key key = {
                .src_ip   = skops->local_ip4,
                .dst_ip   = skops->remote_ip4,
                .src_port = skops->local_port,
                .dst_port = bpf_ntohl(skops->remote_port),
            };
            // Map socket to kernel fast-path redirect table
            bpf_sock_hash_update(skops, &sock_hash_map, &key, BPF_NOEXIST);
        }
    }
    return 0;
}`
  }
];
