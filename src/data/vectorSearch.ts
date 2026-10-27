export interface VectorSearchModel {
  id: string
  name: string
  paradigm: string
  badge: string
  searchComplexity: string
  memoryProfile: string
  indexingThroughput: string
  recallAccuracy: string
  workflowPhases: Array<{
    name: string
    color: string
    description: string
    invariants: string
  }>
  codeSnippet: {
    language: string
    filename: string
    code: string
  }
  architecturalInvariant: string
  productionOutcomes: Record<string, string>
}

export const VECTOR_SEARCH_MODELS: VectorSearchModel[] = [
  {
    id: 'hnsw-skip-list-graphs',
    name: 'Hierarchical Navigable Small World (HNSW) Graphs',
    paradigm: 'Multi-Layer Proximity Graph with Skip-List Routing',
    badge: 'HNSW Graph',
    searchComplexity: 'O(log N) logarithmic graph traversal',
    memoryProfile: 'High: ~1.4x vector raw size (stores M=16 edges/node)',
    indexingThroughput: 'Moderate (~2,800 vectors/sec per core)',
    recallAccuracy: 'Ultra-High (98.4% Recall@10 with efSearch=64)',
    workflowPhases: [
      {
        name: 'TOP_LAYER_ROUTING',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Query starts at top layer (Layer L_max) with sparse long-range highway edges to find greedy local entry node.',
        invariants: 'Evaluates distance to neighbors; moves to neighbor closer to query until reaching local minimum.'
      },
      {
        name: 'LAYER_DESCENT_ZOOM',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Descent through intermediate layers (Layer 1 down to Layer 0), using entry point from upper layer as seed.',
        invariants: 'Graph density increases exponentially per layer down to Layer 0; narrows search radius progressively.'
      },
      {
        name: 'BEAM_SEARCH_REFINE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Executes priority-queue beam search at Layer 0 maintaining efSearch candidates to harvest top-K nearest neighbors.',
        invariants: 'Exploration terminates when candidate queue contains efSearch nodes all further than worst result in top-K.'
      }
    ],
    codeSnippet: {
      language: 'python',
      filename: 'hnsw_search.py',
      code: `import heapq

def hnsw_search_layer(query, entry_point, ef_search, graph_layer):
    visited = {entry_point}
    candidates = [(distance(query, entry_point), entry_point)]
    results = [(distance(query, entry_point), entry_point)]

    while candidates:
        d_c, c = heapq.heappop(candidates)
        # Prune search if closest candidate is farther than furthest result in top ef
        if d_c > results[-1][0] and len(results) >= ef_search:
            break
        for neighbor in graph_layer[c]:
            if neighbor not in visited:
                visited.add(neighbor)
                d_n = distance(query, neighbor)
                if d_n < results[-1][0] or len(results) < ef_search:
                    heapq.heappush(candidates, (d_n, neighbor))
                    heapq.heappush(results, (d_n, neighbor))
                    if len(results) > ef_search:
                        results = heapq.nsmallest(ef_search, results)
    return results`
    },
    architecturalInvariant: 'Small world property ensures clustering coefficient remains high while average shortest path length scales logarithmically with graph cardinality.',
    productionOutcomes: {
      'Query Latency': '1.8ms P99 across 5M 1536d vectors',
      'Recall Accuracy': '98.4% Recall@10 (efSearch=64)',
      'Memory Overhead': '6.8 GB per 1M OpenAI text-embedding-3',
      'Concurrency Scaling': 'Read lock-free concurrent graph traversals'
    }
  },
  {
    id: 'ivf-pq-quantization',
    name: 'Inverted File with Product Quantization (IVF-PQ)',
    paradigm: 'Centroid Partitioning with Sub-Space Quantization',
    badge: 'IVF-PQ Quantized',
    searchComplexity: 'Sub-linear O(nprobe * (N/K + D))',
    memoryProfile: 'Ultra-Low: 8x to 16x RAM compression via codebooks',
    indexingThroughput: 'High: Fast 2-phase k-means clustering',
    recallAccuracy: 'Configurable (92.1% Recall@10 with nprobe=32)',
    workflowPhases: [
      {
        name: 'VORONOI_COARSE_QUANTIZE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Query vector compared against K coarse centroids (e.g. K=1024 Voronoi cells) to select top nprobe nearest lists.',
        invariants: 'Only vectors located within the selected nprobe Voronoi cells are examined; skips 97% of total database.'
      },
      {
        name: 'RESIDUAL_PRODUCT_QUANTIZE',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Vectors decomposed into M sub-vectors (e.g. M=8); each sub-vector quantized into 1-byte codebook index (256 centroids).',
        invariants: 'Reduces 1536-dimensional Float32 vector (6,144 bytes) to 96 bytes (64x reduction for storage).'
      },
      {
        name: 'ASYMMETRIC_DISTANCE_SCAN',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Asymmetric Distance Computation (ADC): pre-computes lookup table of query distances to codebooks; sums distances via table lookups.',
        invariants: 'Zero floating-point multiplications during search scan; executes entirely via SIMD byte additions.'
      }
    ],
    codeSnippet: {
      language: 'python',
      filename: 'ivf_pq_index.py',
      code: `import faiss

# Build 1536-dimensional IVF-PQ Index for massive-scale retrieval
dim = 1536
n_centroids = 1024  # Number of Voronoi coarse cells
sub_vectors = 64    # Product quantization sub-spaces
bits_per_code = 8   # 1 byte per sub-space codebook

quantizer = faiss.IndexFlatL2(dim)
index = faiss.IndexIVFPQ(quantizer, dim, n_centroids, sub_vectors, bits_per_code)
index.train(training_vectors)  # Trains coarse k-means and PQ codebooks
index.add(corpus_vectors)

# Runtime query tuning: balance latency vs recall
index.nprobe = 32   # Search 32 of 1024 Voronoi lists (3.1% scan)
distances, indices = index.search(query_vectors, k=10)`
    },
    architecturalInvariant: 'Asymmetric Distance Computation (ADC) guarantees that unquantized query vectors evaluate against quantized corpus codes with bounded quantization error variance.',
    productionOutcomes: {
      'Memory Compression': '8.2x RAM reduction vs raw Float32',
      'Scan Speed': 'Sub-0.6ms ADC table lookup per 100K entries',
      'Throughput Profile': '24,000 queries/sec on single server',
      'Recall Tradeoff': '92.1% Recall@10 with nprobe=32'
    }
  },
  {
    id: 'sharded-vector-routing',
    name: 'Distributed Sharded Vector Routing & Heap Merge',
    paradigm: 'Partitioned Vector Fabric with MapReduce Aggregation',
    badge: 'Sharded Top-K Heap',
    searchComplexity: 'O((N / K_shards) * log K_shards)',
    memoryProfile: 'Horizontally distributed across independent worker nodes',
    indexingThroughput: 'Linear horizontal scaling across cluster nodes',
    recallAccuracy: 'Exact top-K equivalent to single-node exhaustive merge',
    workflowPhases: [
      {
        name: 'SCATTER_QUERY_DISPATCH',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Coordinator node receives 1536d query and broadcasts parallel search RPCs to all K vector shards.',
        invariants: 'Each shard executes local HNSW or IVF-PQ index search using identical query vector and candidate budget.'
      },
      {
        name: 'SHARD_LOCAL_EVALUATION',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: 'Each shard computes local top-K candidates independently in parallel within its isolated memory space.',
        invariants: 'Shard returns candidate tuple array: [(doc_id, cosine_distance, metadata)] to coordinator.'
      },
      {
        name: 'COORDINATOR_HEAP_MERGE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Coordinator maintains global bounded min-heap of size K, merging K*S candidate streams in O(K log S) time.',
        invariants: 'Yields mathematically exact global top-K results regardless of how vectors are partitioned across shards.'
      }
    ],
    codeSnippet: {
      language: 'typescript',
      filename: 'distributedVectorRouter.ts',
      code: `export async function distributedVectorSearch(
  queryVector: number[],
  shards: VectorShardClient[],
  topK: number
): Promise<Array<{ id: string; score: number }>> {
  // Scatter: Broadcast query to all shards in parallel
  const shardPromises = shards.map(shard => 
    shard.queryLocalIndex({ vector: queryVector, limit: topK })
  );
  const shardResults = await Promise.all(shardPromises);

  // Gather: Bounded Min-Heap priority merge
  const globalCandidates = shardResults.flat();
  globalCandidates.sort((a, b) => b.score - a.score); // Highest cosine similarity first

  return globalCandidates.slice(0, topK); // Global Top-K guaranteed
}`
    },
    architecturalInvariant: 'Linear scalability invariant: Adding S vector worker shards divides per-node vector cardinality by S, keeping per-shard search latency constant as corpus scales.',
    productionOutcomes: {
      'Cluster Scale': '100M+ vectors across 16 worker shards',
      'P99 Scatter-Gather': '8.4ms end-to-end multi-shard query',
      'Heap Merge Latency': '<0.2ms coordinator min-heap reduction',
      'High Availability': 'Replica failover with zero query drop'
    }
  },
  {
    id: 'hybrid-dense-sparse-rrf',
    name: 'Hybrid Dense-Sparse Retrieval with Reciprocal Rank Fusion',
    paradigm: 'BM25 Keyword Frequency + Dense Embedding Fusion',
    badge: 'Hybrid RRF Fusion',
    searchComplexity: 'Dual pipeline: O(sparse_postings) + O(dense_hnsw)',
    memoryProfile: 'Dual index: inverted keyword index + HNSW vector graph',
    indexingThroughput: 'Parallel dual pipeline ingest',
    recallAccuracy: 'State-of-the-art (catches both semantic & exact keyword hits)',
    workflowPhases: [
      {
        name: 'PARALLEL_DUAL_RETRIEVAL',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Query dispatched concurrently to BM25 inverted index (lexical exact match) and pgvector HNSW (semantic intent).',
        invariants: 'Both engines return ranked candidate lists independently without cross-pipeline blocking.'
      },
      {
        name: 'RECIPROCAL_RANK_SCORING',
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
        description: 'Calculates non-parametric RRF score: RRF(d) = 1/(k + rank_bm25(d)) + 1/(k + rank_dense(d)) with constant k=60.',
        invariants: 'Requires zero cross-domain score normalization; eliminates calibration skew between BM25 scores and cosine distances.'
      },
      {
        name: 'HYBRID_DEDUPLICATION_MERGE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: 'Documents appearing in both lexical and semantic top ranks receive boosted fusion scores and bubble to top.',
        invariants: 'Guarantees that exact SKU or UUID queries never get buried by generic semantic nearest neighbors.'
      }
    ],
    codeSnippet: {
      language: 'typescript',
      filename: 'reciprocalRankFusion.ts',
      code: `export function reciprocalRankFusion(
  denseRanks: string[],  // Array of doc IDs ranked by vector cosine similarity
  sparseRanks: string[], // Array of doc IDs ranked by BM25 frequency
  k = 60                 // Standard RRF smoothing constant
): Array<{ id: string; score: number }> {
  const scores = new Map<string, number>();

  denseRanks.forEach((id, rank) => {
    scores.set(id, (scores.get(id) || 0) + 1 / (k + rank + 1));
  });

  sparseRanks.forEach((id, rank) => {
    scores.set(id, (scores.get(id) || 0) + 1 / (k + rank + 1));
  });

  return Array.from(scores.entries())
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}`
    },
    architecturalInvariant: 'Reciprocal Rank Fusion provides robust outlier resistance, outperforming arbitrary linear weight interpolation (alpha * dense + (1-alpha) * sparse) across heterogeneous document domains.',
    productionOutcomes: {
      'Hybrid MRR@10': '+28.4% Mean Reciprocal Rank vs Dense-only',
      'Exact SKU Match': '100% precision on part numbers & codes',
      'RRF Fusion Time': '<0.3ms in-memory map merge',
      'Domain Adaptability': 'Zero manual score normalization tuning'
    }
  },
  {
    id: 'vector-quantization-profiler',
    name: 'Vector Quantization Memory & Hardware Sizing Profiler',
    paradigm: 'Scalar FP32 vs FP16 vs INT8 Bit-Depth Trade-Offs',
    badge: 'Quantization Sizer',
    searchComplexity: 'SIMD hardware vector dot-product acceleration',
    memoryProfile: 'FP32: 6.14 GB/1M | FP16: 3.07 GB/1M | INT8: 1.54 GB/1M',
    indexingThroughput: 'Fast scalar calibration via min-max affine mapping',
    recallAccuracy: 'INT8 achieves 99.2% relative recall vs FP32 baseline',
    workflowPhases: [
      {
        name: 'RAW_FLOAT32_BASELINE',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        description: 'Standard 32-bit floating point representation (IEEE 754): 4 bytes per dimension = 6,144 bytes per 1536d vector.',
        invariants: 'Maximum mathematical fidelity but requires expensive high-memory cloud hardware instances.'
      },
      {
        name: 'HALF_FLOAT16_TRUNCATE',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        description: '16-bit floating point: 2 bytes per dimension = 3,072 bytes per vector (exact 50% memory savings).',
        invariants: 'Zero perceptible recall degradation; native hardware AVX-512 and ARM NEON FP16 acceleration.'
      },
      {
        name: 'SCALAR_INT8_QUANTIZE',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        description: '8-bit signed integer affine quantization: value_int8 = round((value_fp32 - offset) / scale). 1 byte per dimension.',
        invariants: 'Yields 75% RAM reduction; executes dot products using high-throughput VNNI / DP4A integer instructions.'
      }
    ],
    codeSnippet: {
      language: 'sql',
      filename: 'pgvector_halfvec.sql',
      code: `-- PostgreSQL pgvector Scalar Quantization Optimization
-- Converts 1536d Float32 vector column to Halfvec (FP16) or INT8 Bit vector

-- 1. Create table with half-precision floating point vectors (50% RAM savings)
CREATE TABLE enterprise_knowledge_vectors (
    document_id UUID PRIMARY KEY,
    embedding halfvec(1536) NOT NULL
);

-- 2. Build HNSW index on halfvec column
CREATE INDEX ON enterprise_knowledge_vectors 
USING hnsw (embedding halfvec_cosine_ops)
WITH (m = 16, ef_construction = 128);

-- 3. Query with instant sub-4ms cosine similarity search
SELECT document_id, 1 - (embedding <=> :query_embedding::halfvec) AS cosine_sim
FROM enterprise_knowledge_vectors
ORDER BY embedding <=> :query_embedding::halfvec
LIMIT 10;`
    },
    architecturalInvariant: 'Scalar quantization preserves directionality in high-dimensional hyperspheres due to concentration of measure, ensuring angular distance ranks remain stable.',
    productionOutcomes: {
      'RAM Cost Savings': '-75% AWS Memory Footprint (r6g vs r6i)',
      'Relative Recall': '99.2% of unquantized FP32 accuracy',
      'SIMD Speedup': '3.2x faster dot products via INT8 VNNI',
      'Cluster Density': '4x more vectors stored per server host'
    }
  }
]
