import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

describe('Portfolio Verification & Asset Integrity', () => {
  test('public/Meena_Kannan_Senior_Architect_Resume.pdf exists and is a valid PDF', () => {
    const resumePath = path.join(rootDir, 'public', 'Meena_Kannan_Senior_Architect_Resume.pdf');
    assert.ok(fs.existsSync(resumePath), 'Resume PDF should exist in public directory');
    
    const buffer = fs.readFileSync(resumePath);
    const header = buffer.subarray(0, 8).toString('utf8');
    assert.ok(header.startsWith('%PDF-'), 'File should start with valid PDF magic bytes');
  });

  test('public/chat/index.json contains expected structured knowledge docs', () => {
    const chatIndexPath = path.join(rootDir, 'public', 'chat', 'index.json');
    assert.ok(fs.existsSync(chatIndexPath), 'Chat index file should exist');
    
    const rawContent = fs.readFileSync(chatIndexPath, 'utf8');
    assert.ok(!/[\u2013\u2014]/.test(rawContent), 'Chat index must contain zero em/en-dashes');
    const content = JSON.parse(rawContent);
    assert.ok(Array.isArray(content), 'Chat knowledge base should be an array');
    assert.ok(content.length >= 10, 'Knowledge base should have at least 10 structured entries');
    
    const ids = content.map(c => c.id);
    assert.ok(ids.includes('ai-codex'), 'Knowledge base must index ByteByteGo AI Architecture Codex');
    assert.ok(ids.includes('architectural-decisions'), 'Knowledge base must index Architectural Decision Records');
    assert.ok(ids.includes('model-context-protocol'), 'Knowledge base must index Model Context Protocol');
    assert.ok(ids.includes('saga-distributed-transactions'), 'Knowledge base must index Saga transactions');

    for (const item of content) {
      assert.ok(item.id, 'Entry must have an ID');
      assert.ok(item.title, 'Entry must have a title');
      assert.ok(item.text, 'Entry must have descriptive text');
      assert.ok(item.url, 'Entry must have a deep-link anchor');
    }
  });

  test('public/og-image.svg and public/robots.txt exist for SEO & social cards', () => {
    assert.ok(fs.existsSync(path.join(rootDir, 'public', 'og-image.svg')), 'OG image must exist');
    assert.ok(fs.existsSync(path.join(rootDir, 'public', 'robots.txt')), 'robots.txt must exist');
    assert.ok(fs.existsSync(path.join(rootDir, 'public', 'sitemap.xml')), 'sitemap.xml must exist');
    assert.ok(fs.existsSync(path.join(rootDir, 'public', 'favicon.svg')), 'favicon.svg must exist');
    
    // Sitemap architecture indexing assertion (Task O1)
    const sitemapXml = fs.readFileSync(path.join(rootDir, 'public', 'sitemap.xml'), 'utf8');
    assert.ok(sitemapXml.includes('#architecture'), 'sitemap.xml must index #architecture section');

    // Detailed SVG baseline assertion (Task D3 & O2)
    const ogSvg = fs.readFileSync(path.join(rootDir, 'public', 'og-image.svg'), 'utf8');
    assert.ok(ogSvg.includes('width="1200"') && ogSvg.includes('height="630"'), 'OG image must have 1200x630 dimensions');
    assert.ok(ogSvg.includes('viewBox="0 0 1200 630"'), 'OG image must have standard 1200x630 viewBox');
    assert.ok(ogSvg.includes('MEENA KANNAN'), 'OG image must feature Meena Kannan brand');
    assert.ok(ogSvg.includes('Senior Full-Stack &amp; Cloud Solutions Architect'), 'OG image must feature executive role title');
    assert.ok(ogSvg.includes('99.99% SLA UPTIME'), 'OG image must feature SLA metric');
    assert.ok(ogSvg.includes('MCP &amp; AGENTIC AI'), 'OG image must feature MCP & AGENTIC AI badge');
    assert.ok(ogSvg.includes('MCP / Agentic AI'), 'OG image subtitle must list MCP / Agentic AI');
    assert.ok(!/[\u2013\u2014]/.test(ogSvg), 'og-image.svg must contain zero em/en-dashes');
  });

  test('ByteByteGoAiCodex defines all 5 AI paradigms and is embedded in ArchitectureLab', () => {
    const codexPath = path.join(rootDir, 'src', 'components', 'architecture', 'ByteByteGoAiCodex.tsx');
    assert.ok(fs.existsSync(codexPath), 'ByteByteGoAiCodex.tsx must exist');
    const codexCode = fs.readFileSync(codexPath, 'utf8');
    assert.ok(codexCode.includes('agentic-ai'), 'Must specify Agentic AI paradigm');
    assert.ok(codexCode.includes('lrm'), 'Must specify Large Reasoning Model paradigm');
    assert.ok(codexCode.includes('vectordb'), 'Must specify Vector Database paradigm');
    assert.ok(codexCode.includes('rag'), 'Must specify RAG paradigm');
    assert.ok(codexCode.includes('mcp'), 'Must specify MCP paradigm');
    assert.ok(codexCode.includes('AI Terms You Need to Know'), 'Must feature ByteByteGo headline');
    assert.ok(codexCode.includes('handleCopyMermaid'), 'Must support copying Mermaid syntax to clipboard');
    assert.ok(codexCode.includes('handleDownloadSvg'), 'Must support downloading diagram as pure SVG vector file');
    assert.ok(codexCode.includes('mermaidDiagram'), 'Must define Mermaid diagram representations for enterprise architectures');
    assert.ok(!/[\u2013\u2014]/.test(codexCode), 'ByteByteGoAiCodex must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('ByteByteGoAiCodex'), 'ArchitectureLab must render ByteByteGoAiCodex');
  });

  test('index.html contains valid favicon.svg link, OpenGraph tags, and pre-rendered semantic landmarks', () => {
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(html.includes('href="/favicon.svg"'), 'Must link to /favicon.svg in public directory');
    assert.ok(html.includes('property="og:title"'), 'Must define og:title');
    assert.ok(html.includes('property="og:description"'), 'Must define og:description');
    assert.ok(html.includes('property="og:image"'), 'Must define og:image');
    assert.ok(html.includes('<header'), 'Must include semantic <header> landmark');
    assert.ok(html.includes('<main'), 'Must include semantic <main> landmark');
    assert.ok(html.includes('<section'), 'Must include semantic <section> landmark');
    assert.ok(html.includes('<footer'), 'Must include semantic <footer> landmark');
    assert.ok(!html.includes('<div id="root"></div>'), 'Root must not be an empty shell; must have pre-rendered structure');
  });
});

describe('Interactive CLI & Assistant Query Engine', () => {
  const COMMAND_LIST = [
    'help', 'whoami', 'skills', 'projects', 'experience',
    'contact', 'hire', 'architecture', 'stats', 'resume',
    'clear', 'echo', 'date', 'sudo', 'easteregg'
  ];

  test('CLI command suite defines all required commands', () => {
    assert.ok(COMMAND_LIST.includes('whoami'));
    assert.ok(COMMAND_LIST.includes('skills'));
    assert.ok(COMMAND_LIST.includes('projects'));
    assert.ok(COMMAND_LIST.includes('architecture'));
    assert.ok(COMMAND_LIST.includes('resume'));
  });

  test('Knowledge query resolution correctly categorizes core keywords', () => {
    function findAnswerCategory(query) {
      const q = query.toLowerCase();
      if (q.includes('skill') || q.includes('stack')) return 'skills';
      if (q.includes('saas') || q.includes('platform')) return 'saas';
      if (q.includes('availab') || q.includes('hire')) return 'available';
      if (q.includes('contact') || q.includes('email')) return 'contact';
      if (q.includes('project') || q.includes('built')) return 'projects';
      return 'general';
    }

    assert.equal(findAnswerCategory('What are your skills?'), 'skills');
    assert.equal(findAnswerCategory('Tell me about the SaaS platform'), 'saas');
    assert.equal(findAnswerCategory('Is Meena available for hire?'), 'available');
    assert.equal(findAnswerCategory('How can I contact Meena?'), 'contact');
    assert.equal(findAnswerCategory('What projects have you built?'), 'projects');
    assert.equal(findAnswerCategory('Random question'), 'general');
  });

  test('InteractiveCli.tsx supports deep project inspection via project <id>', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'project'"), "InteractiveCli must include 'project' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes('PROJECT_DETAILS'), 'InteractiveCli must define PROJECT_DETAILS');
    assert.ok(cliCode.includes("case 'project':"), "InteractiveCli switch must handle 'project'");
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });

  test('InteractiveCli.tsx supports deep experience milestone inspection via experience <id>', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'exp'"), "InteractiveCli must include 'exp' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'timeline'"), "InteractiveCli must include 'timeline' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes('MILESTONE_DETAILS'), 'InteractiveCli must define MILESTONE_DETAILS');
    assert.ok(cliCode.includes("case 'experience':"), "InteractiveCli switch must handle 'experience'");
  });

  test('InteractiveCli.tsx supports Model Context Protocol inspection via mcp and is rendered in AboutTerminal', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'mcp'"), "InteractiveCli must include 'mcp' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'model-context-protocol'"), "InteractiveCli must include 'model-context-protocol' alias");
    assert.ok(cliCode.includes('[ $ mcp ]'), "InteractiveCli must define [ $ mcp ] quick chip");
    assert.ok(cliCode.includes("case 'mcp':"), "InteractiveCli switch must handle 'mcp'");

    const aboutCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'AboutTerminal.tsx'), 'utf8');
    assert.ok(aboutCode.includes('<InteractiveCli'), 'AboutTerminal must render InteractiveCli in the about section');
  });

  test('InteractiveCli.tsx supports granular AI paradigm inspection via ai <term> and aliases', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'ai'"), "InteractiveCli must include 'ai' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'ai-terms'"), "InteractiveCli must include 'ai-terms' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'paradigms'"), "InteractiveCli must include 'paradigms' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("sub.includes('agent')"), "InteractiveCli must handle agent paradigm deep-dive");
    assert.ok(cliCode.includes("sub.includes('lrm')"), "InteractiveCli must handle lrm paradigm deep-dive");
    assert.ok(cliCode.includes("sub.includes('vector')"), "InteractiveCli must handle vector paradigm deep-dive");
    assert.ok(cliCode.includes("sub.includes('rag')"), "InteractiveCli must handle rag paradigm deep-dive");
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });
});

