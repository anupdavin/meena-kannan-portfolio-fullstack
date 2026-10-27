// Distributed Multi-Tenant Row-Level Security (RLS) & Cryptographic Tenant Isolation Models
// Production architectural models for PostgreSQL Row-Level Security session context,
// Dynamic Schema-per-Tenant routing with HikariCP, AWS KMS envelope encryption,
// Cross-tenant intrusion leak probes, and weighted noisy-neighbor QoS token buckets.

export interface TenantProfile {
  id: string;
  name: string;
  tier: 'Starter' | 'Professional' | 'Enterprise' | 'Mission-Critical';
  schema: string;
  kmsKeyId: string;
  allocatedRps: number;
  region: string;
  activeRowsCount: number;
  dataClassification: string;
}

export interface TenantIsolationParadigm {
  id: string;
  name: string;
  category: string;
  badge: string;
  isolationLatency: string;
  leakPreventionGuarantee: string;
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

export interface SecurityProbeResult {
  probeId: string;
  testVector: string;
  attemptedTenant: string;
  targetTenant: string;
  status: 'BLOCKED' | 'INTERCEPTED' | 'ISOLATED';
  httpStatus: number;
  executionTimeMs: number;
  mitigationLayer: string;
  auditLogMessage: string;
}

export const MOCK_TENANTS: TenantProfile[] = [
  {
    id: 'tenant-acme',
    name: 'Acme Corporation',
    tier: 'Enterprise',
    schema: 'tenant_acme_prod',
    kmsKeyId: 'arn:aws:kms:us-east-1:112233445566:key/acme-prod-01',
    allocatedRps: 250,
    region: 'us-east-1 (N. Virginia)',
    activeRowsCount: 1485000,
    dataClassification: 'SOC2 Type II / Financial'
  },
  {
    id: 'tenant-stark',
    name: 'Stark Industries Defense',
    tier: 'Mission-Critical',
    schema: 'tenant_stark_prod',
    kmsKeyId: 'arn:aws:kms:us-gov-west-1:998877665544:key/stark-defense-01',
    allocatedRps: 1000,
    region: 'us-gov-west-1 (GovCloud)',
    activeRowsCount: 4820000,
    dataClassification: 'ITAR / FedRAMP High'
  },
  {
    id: 'tenant-cyberdyne',
    name: 'Cyberdyne Systems AI',
    tier: 'Enterprise',
    schema: 'tenant_cyberdyne_prod',
    kmsKeyId: 'arn:aws:kms:eu-central-1:445566778899:key/cyberdyne-ai-01',
    allocatedRps: 500,
    region: 'eu-central-1 (Frankfurt)',
    activeRowsCount: 3150000,
    dataClassification: 'GDPR / ISO 27001'
  }
];

export const TENANT_ISOLATION_MODELS: TenantIsolationParadigm[] = [
  {
    id: 'postgres-rls-session-context',
    name: 'PostgreSQL Row-Level Security with Session Context',
    category: 'Kernel-Level Relational Isolation',
    badge: 'Postgres RLS',
    isolationLatency: 'Sub-0.35ms query overhead',
    leakPreventionGuarantee: '100.0% database engine policy enforcement',
    algorithmFormula: "CREATE POLICY tenant_isolation ON entities USING (tenant_id = current_setting('app.current_tenant')::uuid)",
    blastRadiusContainment: 'Strict query scope; foreign rows omitted from sequential and index scans',
    architecturalInvariant: 'No SQL query or stored procedure can view or mutate records belonging to another tenant ID, even if application code omits WHERE tenant_id clauses.',
    description: 'Enforces tenant boundaries directly inside the PostgreSQL database engine kernel. Every incoming transaction runs SET LOCAL app.current_tenant = :tenantId. The database query planner transparently rewrites every table scan with the security policy predicate. Tables are protected by ALTER TABLE ... FORCE ROW LEVEL SECURITY, ensuring that even table owners and connection pools cannot accidentally bypass isolation.',
    workflowPhases: [
      {
        name: 'Session Variable Injection',
        description: 'Connection checkout hook executes SET LOCAL app.current_tenant = :tenantId within active transaction boundary.',
        invariants: 'Scoped exclusively to the current transaction; automatically cleared when connection returns to HikariCP pool.'
      },
      {
        name: 'Query Planner Rewrite',
        description: 'PostgreSQL optimizer appends security filter predicate to abstract syntax tree before generating query plan.',
        invariants: 'Zero possibility of developer oversight; WHERE tenant_id filter is injected at the database kernel level.'
      },
      {
        name: 'Index Scan Tuple Validation',
        description: 'B-tree index scans and bitmap heap scans evaluate tenant_id predicate on tuple headers prior to buffer return.',
        invariants: 'Foreign tenant index entries are pruned immediately; zero memory leaks into shared buffers.'
      },
      {
        name: 'Connection Clean Reset',
        description: 'Transaction terminates with COMMIT or ROLLBACK, automatically flushing the session variable.',
        invariants: 'Connection pool poisoning is mathematically impossible under transaction-scoped session configuration.'
      }
    ],
    productionOutcomes: {
      'Query Overhead': 'Sub-0.35ms median overhead on complex multi-join queries',
      'Leak Prevention': 'Zero cross-tenant data leaks across 45M+ production queries',
      'Developer Safety': '100% immune to missing WHERE clause bugs in application layers',
      'Compliance Standard': 'Meets SOC2 Type II, HIPAA, and PCI-DSS multi-tenant requirements'
    },
    specCode: `-- Enable Row-Level Security and Force Policy Evaluation
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;

-- Define tenant isolation policy using transaction session setting
CREATE POLICY tenant_isolation_policy ON accounts
  AS RESTRICTIVE
  FOR ALL
  TO application_role
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Application session initialization per transaction
BEGIN;
SELECT set_config('app.current_tenant', '7b4e9f32-841a-4d92-bb81-12f5a894c031', true);
SELECT * FROM accounts; -- Transparently filters to tenant 7b4e9f32
COMMIT;`
  },
  {
    id: 'dynamic-schema-per-tenant',
    name: 'Dynamic Schema-per-Tenant with Connection Routing',
    category: 'Namespace Boundary Isolation',
    badge: 'Schema Routing',
    isolationLatency: 'Sub-1.2ms schema context switch',
    leakPreventionGuarantee: 'Complete physical catalog and DDL isolation',
    algorithmFormula: "SET search_path TO tenant_schema, public; connection.setSchema('tenant_' || tenantId)",
    blastRadiusContainment: 'Total schema isolation; table corruption in one tenant never impacts other schemas',
    architecturalInvariant: 'Each enterprise tenant operates within a dedicated PostgreSQL schema with independent migrations, permissions, and index tablespaces.',
    description: 'Allocates an isolated PostgreSQL schema per enterprise customer while sharing the underlying compute and database cluster. Connection routing is orchestrated via a multi-tenant HikariCP DataSource router that dynamically switches search_path or schema identifiers on connection checkout. This enables customized database migrations, localized schema modifications, and independent table drops without touching neighboring tenants.',
    workflowPhases: [
      {
        name: 'Tenant Routing Lookup',
        description: 'Extract tenant identifier from JWT token and resolve target database schema name from in-memory cache.',
        invariants: 'Cache hits resolve target schema in sub-15 microseconds without database metadata round-trips.'
      },
      {
        name: 'Schema Context Binding',
        description: 'Execute connection.setSchema(tenantSchema) on acquired JDBC connection prior to delegating to Spring repository.',
        invariants: 'Guarantees all unqualified SQL statements automatically target the dedicated tenant namespace.'
      },
      {
        name: 'Localized DDL Migrations',
        description: 'Flyway and Liquibase schema migrations run tenant-by-tenant with independent rollback safety.',
        invariants: 'A failed migration on Tenant A leaves Tenant B and Tenant C completely unaffected.'
      },
      {
        name: 'Connection Pool Sanitization',
        description: 'Reset connection search_path to public on return to connection pool to prevent leakages.',
        invariants: 'Pool connection sanitizer asserts clean schema state before recycling to next thread.'
      }
    ],
    productionOutcomes: {
      'Catalog Isolation': 'Individual schemas allow granular tenant-level pg_dump and point-in-time restores',
      'Noisy Neighbors': 'Index and table bloat localized to the specific active tenant schema',
      'Custom Migrations': 'Allows enterprise VIP customers to pilot new database schema features early',
      'Throughput SLA': 'Handles 12,000+ RPS across 250 enterprise tenant schemas with sub-4ms P99'
    },
    specCode: `// Spring Boot 3 Multi-Tenant DataSource Connection Router
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    private final TenantContextHolder contextHolder;

    public TenantRoutingDataSource(TenantContextHolder contextHolder) {
        this.contextHolder = contextHolder;
    }

    @Override
    protected Object determineCurrentLookupKey() {
        String tenantId = contextHolder.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            throw new TenantSecurityException("Unauthenticated tenant context rejected");
        }
        return "tenant_" + tenantId.toLowerCase().replaceAll("[^a-z0-9_]", "");
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection conn = super.getConnection();
        String targetSchema = (String) determineCurrentLookupKey();
        conn.setSchema(targetSchema);
        return conn;
    }
}`
  },
  {
    id: 'kms-envelope-encryption',
    name: 'Cryptographic Envelope Encryption per Tenant Key',
    category: 'Data-at-Rest Cryptographic Isolation',
    badge: 'AWS KMS CMK',
    isolationLatency: 'Sub-12ms DEK generation; sub-15 microseconds AES-NI decryption',
    leakPreventionGuarantee: 'Mathematically unbreakable without tenant Customer Managed Key (CMK)',
    algorithmFormula: 'Ciphertext = AES-256-GCM(Plaintext, DEK, IV, AAD=tenant_id); EncryptedDEK = KMS:Encrypt(DEK, CMK_tenant)',
    blastRadiusContainment: 'Cryptographic blast radius limited to single key; instantaneous crypto-shredding via CMK disable',
    architecturalInvariant: 'All sensitive tenant payloads are encrypted using an ephemeral Data Encryption Key (DEK) wrapped by a dedicated AWS KMS Customer Managed Key per tenant.',
    description: 'Provides cryptographic multi-tenancy where data is isolated mathematically rather than merely logically. Each tenant is assigned a unique Customer Managed Key (CMK) in AWS KMS or CloudHSM. When writing data, an ephemeral AES-256 Data Encryption Key (DEK) is generated by KMS, used to encrypt the payload with Authenticated Additional Data (AAD) bound to the tenant ID, and discarded from memory. The encrypted DEK is stored alongside the ciphertext. If a customer exercises GDPR right-to-be-forgotten, revoking their KMS CMK renders their entire data footprint permanently undecryptable (crypto-shredding) in milliseconds.',
    workflowPhases: [
      {
        name: 'KMS GenerateDataKey Call',
        description: 'Request 256-bit ephemeral DEK from AWS KMS using the specific tenant CMK with encryption context.',
        invariants: 'KMS audit trails log every decryption event with IAM principal and tenant context to AWS CloudTrail.'
      },
      {
        name: 'AES-256-GCM Encryption',
        description: 'Encrypt plaintext payload using local CPU AES-NI hardware instructions with unique 96-bit IV and AAD.',
        invariants: 'AAD includes tenantId; tampering with tenantId during decryption causes instantaneous auth tag failure.'
      },
      {
        name: 'Plaintext DEK Memory Purge',
        description: 'Zero out the plaintext DEK byte array in memory immediately following encryption.',
        invariants: 'Plaintext data keys are never persisted to disk, swap space, or application heap dumps.'
      },
      {
        name: 'Crypto-Shredding Capability',
        description: 'Disabling or deleting the tenant CMK in KMS renders all historical backups and snapshots instantly unreadable.',
        invariants: 'Guarantees sub-second compliance with GDPR Article 17 across multi-region backup archives.'
      }
    ],
    productionOutcomes: {
      'Crypto-Shredding': 'Instantaneous GDPR right-to-be-forgotten deletion across cold backups in < 50ms',
      'Key Autonomy': 'Customers can provide Bring-Your-Own-Key (BYOK) via AWS KMS cross-account grants',
      'Audit Trail': '100% of decryption accesses logged to immutable AWS CloudTrail and SIEM',
      'Hardware Speed': 'AES-NI acceleration achieves 2.4 GB/s local encryption throughput'
    },
    specCode: `// AWS KMS Envelope Encryption with AES-256-GCM & Tenant AAD
public class TenantEnvelopeCryptoService {

    private final KmsClient kmsClient;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptedEnvelope encryptPayload(String tenantId, String kmsKeyArn, byte[] plaintext) {
        // Step 1: Request ephemeral Data Encryption Key bound to tenant encryption context
        Map<String, String> context = Map.of("tenant_id", tenantId, "purpose", "data_isolation");
        GenerateDataKeyResponse dekResponse = kmsClient.generateDataKey(b -> b
            .keyId(kmsKeyArn)
            .keySpec(DataKeySpec.AES_256)
            .encryptionContext(context)
        );

        byte[] plaintextDek = dekResponse.plaintext().asByteArray();
        byte[] encryptedDek = dekResponse.ciphertextBlob().asByteArray();
        byte[] iv = new byte[12]; // 96-bit GCM IV
        secureRandom.nextBytes(iv);

        // Step 2: Encrypt payload with AES-256-GCM using tenantId as Additional Authenticated Data
        byte[] ciphertext = executeAesGcm(Cipher.ENCRYPT_MODE, plaintextDek, iv, plaintext, tenantId.getBytes());

        // Step 3: Zero out plaintext DEK in memory
        Arrays.fill(plaintextDek, (byte) 0);

        return new EncryptedEnvelope(encryptedDek, iv, ciphertext, tenantId);
    }
}`
  },
  {
    id: 'cross-tenant-leak-probe',
    name: 'Cross-Tenant Data Leak Intrusion Probe & Sentinel',
    category: 'Runtime Security Interception',
    badge: 'Zero-Trust Probe',
    isolationLatency: 'Sub-0.12ms AST query inspection & policy intercept',
    leakPreventionGuarantee: '100% interception of cross-tenant ID parameter tampering',
    algorithmFormula: 'Assert(TokenContext.tenantId == Request.tenantId == TargetRow.tenantId) else ABORT(403)',
    blastRadiusContainment: 'Immediate execution abortion; offending IP quarantined and SOC2 alert dispatched',
    architecturalInvariant: 'Any request attempting to query or mutate a tenant ID differing from the cryptographically verified JWT context is instantly rejected with HTTP 403 Forbidden.',
    description: 'Active runtime defense layer inspecting all incoming requests, API parameters, SQL ASTs, and GraphQL mutations to detect cross-tenant access attempts. By comparing the cryptographically verified tenant ID embedded in the JWT authentication claims with query parameters, request bodies, and database records, the probe identifies both malicious injection vectors and unintentional authorization logic errors. Offending connections are immediately terminated, and high-priority alerts are dispatched to the security operations center.',
    workflowPhases: [
      {
        name: 'JWT Claim Extraction & Verification',
        description: 'Verify RS256 signature on incoming Bearer token and extract immutable tenant_id claim.',
        invariants: 'Token signatures verified via public keys rotated every 24 hours; tenant_id cannot be forged.'
      },
      {
        name: 'Parameter & Body Consistency Check',
        description: 'Inspect URL path variables, query parameters, and JSON payloads against verified tenant context.',
        invariants: 'Any mismatch (e.g. JWT for Tenant A requesting /api/v1/tenants/B/orders) triggers immediate 403.'
      },
      {
        name: 'SQL AST Inspection',
        description: 'Pre-execution statement parser confirms that tenant_id predicates strictly match session credentials.',
        invariants: 'Catches raw SQL injection attempts attempting to append OR 1=1 or bypass table filters.'
      },
      {
        name: 'Security Incident Triaging',
        description: 'Dispatch high-priority alert to SIEM with client IP, user identity, headers, and offending payload.',
        invariants: 'Automated IP rate-limiting applied to callers generating repetitive cross-tenant 403 violations.'
      }
    ],
    productionOutcomes: {
      'Detection Latency': 'Sub-0.12ms evaluation added to Spring WebFilter and Envoy gateway filter',
      'Tamper Defense': 'Zero false negatives across 1,500+ automated penetration test vectors',
      'SOC2 Readiness': 'Produces immutable audit logs required for SOC2 Trust Services Criteria CC6.1',
      'Threat Containment': 'Instant session termination and automated IP quarantine within 2 seconds'
    },
    specCode: `// Spring Security Filter: Cross-Tenant Parameter Tampering Sentinel
@Component
public class CrossTenantIntrusionSentinelFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        TenantAuthentication auth = (TenantAuthentication) SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String verifiedTenant = auth.getVerifiedTenantId();
            String pathTenant = extractTenantFromUri(request.getRequestURI());

            // Detect ID parameter tampering in URL path
            if (pathTenant != null && !pathTenant.equalsIgnoreCase(verifiedTenant)) {
                logSecurityAlert(request, verifiedTenant, pathTenant);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write('{"error": "CROSS_TENANT_ACCESS_DENIED", "code": 403}');
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}`
  },
  {
    id: 'tenant-noisy-neighbor-qos',
    name: 'Tenant Noisy-Neighbor Throttling with Weighted Token Buckets',
    category: 'Traffic Isolation & Fair Share Scheduling',
    badge: 'QoS Isolation',
    isolationLatency: 'Sub-0.75ms Redis Lua atomic token evaluation',
    leakPreventionGuarantee: '100% capacity containment; rogue tenant spikes cannot degrade co-tenants',
    algorithmFormula: 'Tokens_tenant = min(Capacity, Tokens + RefillRate * dt) - Cost; If Tokens < 0 Then HTTP 429',
    blastRadiusContainment: 'Excess traffic dropped at edge ingress with HTTP 429 Retry-After headers',
    architecturalInvariant: 'No single tenant can consume more than their allocated percentage of shared cluster compute, database connections, or network bandwidth.',
    description: 'Implements multi-tenant fair-share resource allocation using distributed Redis token buckets with tenant-tier weighting. When an enterprise tenant launches a massive batch processing job or experiences an organic traffic surge, the rate limiter dynamically throttles the offending tenant with HTTP 429 Too Many Requests while preserving 100% of baseline throughput and sub-50ms latency for neighboring tenants sharing the same infrastructure.',
    workflowPhases: [
      {
        name: 'Tenant Tier Quota Resolution',
        description: 'Resolve tenant tier rate limit parameters (Starter: 50 RPS, Pro: 250 RPS, Enterprise: 1000 RPS).',
        invariants: 'Tier definitions cached in local Caffeine memory with sub-5 microsecond lookup latency.'
      },
      {
        name: 'Atomic Redis Lua Token Consumption',
        description: 'Execute Redis Lua script to compute elapsed time, add replenished tokens, and deduct request cost.',
        invariants: 'Evaluates in a single Redis round-trip with zero race conditions between concurrent worker pods.'
      },
      {
        name: 'Graceful Degradation & Backpressure',
        description: 'If tenant tokens are exhausted, return HTTP 429 with Retry-After header indicating exact refill time.',
        invariants: 'Throttling occurs at the Envoy API gateway before requests ever touch downstream database pools.'
      },
      {
        name: 'Neighbor Latency Isolation',
        description: 'Cluster metrics confirm neighboring tenants experience 0.00% latency or throughput degradation.',
        invariants: 'Protects critical database connection pools from starvation during peak burst events.'
      }
    ],
    productionOutcomes: {
      'Fairness SLA': 'Neighboring tenant P99 latency remains capped under 42ms during 10x traffic surges',
      'Edge Dropping': 'Sub-1ms HTTP 429 rejection executed at edge Envoy gateway before worker compute',
      'Dynamic Bursting': 'Supports temporary 150% burst allowance for Enterprise tier customers',
      'Resource Efficiency': 'Allows multi-tenant cluster oversubscription while guaranteeing SLA floors'
    },
    specCode: `-- Redis Lua Script: Distributed Multi-Tenant Weighted Token Bucket
local tenantKey = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local state = redis.call('HMGET', tenantKey, 'tokens', 'lastRefill')
local tokens = tonumber(state[1])
local lastRefill = tonumber(state[2])

if not tokens then
    tokens = capacity
    lastRefill = now
else
    local elapsed = math.max(0, (now - lastRefill) / 1000.0)
    tokens = math.min(capacity, tokens + (elapsed * refillRate))
    lastRefill = now
end

if tokens >= cost then
    tokens = tokens - cost
    redis.call('HMSET', tenantKey, 'tokens', tokens, 'lastRefill', lastRefill)
    redis.call('EXPIRE', tenantKey, 3600)
    return {1, tokens} -- Allowed
else
    redis.call('HMSET', tenantKey, 'tokens', tokens, 'lastRefill', lastRefill)
    return {0, tokens} -- Throttled (HTTP 429)
end`
  }
];
