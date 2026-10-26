import { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  Terminal, 
  Wrench, 
  ShieldCheck, 
  Check, 
  Copy, 
  Code2, 
  CheckCircle2, 
  Workflow
} from 'lucide-react'
import ArchNode from './ArchNode'
import type { ArchNodeData } from './ArchNode'
import AnimatedConnection from './AnimatedConnection'
import type { PacketType } from './AnimatedConnection'
import { BoundaryContainer, SvgGlowFilters } from './SvgPrimitives'

export interface AgentStepDef {
  stepNumber: number
  title: string
  shortLabel: string
  activeNodeIds: string[]
  activeConnectionIds: string[]
  packetType: PacketType
  latency: string
  tokensEst: string
  guardrailScore: string
  payloadBadge: string
  detailedExplanation: string
  impactMetric: string
}

export interface AgentNodeExtended extends ArchNodeData {
  agentDirective: string
  communicationContract: string
  implementationCode: string
  codeLanguage: string
  invariants: string[]
}

const AGENT_NODES: AgentNodeExtended[] = [
  {
    id: 'user-ingress',
    label: 'User / Event Trigger',
    sublabel: 'Natural Language & Webhook Ingress',
    role: 'Client & Ingress Layer',
    category: 'client',
    x: 35,
    y: 80,
    width: 190,
    height: 95,
    color: 'cyan',
    iconType: 'client',
    protocol: 'HTTPS / JSON-RPC',
    latencyBadge: '< 45ms',
    techBadge: 'Client API',
    metricValue: 'Streaming Ingress',
    agentDirective: 'Authenticates caller identity, validates tenant JWT token, extracts user prompt intent, and publishes task initialization event to the orchestrator.',
    communicationContract: `{
  "eventId": "evt_9082f1ac",
  "tenantId": "org_enterprise_apac",
  "userId": "usr_lead_architect",
  "goalPrompt": "Analyze transaction logs for fraud patterns, write aggregation script, and commit to repo",
  "maxBudgetTokens": 24000,
  "requiredSlaMs": 4000
}`,
    codeLanguage: 'typescript',
    implementationCode: `// Ingress Gateway & Event Dispatcher
import { z } from 'zod';
import { publishToOrchestrator } from '@/lib/agent-bus';

export const AgentGoalPayloadSchema = z.object({
  tenantId: z.string().startsWith('org_'),
  userId: z.string().startsWith('usr_'),
  goalPrompt: z.string().min(5).max(4000),
  contextTags: z.array(z.string()).default(['production']),
  humanApprovalRequired: z.boolean().default(true)
});

export async function handleAgentIngress(req: Request) {
  const rawBody = await req.json();
  const validated = AgentGoalPayloadSchema.parse(rawBody);

  // Initialize distributed trace and forward to Supervisor Orchestrator
  const traceId = crypto.randomUUID();
  return await publishToOrchestrator({
    traceId,
    timestamp: Date.now(),
    payload: validated
  });
}`,
    invariants: [
      'Strict tenant header verification with zero cross-tenant leakage',
      'Payload schema enforced via Zod before invoking model planner',
      'Idempotency key prevents duplicate execution on network retry'
    ]
  },
  {
    id: 'hitl-gate',
    label: 'Human-in-the-Loop',
    sublabel: 'Policy Gate & Admin Approval',
    role: 'Safety & Governance Checkpoint',
    category: 'gateway',
    x: 35,
    y: 360,
    width: 190,
    height: 95,
    color: 'rose',
    iconType: 'hitl',
    protocol: 'HITL Webhook',
    latencyBadge: 'Async Wait',
    techBadge: 'Approval Gate',
    metricValue: 'Strict Clearance',
    agentDirective: 'Halts autonomous execution when actions involve destructive mutations, high financial thresholds, or production code deployments until signed operator approval is received.',
    communicationContract: `{
  "approvalId": "hitl_77610",
  "actionType": "PROD_DATABASE_MIGRATION",
  "riskScore": 0.88,
  "criticAssessment": "High-risk schema change requiring explicit DBA sign-off",
  "status": "AWAITING_OPERATOR_SIGNATURE"
}`,
    codeLanguage: 'python',
    implementationCode: `# LangGraph Human-in-the-Loop Interrupt Gate
from langgraph.types import interrupt
from typing import Dict, Any

def hitl_governance_node(state: Dict[str, Any]) -> Dict[str, Any]:
    risk_score = state.get("risk_score", 0.0)
    proposed_action = state.get("next_action", {})

    # Critical gate: pause execution and await human confirmation
    if risk_score > 0.70 or proposed_action.get("is_destructive", False):
        user_approval = interrupt({
            "message": "Critical action requires operator authorization",
            "action": proposed_action,
            "risk_score": risk_score,
            "required_role": "ADMIN_OPERATOR"
        })
        
        if not user_approval.get("approved"):
            return {"status": "ABORTED", "reason": "Operator rejected action"}

    return {"status": "APPROVED", "approver": user_approval.get("signed_by")}`,
    invariants: [
      'Deterministic execution interruption via LangGraph interrupt checkpoints',
      'Cryptographically signed audit trail for compliance (SOC-2 Type II)',
      '15-minute expiration timeout with automated fallback rollback'
    ]
  },
  {
    id: 'orchestrator',
    label: 'Supervisor Orchestrator',
    sublabel: 'DAG Planner & Reasoning Engine',
    role: 'Central Agent Coordinator',
    category: 'orchestrator',
    x: 275,
    y: 75,
    width: 230,
    height: 110,
    color: 'purple',
    iconType: 'brain',
    protocol: 'Claude 3.7 / GPT-4o',
    latencyBadge: '~420ms',
    techBadge: 'Supervisor Agent',
    metricValue: 'Central Brain',
    agentDirective: 'Deconstructs compound user goals into a Directed Acyclic Graph (DAG) of discrete tasks. Dynamically assigns subtasks to specialized workers and monitors execution health.',
    communicationContract: `{
  "planId": "dag_8841a",
  "nodes": [
    { "id": "task_1", "worker": "worker-rag", "goal": "Fetch error logs & API docs" },
    { "id": "task_2", "worker": "worker-code", "goal": "Generate aggregation script", "dependsOn": ["task_1"] },
    { "id": "task_3", "worker": "worker-tools", "goal": "Execute sandbox dry-run", "dependsOn": ["task_2"] }
  ],
  "routingPolicy": "PARALLEL_FAN_OUT_WITH_BARRIER_SYNC"
}`,
    codeLanguage: 'python',
    implementationCode: `# Supervisor Orchestrator Node (LangGraph Multi-Agent)
from typing import Literal, TypedDict, List
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic

class AgentState(TypedDict):
    goal: str
    plan: List[dict]
    worker_results: dict
    iteration: int
    reflection_score: float

model = ChatAnthropic(model="claude-3-7-sonnet-20250219", temperature=0.1)

def supervisor_planner(state: AgentState) -> dict:
    prompt = f"""You are the Supervisor Orchestrator. 
Break down the goal into a strict DAG plan:
Goal: {state['goal']}
Current Iteration: {state['iteration']}"""
    
    response = model.with_structured_output(DAGPlan).invoke(prompt)
    return {"plan": response.subtasks, "iteration": state["iteration"] + 1}

def route_workers(state: AgentState) -> List[str]:
    # Dynamic fan-out: dispatch unblocked tasks concurrently
    ready_tasks = [t for t in state["plan"] if t["status"] == "READY"]
    return [task["worker_name"] for task in ready_tasks]`,
    invariants: [
      'Bounded iteration recursion: Hard max limit of 5 loops prevents infinite cycling',
      'Dynamic acyclic dependency validation prevents deadlock in task scheduling',
      'Zero hallucinations: Subtasks are strictly grounded in user prompt scope'
    ]
  },
  {
    id: 'shared-state',
    label: 'Shared State & Scratchpad',
    sublabel: 'LangGraph StateGraph / Ephemeral Memory',
    role: 'Execution State & Blackboard',
    category: 'memory',
    x: 275,
    y: 260,
    width: 230,
    height: 105,
    color: 'purple',
    iconType: 'state',
    protocol: 'Redis JSON / In-Memory',
    latencyBadge: '< 2ms',
    techBadge: 'Blackboard State',
    metricValue: 'Atomic Reducers',
    agentDirective: 'Maintains canonical state of the multi-agent session: scratchpad thoughts, intermediate artifacts, tool payloads, and task completion flags with atomic CAS updates.',
    communicationContract: `{
  "sessionId": "sess_9931b2",
  "activePlanStep": 3,
  "blackboard": {
    "ragChunks": 14,
    "codeArtifactHash": "sha256:d89ef2",
    "sandboxExitCode": 0
  },
  "tokenConsumption": { "prompt": 1420, "completion": 380 }
}`,
    codeLanguage: 'python',
    implementationCode: `# LangGraph State Reducer with Atomic Append
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
import operator

def merge_artifacts(current: dict, update: dict) -> dict:
    """Atomic merge reducer for concurrent worker output patches"""
    merged = current.copy()
    for key, val in update.items():
        if isinstance(val, list):
            merged[key] = merged.get(key, []) + val
        else:
            merged[key] = val
    return merged

class MultiAgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    artifacts: Annotated[dict, merge_artifacts]
    active_worker: str
    is_completed: bool`,
    invariants: [
      'CRDT-inspired state reducer ensures conflict-free parallel worker merges',
      'Snapshot checkpoints persisted to Redis with 24-hour TTL for replayability',
      'Sub-2ms state read/write latency under high concurrent worker access'
    ]
  },
  {
    id: 'worker-code',
    label: 'Code Execution Worker',
    sublabel: 'AST Generation & Sandboxed Tests',
    role: 'Specialized Worker: Code Synthesis',
    category: 'worker',
    x: 555,
    y: 65,
    width: 265,
    height: 90,
    color: 'emerald',
    iconType: 'terminal',
    protocol: 'Docker / Pyodide',
    latencyBadge: '~850ms',
    techBadge: 'Python & TS Sandbox',
    metricValue: 'Unit Tests OK',
    agentDirective: 'Synthesizes deterministic Python/TypeScript solutions, executes them inside isolated zero-network sandboxes, and verifies test suites prior to artifact emission.',
    communicationContract: `{
  "taskId": "task_2",
  "action": "SYNTHESIZE_SCRIPT",
  "language": "python",
  "testCoverageTarget": "100%",
  "executionSandbox": "gVisor-isolated-container"
}`,
    codeLanguage: 'python',
    implementationCode: `# Sandboxed Code Synthesis & Automated Verification Worker
import ast
import subprocess
from typing import Dict, Any

class CodeWorker:
    def __init__(self, sandbox_runtime: str = "pyodide"):
        self.sandbox = sandbox_runtime

    def execute_task(self, subtask: Dict[str, Any]) -> Dict[str, Any]:
        source_code = self.generate_solution(subtask["spec"])
        
        # 1. AST Static Security Linting
        tree = ast.parse(source_code)
        self.assert_no_malicious_calls(tree)
        
        # 2. Run in isolated sandbox with timeout
        test_result = self.run_in_sandbox(source_code, timeout_seconds=5)
        
        return {
            "code": source_code,
            "exit_code": test_result.returncode,
            "tests_passed": test_result.all_passed,
            "stdout": test_result.output
        }`,
    invariants: [
      'AST static analysis prohibits OS filesystem mutations and unauthorized socket creation',
      'Execution enforced inside gVisor/Docker container with 5-second hard kill timeout',
      'Code emitted only when all generated pytest assertions pass successfully'
    ]
  },
  {
    id: 'worker-rag',
    label: 'Research & RAG Worker',
    sublabel: 'Semantic Search & Documentation',
    role: 'Specialized Worker: Context Retrieval',
    category: 'worker',
    x: 555,
    y: 175,
    width: 265,
    height: 90,
    color: 'cyan',
    iconType: 'search',
    protocol: 'BM25 + Dense RAG',
    latencyBadge: '~320ms',
    techBadge: 'Hybrid Retrieval',
    metricValue: 'Top-k Recall 98%',
    agentDirective: 'Retrieves relevant documentation, historical architecture blueprints, and API contracts via hybrid sparse-dense vector search with reciprocal rank fusion (RRF).',
    communicationContract: `{
  "query": "PostgreSQL Row Level Security tenant isolation pattern",
  "embeddingModel": "text-embedding-3-large",
  "similarityMetric": "cosine",
  "topK": 5,
  "reciprocalRankFusion": true
}`,
    codeLanguage: 'python',
    implementationCode: `# Hybrid Semantic RAG Worker with RRF Fusion
from langchain_community.vectorstores import PGVector
from langchain_openai import OpenAIEmbeddings

class ResearchWorker:
    def __init__(self, connection_string: str):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
        self.vector_store = PGVector(
            connection_string=connection_string,
            embedding_function=self.embeddings,
            collection_name="enterprise_knowledge"
        )

    def retrieve_context(self, query: str, top_k: int = 5) -> dict:
        # Hybrid retrieval combining semantic embeddings and full-text BM25
        dense_docs = self.vector_store.similarity_search_with_relevance_scores(query, k=top_k)
        
        return {
            "citations": [d[0].metadata["source"] for d in dense_docs],
            "context_chunks": [d[0].page_content for d in dense_docs],
            "confidence_score": max([d[1] for d in dense_docs]) if dense_docs else 0.0
        }`,
    invariants: [
      'Strict relevance filtering: Chunks with cosine similarity < 0.78 are pruned',
      'All synthesized assertions require linked metadata citations to prevent hallucination',
      'Sub-350ms hybrid vector query SLA over 500,000 document embeddings'
    ]
  },
  {
    id: 'worker-tools',
    label: 'Tool Execution Worker',
    sublabel: 'REST, DB & MCP Connector Engine',
    role: 'Specialized Worker: External Actions',
    category: 'worker',
    x: 555,
    y: 285,
    width: 265,
    height: 90,
    color: 'amber',
    iconType: 'tools',
    protocol: 'JSON-RPC MCP 2.0',
    latencyBadge: '~180ms',
    techBadge: 'Model Context Protocol',
    metricValue: 'Zero-Trust Token',
    agentDirective: 'Executes parameterized tool calls (GitHub API, Kafka publish, PostgreSQL queries) via Model Context Protocol (MCP) clients with JSON schema validation.',
    communicationContract: `{
  "protocol": "mcp/2024-11-05",
  "method": "tools/call",
  "params": {
    "name": "query_system_telemetry",
    "arguments": { "metric": "p99_latency", "window": "15m" }
  }
}`,
    codeLanguage: 'typescript',
    implementationCode: `// Model Context Protocol (MCP) Client Execution Worker
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class ToolExecutionWorker {
  private client: Client;

  async executeMcpTool(toolName: string, args: Record<string, unknown>) {
    // 1. Validate tool input against JSON Schema contract
    const toolSpec = await this.client.getTool({ name: toolName });
    if (!this.validateSchema(toolSpec.inputSchema, args)) {
      throw new Error(\`Schema validation failed for tool \${toolName}\`);
    }

    // 2. Dispatch invocation over secure MCP stdio transport
    const result = await this.client.callTool({
      name: toolName,
      arguments: args
    });

    return {
      status: 'SUCCESS',
      tool: toolName,
      payload: result.content
    };
  }
}`,
    invariants: [
      'Model Context Protocol 2024-11-05 standard compliance across all tools',
      'JSON Schema validation enforced on inputs before dispatch to prevent injection',
      'Rate limiting and exponential backoff retry on downstream external APIs'
    ]
  },
  {
    id: 'worker-critic',
    label: 'Critic & Reflection Worker',
    sublabel: 'Hallucination Gate & LLM-as-Judge',
    role: 'Verification & Quality Guardrail',
    category: 'worker',
    x: 555,
    y: 395,
    width: 265,
    height: 90,
    color: 'purple',
    iconType: 'critic',
    protocol: 'Pydantic Guard',
    latencyBadge: '~260ms',
    techBadge: 'Self-Correction Loop',
    metricValue: 'Pass Rate 99.4%',
    agentDirective: 'Evaluates consolidated worker artifacts against safety guardrails, schema conformance, and semantic accuracy. Triggers replanning if quality score is below 95%.',
    communicationContract: `{
  "evaluationId": "crit_4410",
  "hallucinationRisk": 0.012,
  "codeCorrectness": 1.0,
  "safetyGuardrailPass": true,
  "finalScore": 0.994,
  "verdict": "APPROVED_FOR_RELEASE"
}`,
    codeLanguage: 'python',
    implementationCode: `# Critic & Self-Correction Reflection Node
from pydantic import BaseModel, Field
from langchain_anthropic import ChatAnthropic

class QualityAssessment(BaseModel):
    factual_accuracy: float = Field(ge=0.0, le=1.0)
    instruction_compliance: float = Field(ge=0.0, le=1.0)
    security_clearance: bool
    replan_required: bool
    critique_notes: str

critic_llm = ChatAnthropic(model="claude-3-7-sonnet-20250219", temperature=0.0)

def critic_reflection_node(state: dict) -> dict:
    prompt = f"""Evaluate the consolidated solution against original goal:
Goal: {state['goal']}
Proposed Output: {state['artifacts']}
Rate factual grounding and code safety."""

    assessment = critic_llm.with_structured_output(QualityAssessment).invoke(prompt)
    
    # Conditional loopback: If rejected, feed critique back to Orchestrator
    return {
        "reflection_score": assessment.factual_accuracy,
        "is_approved": assessment.factual_accuracy >= 0.95 and assessment.security_clearance,
        "critique": assessment.critique_notes,
        "replan_needed": assessment.replan_required
    }`,
    invariants: [
      'Binary security gate: Any flagged vulnerability triggers immediate execution halt',
      'Replanning loop limited to maximum 2 corrective passes to guarantee termination',
      'Dual verification: Structural Pydantic validation + Semantic LLM critique'
    ]
  },
  {
    id: 'vectordb',
    label: 'Vector DB & Episodic Memory',
    sublabel: 'pgvector / Pinecone Knowledge Store',
    role: 'Long-Term Memory & Embeddings',
    category: 'database',
    x: 870,
    y: 75,
    width: 270,
    height: 100,
    color: 'cyan',
    iconType: 'database',
    protocol: 'HNSW Cosine / 1536d',
    latencyBadge: 'P99 < 8ms',
    techBadge: 'pgvector Store',
    metricValue: 'Persistent Recall',
    agentDirective: 'Stores historical task resolutions, corporate architecture standards, and chunked documentation with 1536-dimensional OpenAI embeddings for semantic retrieval.',
    communicationContract: `{
  "indexType": "HNSW (m=16, ef_construction=64)",
  "distanceFunction": "cosine",
  "vectorDimensions": 1536,
  "indexedRecords": 450000,
  "cacheHitRatio": "94.2%"
}`,
    codeLanguage: 'python',
    implementationCode: `-- PostgreSQL pgvector Table Schema with HNSW Index
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS agent_semantic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    document_chunk TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast Approximate Nearest Neighbor (ANN) HNSW Index
CREATE INDEX ON agent_semantic_memory 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);`,
    invariants: [
      'Tenant isolation enforced via PostgreSQL Row-Level Security (RLS)',
      'Sub-8ms P99 similarity search under concurrent worker loads',
      'Automated vacuuming and re-indexing maintain HNSW graph health'
    ]
  },
  {
    id: 'mcp-registry',
    label: 'MCP Tool Hub',
    sublabel: 'Model Context Protocol Connectors',
    role: 'Enterprise Tool Infrastructure',
    category: 'compute',
    x: 870,
    y: 220,
    width: 270,
    height: 100,
    color: 'amber',
    iconType: 'tools',
    protocol: 'MCP Standard 2025',
    latencyBadge: 'Local / Stdio',
    techBadge: '50+ Connectors',
    metricValue: 'Zero-Trust Hub',
    agentDirective: 'Exposes certified enterprise tools (GitHub, PostgreSQL, Slack, Kafka, Jira) through sandboxed Model Context Protocol servers with capability negotiation.',
    communicationContract: `{
  "serverCapabilities": {
    "tools": { "listChanged": true },
    "resources": { "subscribe": true },
    "prompts": { "listChanged": false }
  },
  "registeredTools": ["github_pr_create", "sql_query_readonly", "kafka_produce", "slack_notify"]
}`,
    codeLanguage: 'typescript',
    implementationCode: `// FastMCP Production Enterprise Server
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

const server = new FastMCP({
  name: 'enterprise-infra-tools',
  version: '2.0.0'
});

// Register Sandboxed Read-Only SQL Tool
server.addTool({
  name: 'execute_readonly_sql',
  description: 'Executes verified SELECT query against read-replica',
  parameters: z.object({
    query: z.string().refine(q => q.trim().toUpperCase().startsWith('SELECT'), {
      message: 'Only SELECT queries permitted'
    }),
    limit: z.number().max(100).default(20)
  }),
  execute: async ({ query, limit }, context) => {
    return await executeOnReadReplica(query, limit);
  }
});

server.start({ transportType: 'stdio' });`,
    invariants: [
      'Read-replica enforcement prevents accidental write/drop mutations from agent tools',
      'Protocol-level capability negotiation isolates agent permissions per session',
      'Audit log tracks every input parameter and response payload'
    ]
  },
  {
    id: 'telemetry',
    label: 'Audit & LangSmith Tracing',
    sublabel: 'Trajectory Logs & Cost Ledger',
    role: 'Observability & Cost Controls',
    category: 'event',
    x: 870,
    y: 365,
    width: 270,
    height: 100,
    color: 'emerald',
    iconType: 'cpu',
    protocol: 'OpenTelemetry / OTLP',
    latencyBadge: 'Streaming',
    techBadge: 'LangSmith + OTel',
    metricValue: '100% Audited',
    agentDirective: 'Records complete agent reasoning trajectories, tool call payloads, model token consumption, and financial costs to LangSmith and OpenTelemetry collectors.',
    communicationContract: `{
  "traceId": "tr_6819ba02",
  "totalLatencyMs": 1180,
  "tokenUsage": { "inputTokens": 2140, "outputTokens": 460 },
  "estimatedCostUsd": 0.0124,
  "spans": 8,
  "status": "STATUS_OK"
}`,
    codeLanguage: 'python',
    implementationCode: `# OpenTelemetry & LangSmith Distributed Tracing Hooks
from langsmith import traceable
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "enterprise-agentic-orchestrator"

@traceable(name="orchestrator_execution_pipeline")
def execute_agent_workflow(goal: str, tenant_id: str):
    # Every node execution, token spend, and latency milestone is
    # automatically streamed to LangSmith with zero code overhead.
    pipeline = build_langgraph_workflow()
    return pipeline.invoke({"goal": goal, "tenant_id": tenant_id})`,
    invariants: [
      'Immutable append-only trace ledger for SOC-2 Type II auditability',
      'Real-time token cost ceiling trips circuit breaker if budget exceeded',
      'Zero PII logging: Sensitive user data masked before telemetry export'
    ]
  }
]