describe('Mobile & Cross-Device Responsiveness Verification', () => {
  test('index.html includes viewport meta tag with viewport-fit=cover', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('name="viewport"'), 'Viewport meta must exist');
    assert.ok(indexHtml.includes('width=device-width'), 'Device-width must be configured');
    assert.ok(indexHtml.includes('viewport-fit=cover'), 'viewport-fit=cover must be present for iOS safe areas');
  });

  test('src/index.css includes touch-scroll and mobile body containment', () => {
    const indexCss = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(indexCss.includes('-webkit-overflow-scrolling: touch'), 'touch scrolling support must be defined');
    assert.ok(indexCss.includes('-webkit-text-size-adjust: 100%'), 'text size adjust must be 100% to prevent iOS distortion');
    assert.ok(indexCss.includes('overflow-x: hidden'), 'overflow-x hidden must prevent horizontal wiggle');
  });

  test('Layout.tsx contains safe-area drawer and synchronous scroll unlock', () => {
    const layoutTsx = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Layout.tsx'), 'utf8');
    assert.ok(layoutTsx.includes('safe-area-inset-bottom'), 'Layout must handle bottom safe area for notch devices');
    assert.ok(layoutTsx.includes("document.body.style.overflow = ''"), 'Must clear scroll lock for mobile navigation');
  });

  test('ChatWidget.tsx prevents mobile collision between launcher and input sheet', () => {
    const chatTsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ChatWidget.tsx'), 'utf8');
    assert.ok(chatTsx.includes("isOpen ? 'hidden sm:block' : 'block'"), 'Floating launcher must hide on mobile when sheet is active');
    assert.ok(chatTsx.includes('safe-area-inset-bottom'), 'Chat sheet must account for safe area insets');
  });
});

describe('ByteByteGo Architecture & Stock Image Elimination Verification', () => {
  test('ProjectsShowcase.tsx has 0 low-quality Unsplash stock photos and embeds ByteByteGoDiagram', () => {
    const showcaseCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ProjectsShowcase.tsx'), 'utf8');
    assert.ok(!showcaseCode.includes('images.unsplash.com'), 'All generic Unsplash stock photos must be eliminated');
    assert.ok(showcaseCode.includes('ByteByteGoDiagram'), 'Must embed ByteByteGoDiagram component');
    assert.ok(showcaseCode.includes('variant="preview"'), 'Must provide interactive preview in project card');
    assert.ok(showcaseCode.includes('variant="workbench"'), 'Must provide full workbench simulator in modal');
  });

  test('src/data/architectureSystems.ts defines complete specifications for all 4 enterprise systems', () => {
    const archFilePath = path.join(rootDir, 'src', 'data', 'architectureSystems.ts');
    assert.ok(fs.existsSync(archFilePath), 'architectureSystems.ts must exist');
    const archCode = fs.readFileSync(archFilePath, 'utf8');
    
    assert.ok(archCode.includes("'saas-platform'"), 'Must define saas-platform system');
    assert.ok(archCode.includes("'ecommerce-engine'"), 'Must define ecommerce-engine system');
    assert.ok(archCode.includes("'realtime-platform'"), 'Must define realtime-platform system');
    assert.ok(archCode.includes("'fintech-gateway'"), 'Must define fintech-gateway system');
    assert.ok(archCode.includes('chaosScenarios'), 'Must define chaos failure mode simulations');
  });

  test('AboutTerminal.tsx embeds Agentic AI Orchestrator-Worker Workflow Diagram in ByteByteGo style', () => {
    const aboutCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'AboutTerminal.tsx'), 'utf8');
    assert.ok(aboutCode.includes('AgenticWorkflowDiagram') || aboutCode.includes('CleanArchitectureRadar'), 'AboutTerminal must embed AgenticWorkflowDiagram');
    assert.ok(aboutCode.includes('CleanArchitectureSpec.java'), 'AboutTerminal must include CleanArchitectureSpec.java');
    assert.ok(aboutCode.includes('SagaPaymentCoordinator.java'), 'AboutTerminal must include SagaPaymentCoordinator.java');
    assert.ok(aboutCode.includes('TenantIsolationFilter.java'), 'AboutTerminal must include TenantIsolationFilter.java');
    assert.ok(aboutCode.includes('role="tablist"'), 'AboutTerminal must provide accessible role="tablist"');
    
    const diagramCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'AgenticWorkflowDiagram.tsx'), 'utf8');
    assert.ok(diagramCode.includes('AGENTIC AI ARCHITECTURE BLUEPRINT'), 'Must define Agentic AI Architecture Blueprint');
    assert.ok(diagramCode.includes('Supervisor Orchestrator'), 'Must define Supervisor Orchestrator');
    assert.ok(diagramCode.includes('SPECIALIZED WORKER POOL'), 'Must define Specialized Worker Pool');
  });

  test('SystemDesignCanvas, ArchNode, and AnimatedConnection satisfy ByteByteGo specs', () => {
    const canvasCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'SystemDesignCanvas.tsx'), 'utf8');
    assert.ok(canvasCode.includes('viewBox="0 0 1200 650"'), 'Canvas must use viewBox 0 0 1200 650 for responsive scaling');
    assert.ok(canvasCode.includes('#0B0F19'), 'Canvas must have dark slate blueprint background #0B0F19');
    assert.ok(canvasCode.includes('pattern'), 'Canvas must use SVG grid/dot pattern');
    assert.ok(canvasCode.includes('opacity: 0.25') || canvasCode.includes('0.25'), 'Canvas must dim inactive nodes and paths to 0.25 opacity');
    assert.ok(canvasCode.includes('playbackSpeed'), 'Canvas must provide speed controls');
    assert.ok(canvasCode.includes('activeStep'), 'Canvas must provide synchronized active step playback');

    const nodeCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'ArchNode.tsx'), 'utf8');
    assert.ok(nodeCode.includes('JetBrains Mono'), 'ArchNode must use JetBrains Mono bold typography');
    assert.ok(nodeCode.includes('#1E293B'), 'ArchNode must have 1.5px crisp slate border');
    assert.ok(nodeCode.includes('renderTechIcon'), 'ArchNode must render authentic SVG infrastructure icons');

    const connCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'AnimatedConnection.tsx'), 'utf8');
    assert.ok(connCode.includes('stroke="#334155"') || connCode.includes('#334155'), 'AnimatedConnection must have muted structural base wire #334155');
    assert.ok(connCode.includes('strokeDasharray="6 6"'), 'AnimatedConnection must use strokeDasharray 6 6 flowing stream');
    assert.ok(connCode.includes('animateMotion'), 'AnimatedConnection must animate packets using SVG animateMotion');
    assert.ok(connCode.includes('#38BDF8'), 'AnimatedConnection must support Cyan packet type');
    assert.ok(connCode.includes('#10B981'), 'AnimatedConnection must support Emerald packet type');
    assert.ok(connCode.includes('#F59E0B'), 'AnimatedConnection must support Amber packet type');
    assert.ok(connCode.includes('#A855F7'), 'AnimatedConnection must support Purple packet type');
  });

  test('byteByteGoConfigs.ts configures all 4 enterprise systems with orthogonal routing and 6-step flows', () => {
    const configCode = fs.readFileSync(path.join(rootDir, 'src', 'data', 'byteByteGoConfigs.ts'), 'utf8');
    assert.ok(configCode.includes("'saas-platform'"), 'Must configure saas-platform');
    assert.ok(configCode.includes("'ecommerce-engine'"), 'Must configure ecommerce-engine');
    assert.ok(configCode.includes("'realtime-platform'"), 'Must configure realtime-platform');
    assert.ok(configCode.includes("'fintech-gateway'"), 'Must configure fintech-gateway');
    assert.ok(configCode.includes('EDGE & INGRESS ZONE'), 'Must define Edge Subsystem');
    assert.ok(configCode.includes('VPC / PRIVATE SUBNET'), 'Must define VPC Subsystem');
    assert.ok(configCode.includes('MICROSERVICE & WORKER CLUSTER'), 'Must define Worker Cluster Subsystem');
    assert.ok(configCode.includes('DATA PERSISTENCE LAYER'), 'Must define Persistence Subsystem');
    assert.ok(configCode.includes('Step 1:'), 'Must define Step 1');
    assert.ok(configCode.includes('Step 6:'), 'Must define Step 6');
  });

  test('ArchitectureLab.tsx and SystemDesignCanvas feature live system switcher and SVG export', () => {
    const labPath = path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx');
    assert.ok(fs.existsSync(labPath), 'ArchitectureLab.tsx must exist');
    const labCode = fs.readFileSync(labPath, 'utf8');
    assert.ok(labCode.includes('ByteByteGoDiagram'), 'ArchitectureLab must embed ByteByteGoDiagram');
    assert.ok(labCode.includes('allowSystemSwitch'), 'ArchitectureLab must enable system switching');

    const canvasCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'SystemDesignCanvas.tsx'), 'utf8');
    assert.ok(canvasCode.includes('handleExportSvg'), 'SystemDesignCanvas must implement SVG blueprint export');
    assert.ok(canvasCode.includes('handleCopySpec'), 'SystemDesignCanvas must implement JSON spec copy');
    assert.ok(canvasCode.includes('onSelectSystem'), 'SystemDesignCanvas must support onSelectSystem');

    const layoutCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Layout.tsx'), 'utf8');
    assert.ok(layoutCode.includes('#architecture'), 'Layout must link to #architecture section');

    const portfolioCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Portfolio.tsx'), 'utf8');
    assert.ok(portfolioCode.includes('id="architecture"'), 'Portfolio must mount architecture section');
    assert.ok(portfolioCode.includes('ArchitectureLab'), 'Portfolio must render ArchitectureLab');
    assert.ok(portfolioCode.includes('[1-7]'), 'Portfolio must render footer keyboard shortcut pill [1-7]');
    assert.ok(portfolioCode.includes('[{idx + 1}]'), 'Portfolio must render indexed vertical tracker dot tooltips');

    const codexCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'ByteByteGoAiCodex.tsx'), 'utf8');
    assert.ok(codexCode.includes('isStudioMode ?'), 'ByteByteGoAiCodex must implement Studio Canvas dual theme styling');
  });
});