const AGENT_STEPS: AgentStepDef[] = [
  {
    stepNumber: 1,
    title: '1. Goal Ingestion & Intent Analysis',
    shortLabel: '1. Ingestion',
    activeNodeIds: ['user-ingress', 'orchestrator', 'shared-state'],
    activeConnectionIds: ['conn-user-orch', 'conn-orch-scratchpad'],
    packetType: 'cyan',
    latency: '~45ms',
    tokensEst: '120 tokens',
    guardrailScore: '99.8%',
    payloadBadge: 'User Goal & Intent Vector',
    detailedExplanation: 'User triggers task via API or web client. Ingress validates JWT tenant claims, establishes session context, and delivers normalized goal payload to the Supervisor Orchestrator.',
    impactMetric: 'Intent Classification: 99.8%'
  },
  {
    stepNumber: 2,
    title: '2. Dynamic DAG Planning & State Graph',
    shortLabel: '2. DAG Planning',
    activeNodeIds: ['orchestrator', 'shared-state'],
    activeConnectionIds: ['conn-orch-scratchpad'],
    packetType: 'purple',
    latency: '~420ms',
    tokensEst: '680 tokens',
    guardrailScore: '100%',
    payloadBadge: 'Subtask DAG Execution Graph',
    detailedExplanation: 'Supervisor Agent reasons over objective scope, breaks down compound goal into a Directed Acyclic Graph (DAG) with dependency barriers, and initializes Shared State scratchpad.',
    impactMetric: '4 Bounded Subtasks Generated'
  },
  {
    stepNumber: 3,
    title: '3. Parallel Worker Fan-Out & Task Delegation',
    shortLabel: '3. Worker Fan-Out',
    activeNodeIds: ['orchestrator', 'worker-code', 'worker-rag', 'worker-tools'],
    activeConnectionIds: ['conn-orch-code', 'conn-orch-rag', 'conn-orch-tools'],
    packetType: 'amber',
    latency: '~12ms',
    tokensEst: '340 tokens',
    guardrailScore: '100%',
    payloadBadge: 'Specialized Subtask Payloads',
    detailedExplanation: 'Supervisor fans out discrete subtasks concurrently to specialized workers (Code Gen, Semantic RAG, Tool Execution), avoiding monolithic context pollution.',
    impactMetric: '3x Concurrent Worker Fan-out'
  },
  {
    stepNumber: 4,
    title: '4. Knowledge Retrieval & MCP Tool Invocation',
    shortLabel: '4. MCP & Memory RAG',
    activeNodeIds: ['worker-rag', 'worker-tools', 'vectordb', 'mcp-registry'],
    activeConnectionIds: ['conn-rag-vectordb', 'conn-tools-mcp'],
    packetType: 'emerald',
    latency: '~320ms',
    tokensEst: '820 tokens',
    guardrailScore: '99.2%',
    payloadBadge: '1536d Embeddings & JSON-RPC Calls',
    detailedExplanation: 'Research Worker retrieves top-k semantic citations from Vector DB (pgvector); Tool Worker calls external infrastructure tools through Model Context Protocol (MCP) clients.',
    impactMetric: 'Zero-Trust Schema Enforced'
  },
  {
    stepNumber: 5,
    title: '5. Worker Output Aggregation & Synthesis',
    shortLabel: '5. State Synthesis',
    activeNodeIds: ['worker-code', 'worker-rag', 'worker-tools', 'shared-state', 'orchestrator'],
    activeConnectionIds: ['conn-code-orch', 'conn-rag-orch', 'conn-tools-orch', 'conn-orch-scratchpad'],
    packetType: 'cyan',
    latency: '~150ms',
    tokensEst: '540 tokens',
    guardrailScore: '99.5%',
    payloadBadge: 'Intermediate Artifacts Stream',
    detailedExplanation: 'Workers stream executed outputs, code diffs, and API results into the Shared State scratchpad. The Supervisor compiles intermediate artifacts into an integrated draft solution.',
    impactMetric: '100% Subtask Convergence'
  },
  {
    stepNumber: 6,
    title: '6. Critic Reflection, Quality Guardrails & HITL',
    shortLabel: '6. Reflection & HITL',
    activeNodeIds: ['worker-critic', 'orchestrator', 'hitl-gate', 'telemetry'],
    activeConnectionIds: ['conn-workers-critic', 'conn-critic-orch', 'conn-critic-hitl', 'conn-critic-telemetry'],
    packetType: 'purple',
    latency: '~260ms',
    tokensEst: '410 tokens',
    guardrailScore: '99.4%',
    payloadBadge: 'Pydantic Evaluation & Audit Log',
    detailedExplanation: 'Critic Worker audits output for hallucination and security. If flaws exist, it feeds back for replanning; if high-risk mutations occur, it triggers Human-in-the-Loop approval before final release.',
    impactMetric: 'Self-Correction & Safety Pass: 99.4%'
  }
]