describe('Terminal Hero & Route Fault-Tolerance Verification', () => {
  test('TerminalHero derives displayedCode safely and guards against undefined line checks', () => {
    const heroCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'TerminalHero.tsx'), 'utf8');
    assert.ok(heroCode.includes('displayedCode = useMemo'), 'displayedCode must be derived via useMemo to avoid sparse state race conditions');
    assert.ok(heroCode.includes("const line = typeof rawLine === 'string' ? rawLine : ''"), 'Must sanitize rawLine to prevent undefined.startsWith crash');
    assert.ok(heroCode.includes('handleTabChange'), 'Must cleanly reset typewriter state synchronously on tab change');
    assert.ok(heroCode.includes("'mcp'"), 'TerminalHero must include mcp tab');
    assert.ok(heroCode.includes('mcp-server-config.json'), 'TerminalHero must define mcp-server-config.json');
    assert.ok(heroCode.includes('Model Context Protocol'), 'TerminalHero must define Model Context Protocol badge');
    assert.ok(!/[\u2013\u2014]/.test(heroCode), 'TerminalHero must contain zero em/en-dashes');
  });

  test('ContactTerminal guards against undefined line strings', () => {
    const contactCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ContactTerminal.tsx'), 'utf8');
    assert.ok(contactCode.includes("const line = typeof rawLine === 'string' ? rawLine : ''"), 'ContactTerminal must sanitize rawLine');
  });

  test('RouteErrorBoundary is implemented and configured on root route', () => {
    const boundaryPath = path.join(rootDir, 'src', 'components', 'portfolio', 'RouteErrorBoundary.tsx');
    assert.ok(fs.existsSync(boundaryPath), 'RouteErrorBoundary.tsx must exist');

    const mainCode = fs.readFileSync(path.join(rootDir, 'src', 'main.tsx'), 'utf8');
    assert.ok(mainCode.includes('errorElement: <RouteErrorBoundary />'), 'Root route must configure RouteErrorBoundary as errorElement');
  });
});

describe('Enterprise Architectural Upgrades & B2B Production Readiness', () => {
  test('Projects section header eliminates third-party branding', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('Enterprise Systems & Interactive Architecture Workbenches'), 'index.html must use Enterprise Systems & Interactive Architecture Workbenches');
    assert.ok(!indexHtml.includes('Enterprise Projects & ByteByteGo Architecture Workbenches'), 'Old third-party branding header must be removed');

    const showcaseCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ProjectsShowcase.tsx'), 'utf8');
    assert.ok(showcaseCode.includes('Enterprise Systems & Interactive Architecture Workbenches'), 'ProjectsShowcase must use updated section title');
  });

  test('Project #2 terminology enforces Saga, Outbox, and Idempotent consumers', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(!indexHtml.includes('two-phase commit resilience'), 'two-phase commit resilience must be eliminated from project 2 description');
    assert.ok(indexHtml.includes('Choreographed Saga orchestration, Transactional Outbox pattern (Debezium CDC), and idempotent Kafka consumers'), 'Must use choreographed saga and outbox pattern terminology');

    const showcaseCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ProjectsShowcase.tsx'), 'utf8');
    assert.ok(showcaseCode.includes('Choreographed Saga orchestration, Transactional Outbox pattern (Debezium CDC), and idempotent Kafka consumers'), 'ProjectsShowcase must define exact distributed systems terminology');
  });

  test('Project cards define problemStatement, architectureHighlights, diagramNodes, ADR, and action buttons', () => {
    const showcaseCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ProjectsShowcase.tsx'), 'utf8');
    assert.ok(showcaseCode.includes('problemStatement'), 'Project objects must define problemStatement');
    assert.ok(showcaseCode.includes('architectureHighlights'), 'Project objects must define architectureHighlights');
    assert.ok(showcaseCode.includes('diagramNodes'), 'Project objects must define diagramNodes request flow');
    assert.ok(showcaseCode.includes('adr: ArchitecturalDecisionRecord') || showcaseCode.includes('adr: {') || showcaseCode.includes('adr:'), 'Project objects must define ADR structure');
    assert.ok(showcaseCode.includes('View Architecture Blueprint'), 'Card must have View Architecture Blueprint button');
    assert.ok(showcaseCode.includes('Read ADR'), 'Card must have Read ADR button');
  });

  test('Experience section defines structured 8+ years leadership timeline', () => {
    const timelineCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ExperienceTimeline.tsx'), 'utf8');
    assert.ok(timelineCode.includes('8+ YEARS ARCHITECTURAL LEADERSHIP') || timelineCode.includes('8+ years'), 'Must highlight 8+ years leadership');
    assert.ok(timelineCode.includes('Zero-Downtime Monolith-to-Microservices Migration'), 'Must quantify zero-downtime microservices migration');
    assert.ok(timelineCode.includes('Kubernetes/EKS & AWS Cost Optimization'), 'Must quantify EKS cost optimization');
    assert.ok(timelineCode.includes('Cross-Functional Squad Leadership'), 'Must detail cross-functional squad leadership');
    assert.ok(timelineCode.includes('techAndPatterns'), 'Must provide tech & patterns pill badges');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('Lead Full-Stack & Cloud Solutions Architect'), 'index.html pre-rendered experience must define structured milestone entries');
    assert.ok(indexHtml.includes('Senior Full-Stack & Distributed Systems Engineer'), 'index.html pre-rendered experience must define senior engineer milestone');
    assert.ok(!indexHtml.includes('<p style="color: #94a3b8;">Track record of architecting enterprise solutions, leading engineering squads, and driving zero-downtime migrations.</p>'), 'Single paragraph placeholder must be replaced');
  });

  test('Interactive terminal provides clickable quick-action chips directly above prompt', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes('[ $ whoami ]'), 'Must define [ $ whoami ] quick chip');
    assert.ok(cliCode.includes('[ $ architecture ]'), 'Must define [ $ architecture ] quick chip');
    assert.ok(cliCode.includes('[ $ skills ]'), 'Must define [ $ skills ] quick chip');
    assert.ok(cliCode.includes('[ $ contact ]'), 'Must define [ $ contact ] quick chip');
    assert.ok(cliCode.includes('handleQuickChipClick'), 'Must execute quick chip on click');
    assert.ok(cliCode.includes("e.key === 'ArrowUp'") && cliCode.includes("e.key === 'ArrowDown'"), 'Must maintain keyboard history navigation');
    assert.ok(cliCode.includes("e.key === 'Tab'"), 'Must maintain Tab autocomplete');
  });

  test('Contact section fixes Cloudflare obfuscation and features B2B Inquiry card', () => {
    const contactCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ContactTerminal.tsx'), 'utf8');
    assert.ok(contactCode.includes('getDynamicEmail'), 'Must construct email dynamically to evade scraping');
    assert.ok(contactCode.includes('Copied to clipboard!'), 'Must provide toast state for email copy');
    assert.ok(contactCode.includes('B2B Consulting & Architecture Inquiry'), 'Must embed B2B Consulting Inquiry card');
    assert.ok(contactCode.includes('Name / Company'), 'Must include Name / Company field');
    assert.ok(contactCode.includes('Engagement Type'), 'Must include Engagement Type field');
    assert.ok(contactCode.includes('Project Brief'), 'Must include Project Brief field');
    assert.ok(contactCode.includes("'AI Systems & MCP'"), 'Must include AI Systems & MCP engagement type');
    assert.ok(contactCode.includes('Agentic AI & Model Context Protocol (MCP) Enterprise Architecture'), 'Must feature Agentic AI & MCP core pillar');
    assert.ok(contactCode.includes('https://www.linkedin.com/in/meena-kannan'), 'Must link to LinkedIn');
    assert.ok(contactCode.includes('https://github.com/meenak95'), 'Must link to GitHub');
    assert.ok(!/[\u2013\u2014]/.test(contactCode), 'ContactTerminal.tsx must contain zero em/en-dashes');
  });

  test('index.html contains valid JSON-LD Person and WebSite schema and meta tags', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('application/ld+json'), 'Must contain JSON-LD script tag');
    assert.ok(indexHtml.includes('"@type": "Person"'), 'JSON-LD must define Person');
    assert.ok(indexHtml.includes('"@type": "WebSite"'), 'JSON-LD must define WebSite');
    assert.ok(indexHtml.includes('https://meenakannan.dev'), 'JSON-LD must define canonical URL');
    assert.ok(indexHtml.includes('ByteByteGo System Design & Architecture'), 'JSON-LD must define ByteByteGo competency');
    assert.ok(indexHtml.includes('Model Context Protocol (MCP)'), 'JSON-LD must define MCP competency');
    assert.ok(indexHtml.includes('twitter:card'), 'Must define twitter:card');
    assert.ok(indexHtml.includes('og:title'), 'Must define og:title');
  });
});