const CONNECTIONS = [
  // 1. User Ingress -> Orchestrator
  {
    id: 'conn-user-orch',
    pathD: 'M 225 128 L 275 128',
    packetType: 'cyan' as PacketType,
    activeInSteps: [1],
    label: 'Goal Ingress',
    calloutPos: { x: 250, y: 120 }
  },
  // 2. Orchestrator <-> Shared State
  {
    id: 'conn-orch-scratchpad',
    pathD: 'M 390 185 L 390 260',
    packetType: 'purple' as PacketType,
    activeInSteps: [1, 2, 5],
    label: 'State Sync',
    calloutPos: { x: 420, y: 222 }
  },
  // 3. Orchestrator -> Code Worker
  {
    id: 'conn-orch-code',
    pathD: 'M 505 110 L 555 110',
    packetType: 'amber' as PacketType,
    activeInSteps: [3],
    label: 'Subtask: Code',
    calloutPos: { x: 530, y: 100 }
  },
  // 4. Orchestrator -> RAG Worker
  {
    id: 'conn-orch-rag',
    pathD: 'M 505 130 C 530 130, 530 220, 555 220',
    packetType: 'amber' as PacketType,
    activeInSteps: [3],
    label: 'Subtask: RAG',
    calloutPos: { x: 530, y: 175 }
  },
  // 5. Orchestrator -> Tool Worker
  {
    id: 'conn-orch-tools',
    pathD: 'M 505 150 C 535 150, 525 330, 555 330',
    packetType: 'amber' as PacketType,
    activeInSteps: [3],
    label: 'Subtask: Tools',
    calloutPos: { x: 530, y: 240 }
  },
  // 6. RAG Worker <-> Vector DB
  {
    id: 'conn-rag-vectordb',
    pathD: 'M 820 220 C 845 220, 845 125, 870 125',
    packetType: 'emerald' as PacketType,
    activeInSteps: [4],
    label: 'Cosine RAG',
    calloutPos: { x: 845, y: 170 }
  },
  // 7. Tool Worker <-> MCP Registry
  {
    id: 'conn-tools-mcp',
    pathD: 'M 820 330 C 845 330, 845 270, 870 270',
    packetType: 'amber' as PacketType,
    activeInSteps: [4],
    label: 'MCP Tool Call',
    calloutPos: { x: 845, y: 300 }
  },
  // 8. Stream Results back: Code -> Orchestrator
  {
    id: 'conn-code-orch',
    pathD: 'M 555 120 L 505 120',
    packetType: 'cyan' as PacketType,
    activeInSteps: [5],
    label: 'AST Result',
    calloutPos: { x: 530, y: 112 }
  },
  // 9. Stream Results back: RAG -> Orchestrator
  {
    id: 'conn-rag-orch',
    pathD: 'M 555 210 C 530 210, 530 140, 505 140',
    packetType: 'cyan' as PacketType,
    activeInSteps: [5],
    label: 'Citations',
    calloutPos: { x: 530, y: 165 }
  },
  // 10. Stream Results back: Tools -> Orchestrator
  {
    id: 'conn-tools-orch',
    pathD: 'M 555 320 C 530 320, 530 160, 505 160',
    packetType: 'cyan' as PacketType,
    activeInSteps: [5],
    label: 'Tool Outputs',
    calloutPos: { x: 530, y: 250 }
  },
  // 11. Workers -> Critic Worker
  {
    id: 'conn-workers-critic',
    pathD: 'M 687 375 L 687 395',
    packetType: 'purple' as PacketType,
    activeInSteps: [6],
    label: 'Audit Gate',
    calloutPos: { x: 720, y: 385 }
  },
  // 12. Critic Replanning Loop -> Orchestrator
  {
    id: 'conn-critic-orch',
    pathD: 'M 555 440 C 370 440, 250 290, 275 150',
    packetType: 'purple' as PacketType,
    activeInSteps: [6],
    label: 'Replanning Loop (if score < 95%)',
    calloutPos: { x: 420, y: 448 }
  },
  // 13. Critic -> HITL Gate Checkpoint
  {
    id: 'conn-critic-hitl',
    pathD: 'M 555 425 C 380 425, 320 407, 225 407',
    packetType: 'purple' as PacketType,
    activeInSteps: [6],
    label: 'Critical Action HITL Gate',
    calloutPos: { x: 380, y: 415 }
  },
  // 14. Critic / Telemetry Log
  {
    id: 'conn-critic-telemetry',
    pathD: 'M 820 440 C 845 440, 845 415, 870 415',
    packetType: 'emerald' as PacketType,
    activeInSteps: [6],
    label: 'Trace Stream',
    calloutPos: { x: 845, y: 428 }
  }
]