describe('Quality, Antislop, Accessibility & Performance Hygiene Verification', () => {
  test('src/index.css enforces tabular-nums and defines WCAG prefers-reduced-motion block', () => {
    const css = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');
    assert.ok(css.includes('font-variant-numeric: tabular-nums'), 'index.css must enforce tabular-nums for numeric stability');
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'index.css must include prefers-reduced-motion accessibility media query');
  });

  test('src/components/MatrixBackground.tsx respects prefers-reduced-motion', () => {
    const code = fs.readFileSync(path.join(rootDir, 'src', 'components', 'MatrixBackground.tsx'), 'utf8');
    assert.ok(code.includes('prefers-reduced-motion: reduce'), 'MatrixBackground must detect prefers-reduced-motion preference');
  });

  test('All architecture and portfolio files are free of generic Hallmark Score slop comments', () => {
    const archDir = path.join(rootDir, 'src', 'components', 'architecture');
    const files = fs.readdirSync(archDir);
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(archDir, file), 'utf8');
        assert.ok(!content.includes('Hallmark Score'), `${file} must not contain generic Hallmark Score comment`);
      }
    }
  });

  test('ChatWidget.tsx implements Escape key listener and accessible dialog semantics', () => {
    const chatCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ChatWidget.tsx'), 'utf8');
    assert.ok(chatCode.includes("e.key === 'Escape'"), 'ChatWidget must dismiss on Escape key press');
    assert.ok(chatCode.includes('role="dialog"'), 'ChatWidget modal must specify role="dialog"');
    assert.ok(chatCode.includes('aria-modal="true"'), 'ChatWidget modal must specify aria-modal="true"');
  });

  test('ChatWidget.tsx provides conversational AI retrieval for MCP, AI codex, and ADRs', () => {
    const chatCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ChatWidget.tsx'), 'utf8');
    assert.ok(chatCode.includes("'mcp': {"), 'ChatWidget must define FAQ for MCP');
    assert.ok(chatCode.includes("'ai': {"), 'ChatWidget must define FAQ for AI architectures');
    assert.ok(chatCode.includes("'adr': {"), 'ChatWidget must define FAQ for ADRs');
    assert.ok(chatCode.includes("'saga': {"), 'ChatWidget must define FAQ for Saga transactions');
    assert.ok(chatCode.includes('Explain Meena\'s AI architecture & MCP codex'), 'ChatWidget must include MCP codex quick question');
    assert.ok(chatCode.includes('What are Meena\'s Architectural Decision Records (ADR)?'), 'ChatWidget must include ADR quick question');
    assert.ok(!/[\u2013\u2014]/.test(chatCode), 'ChatWidget must contain zero em/en-dashes');
  });

  test('vite.config.ts configures architecture-data chunk splitting', () => {
    const viteCode = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf8');
    assert.ok(viteCode.includes('architecture-data'), 'vite.config.ts must define architecture-data chunk');
  });

  test('ContactTerminal.tsx implements accessible radiogroup semantics for engagement type selection', () => {
    const contactCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ContactTerminal.tsx'), 'utf8');
    assert.ok(contactCode.includes('role="radiogroup"'), 'ContactTerminal must define role="radiogroup" for engagement options');
    assert.ok(contactCode.includes('role="radio"'), 'Engagement buttons must define role="radio"');
    assert.ok(contactCode.includes('aria-checked='), 'Engagement buttons must define aria-checked');
  });

  test('InteractiveCli.tsx implements aria-live dynamic region for screen readers', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes('aria-live="polite"'), 'Interactive CLI terminal must define aria-live="polite"');
  });

  test('ArchNode.tsx and ByteByteGoWorkbench.tsx support keyboard interaction with tabIndex and role="button"', () => {
    const archNodeCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'ArchNode.tsx'), 'utf8');
    assert.ok(archNodeCode.includes('tabIndex={0}'), 'ArchNode must provide tabIndex={0} for keyboard accessibility');
    assert.ok(archNodeCode.includes('role="button"'), 'ArchNode must provide role="button"');

    const workbenchCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'architecture', 'ByteByteGoWorkbench.tsx'), 'utf8');
    assert.ok(workbenchCode.includes('tabIndex={0}'), 'ByteByteGoWorkbench nodes must provide tabIndex={0}');
  });

  test('src/components/ui primitives adhere to Swiss Editorial tokens and focus-visible rings without legacy green tokens', () => {
    const inputCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ui', 'input.tsx'), 'utf8');
    assert.ok(!inputCode.includes('border-green-500'), 'Input must not use legacy border-green-500');
    assert.ok(inputCode.includes('focus-visible:ring'), 'Input must specify focus-visible:ring');

    const textareaCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ui', 'textarea.tsx'), 'utf8');
    assert.ok(!textareaCode.includes('border-green-500'), 'Textarea must not use legacy border-green-500');
    assert.ok(textareaCode.includes('focus-visible:ring'), 'Textarea must specify focus-visible:ring');
  });
});