export default function AgenticWorkflowDiagram() {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('orchestrator')
  const [activeCodeTab, setActiveCodeTab] = useState<'code' | 'directive' | 'contract'>('code')
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const currentStep = AGENT_STEPS[currentStepIdx]
  const selectedNode = AGENT_NODES.find(n => n.id === selectedNodeId) || AGENT_NODES[2]

  // Auto-play timer for step sequence
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentStepIdx(prev => (prev + 1) % AGENT_STEPS.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [isPlaying])

  const handleCopyCode = () => {
    if (!selectedNode) return
    navigator.clipboard.writeText(selectedNode.implementationCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="w-full rounded-2xl bg-[#060b14] border border-slate-800 shadow-2xl p-4 sm:p-6 md:p-8">
      {/* 1. Header: Enterprise Multi-Agent Category */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-bold">AGENTIC AI ARCHITECTURE BLUEPRINT</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Anthropic / LangGraph Multi-Agent Standard</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white">
            Hierarchical Orchestrator-Worker Agent System
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Execution Paradigm: <strong className="text-emerald-400">SUPERVISOR & WORKERS ➜</strong>
          </span>
        </div>
      </div>

      {/* 2. Interactive Step Playback & Telemetry Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-[#090f1e] border border-slate-800/80 mb-6">
        {/* Playback Controls & Step Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPlaying(prev => !prev)}
            aria-label={isPlaying ? 'Pause Workflow Animation' : 'Play Workflow Animation'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 transition-all text-xs font-mono font-bold cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false)
              setCurrentStepIdx(0)
            }}
            aria-label="Reset Workflow Sequence"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Selector Chips */}
          <div className="flex flex-wrap items-center gap-1">
            {AGENT_STEPS.map((step, idx) => (
              <button
                key={step.stepNumber}
                onClick={() => {
                  setIsPlaying(false)
                  setCurrentStepIdx(idx)
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  currentStepIdx === idx
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50 font-bold shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {step.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Live Step Telemetry Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-400">
            Latency: <strong className="text-white">{currentStep.latency}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-amber-400">
            Tokens: <strong className="text-white">{currentStep.tokensEst}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-emerald-400">
            Guard: <strong className="text-white">{currentStep.guardrailScore}</strong>
          </span>
        </div>
      </div>

      {/* 3. ByteByteGo Architectural Canvas (SVG) */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070c17] mb-6">
        {/* Step Context Banner over Diagram */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0a1122] border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">{currentStep.title}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 hidden sm:inline">{currentStep.detailedExplanation}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/80 text-purple-300 text-[10px] shrink-0 font-semibold">
            {currentStep.impactMetric}
          </span>
        </div>

        {/* Diagram SVG */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 1180 560"
            className="w-full min-w-[920px] select-none h-auto"
            style={{ maxHeight: '560px' }}
          >
            {/* Background Grid & Reusable Glow Filters */}
            <SvgGlowFilters />
            <rect width="100%" height="100%" fill="url(#arch-grid-pattern)" />

            {/* Subsystem Boundary Zones (ByteByteGo Standard) */}
            {/* Zone 1: Ingress & HITL Gate */}
            <BoundaryContainer
              id="subsystem-ingress"
              x={20}
              y={35}
              width={220}
              height={490}
              label="INGRESS & HITL GATE"
              sublabel="Client & Safety"
              accentColor="#38bdf8"
            />

            {/* Zone 2: Orchestration & Reasoning Core */}
            <BoundaryContainer
              id="subsystem-orchestration"
              x={260}
              y={35}
              width={260}
              height={490}
              label="ORCHESTRATOR & REASONING CORE"
              sublabel="Supervisor Brain"
              accentColor="#a855f7"
            />

            {/* Zone 3: Specialized Worker Pool */}
            <BoundaryContainer
              id="subsystem-workers"
              x={540}
              y={35}
              width={295}
              height={490}
              label="SPECIALIZED WORKER POOL"
              sublabel="Autonomous Executors"
              accentColor="#10b981"
            />

            {/* Zone 4: Knowledge & Tool Ecosystem */}
            <BoundaryContainer
              id="subsystem-tools"
              x={855}
              y={35}
              width={300}
              height={490}
              label="KNOWLEDGE & TOOL INFRASTRUCTURE"
              sublabel="MCP & Vector Memory"
              accentColor="#f59e0b"
            />

            {/* Animated Flow Connections */}
            {CONNECTIONS.map(conn => {
              const isActive = conn.activeInSteps.includes(currentStep.stepNumber)
              return (
                <AnimatedConnection
                  key={conn.id}
                  id={conn.id}
                  pathD={conn.pathD}
                  packetType={conn.packetType}
                  isActive={isActive}
                  isDimmed={false}
                  label={conn.label}
                  calloutPos={conn.calloutPos}
                  duration={1.8}
                />
              )
            })}

            {/* Architectural Nodes */}
            {AGENT_NODES.map(node => {
              const isActive = currentStep.activeNodeIds.includes(node.id)
              const isSelected = selectedNodeId === node.id
              return (
                <ArchNode
                  key={node.id}
                  node={node}
                  isActive={isActive || isSelected}
                  isDimmed={!isActive && !isSelected}
                  isChaosAffected={false}
                  onClick={() => setSelectedNodeId(node.id)}
                />
              )
            })}

            {/* ByteByteGo Sequence Step Number Badges in Circular Markers */}
            {/* ① User Ingress Step */}
            <g transform="translate(248, 128)" className="pointer-events-none">
              <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">1</text>
            </g>

            {/* ② DAG Planning Step */}
            <g transform="translate(390, 215)" className="pointer-events-none">
              <circle cx="0" cy="0" r="10" fill="#9333ea" stroke="#f3e8ff" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2</text>
            </g>

            {/* ③ Worker Fan-Out Step */}
            <g transform="translate(530, 110)" className="pointer-events-none">
              <circle cx="0" cy="0" r="10" fill="#d97706" stroke="#fef3c7" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3</text>
            </g>

            {/* ④ Tool & RAG Execution Step */}
            <g transform="translate(845, 195)" className="pointer-events-none">
              <circle cx="0" cy="0" r="10" fill="#059669" stroke="#d1fae5" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">4</text>
            </g>

            {/* ⑤ State Synthesis Step */}
            <g transform="translate(530, 312)" className="pointer-events-none">
              <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">5</text>
            </g>

            {/* ⑥ Critic Reflection Loop Step */}
            <g transform="translate(420, 440)" className="pointer-events-none">
              <circle cx="0" cy="0" r="10" fill="#7c3aed" stroke="#f3e8ff" strokeWidth="1.5" />
              <text x="0" y="3.5" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">6</text>
            </g>
          </svg>
        </div>

        {/* Node Quick-Inspect Click Strip */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-2 bg-[#090f1d] border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 mr-1">Inspect Node:</span>
          {AGENT_NODES.map(node => (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                selectedNodeId === node.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Active Node Deep Dive & Production Code Demonstration */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Component Inspection & Invariants */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Node Inspection
              </span>
              <span className="text-xs font-mono text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-300 font-semibold">{selectedNode.role}</span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold font-editorial text-white mb-1">
              {selectedNode.label}
            </h4>

            <p className="text-slate-300 text-xs leading-relaxed font-sans mb-3">
              {selectedNode.agentDirective}
            </p>

            <div className="p-2.5 rounded-lg bg-[#0b1220] border border-slate-800/80 text-xs font-mono text-cyan-300 flex items-start gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Protocol: {selectedNode.protocol} ({selectedNode.latencyBadge})</span>
            </div>

            {/* Operational Invariants */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Engineering Invariants:
              </span>
              {selectedNode.invariants.map((inv, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{inv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real Implementation Code & Communication Schema Tabs */}
        <div className="lg:col-span-7">
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#070b14]">
            {/* Code / Contract Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c1424] border-b border-slate-800 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('code')}
                  className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                    activeCodeTab === 'code'
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />
                  Production Implementation
                </button>
                <button
                  onClick={() => setActiveCodeTab('contract')}
                  className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                    activeCodeTab === 'contract'
                      ? 'bg-slate-800 text-cyan-400 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 inline mr-1" />
                  JSON Contract
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase">
                  {activeCodeTab === 'code' ? selectedNode.codeLanguage : 'JSON Schema'}
                </span>
                <button
                  onClick={handleCopyCode}
                  aria-label="Copy Code"
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition-all cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre className="p-3.5 text-[11px] sm:text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[360px] overflow-y-auto">
              {activeCodeTab === 'code' ? selectedNode.implementationCode : selectedNode.communicationContract}
            </pre>
          </div>
        </div>
      </div>

      {/* 5. Four Foundational Agentic Architecture Pillars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
          <Brain className="w-5 h-5 text-purple-400 mb-2" />
          <h4 className="text-xs sm:text-sm font-bold font-editorial text-white mb-1">
            Dynamic DAG Decomposition
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">
            Eliminates monolithic prompt collapse by breaking objectives into bounded, acyclic subtasks with strict dependency barriers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
          <Terminal className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-xs sm:text-sm font-bold font-editorial text-white mb-1">
            Sandboxed Autonomous Workers
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">
            Workers operate in gVisor/Docker sandboxes with AST static analysis, strict timeout limits, and zero cross-tenant socket leakage.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
          <Wrench className="w-5 h-5 text-amber-400 mb-2" />
          <h4 className="text-xs sm:text-sm font-bold font-editorial text-white mb-1">
            Model Context Protocol (MCP)
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">
            Decouples tool integrations from LLM models using standardized JSON-RPC 2.0 schemas, token authorization, and read-replica gates.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
          <ShieldCheck className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="text-xs sm:text-sm font-bold font-editorial text-white mb-1">
            Self-Correcting Reflection & HITL
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans leading-relaxed">
            Critic agents catch hallucinations with automated replanning loops, escalating critical state mutations to human operators.
          </p>
        </div>
      </div>
    </div>
  )
}