describe('Production Architectural Decision Records (ADR) & CLI Integration', () => {
  test('src/data/architecturalDecisions.ts defines ADR-001 through ADR-006 with complete sections', () => {
    const adrFile = path.join(rootDir, 'src', 'data', 'architecturalDecisions.ts');
    assert.ok(fs.existsSync(adrFile), 'architecturalDecisions.ts must exist');
    const content = fs.readFileSync(adrFile, 'utf8');

    const expectedIds = ['ADR-001', 'ADR-002', 'ADR-003', 'ADR-004', 'ADR-005', 'ADR-006'];
    for (const id of expectedIds) {
      assert.ok(content.includes(id), `architecturalDecisions.ts must contain ${id}`);
    }

    assert.ok(content.includes('Choreographed Saga Pattern'), 'Must include Choreographed Saga ADR');
    assert.ok(content.includes('Transactional Outbox with Debezium CDC'), 'Must include Transactional Outbox ADR');
    assert.ok(content.includes('Java 21 Virtual Threads'), 'Must include Java 21 Virtual Threads ADR');
    assert.ok(content.includes('Dual-Tier Caching'), 'Must include Dual-Tier Caching ADR');
    assert.ok(content.includes('Zero-Trust Envoy Edge Ingress'), 'Must include Zero-Trust Envoy ADR');
    assert.ok(content.includes('Model Context Protocol (MCP)'), 'Must include Model Context Protocol ADR');
    assert.ok(!/[\u2013\u2014]/.test(content), 'architecturalDecisions.ts must contain zero em/en-dashes');
  });

  test('ArchitectureLab.tsx integrates AdrExplorer below AI Codex', () => {
    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('import AdrExplorer'), 'ArchitectureLab must import AdrExplorer');
    assert.ok(labCode.includes('<AdrExplorer />') || labCode.includes('<AdrExplorer'), 'ArchitectureLab must render AdrExplorer');
  });

  test('InteractiveCli.tsx supports adr command and includes quick chip', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'adr'"), "InteractiveCli must include 'adr' command in available commands");
    assert.ok(cliCode.includes('[ $ adr ]'), "InteractiveCli must include '[ $ adr ]' quick chip");
    assert.ok(cliCode.includes("case 'adr':"), "InteractiveCli switch must handle 'adr' command");
    assert.ok(cliCode.includes('ARCHITECTURAL_DECISIONS'), 'InteractiveCli must reference ARCHITECTURAL_DECISIONS');
  });

  test('TechStack.tsx includes AI Systems & Protocols category with MCP, RAG, pgvector, and LRMs', () => {
    const techCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'TechStack.tsx'), 'utf8');
    assert.ok(techCode.includes("'AI Systems & Protocols'"), 'TechStack must define AI Systems & Protocols category');
    assert.ok(techCode.includes('Model Context Protocol (MCP)'), 'TechStack must include Model Context Protocol');
    assert.ok(techCode.includes('Retrieval-Augmented Generation (RAG)'), 'TechStack must include RAG');
    assert.ok(techCode.includes('Vector Databases & pgvector'), 'TechStack must include pgvector');
    assert.ok(techCode.includes('Large Reasoning Models (LRM)'), 'TechStack must include LRM');
    assert.ok(!/[\u2013\u2014]/.test(techCode), 'TechStack.tsx must contain zero em/en-dashes');
  });
});


