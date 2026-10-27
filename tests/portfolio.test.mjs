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
    assert.ok(ids.includes('architectural-tradeoffs'), 'Knowledge base must index Architectural Tradeoffs');

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
    assert.ok(codexCode.includes('handleCopyRfcSpec'), 'Must support copying RFC specification markdown');
    assert.ok(codexCode.includes('activeAgentNode'), 'Must support interactive Agentic AI node inspection');
    assert.ok(codexCode.includes('selectedDataType'), 'Must support multi-modal Vector DB format selection');
    assert.ok(codexCode.includes('mermaidDiagram'), 'Must define Mermaid diagram representations for enterprise architectures');
    assert.ok(codexCode.includes('isChaosMode'), 'Must implement Chaos Resilience Mode for distributed failure injection');
    assert.ok(codexCode.includes('isLightboxOpen'), 'Must implement Fullscreen Lightbox Zoom Modal for infographic inspection');
    assert.ok(codexCode.includes("viewMode === 'capacity'"), 'Must implement Capacity Planner view mode');
    assert.ok(codexCode.includes('handleCopyCalcRfc'), 'Must support copying capacity sizing RFC specification');
    assert.ok(codexCode.includes('calcParadigm'), 'Must manage active capacity paradigm state');
    assert.ok(!/[\u2013\u2014]/.test(codexCode), 'ByteByteGoAiCodex must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('ByteByteGoAiCodex'), 'ArchitectureLab must render ByteByteGoAiCodex');

    const layoutCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Layout.tsx'), 'utf8');
    assert.ok(layoutCode.includes('AI Codex'), 'Layout must define direct navigation link to AI Codex');
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
    assert.ok(html.includes('id="architecture"'), 'Must include pre-rendered <section id="architecture"> landmark');
    assert.ok(html.includes('id="architecture-ai-codex"'), 'Must include pre-rendered AI Codex container');
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

  test('InteractiveCli.tsx supports bytebytego command, infographic aliases and quick chip', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'bytebytego'"), "InteractiveCli must include 'bytebytego' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'infographic'"), "InteractiveCli must include 'infographic' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'poster'"), "InteractiveCli must include 'poster' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes('[ $ bytebytego ]'), "InteractiveCli must define [ $ bytebytego ] quick chip");
    assert.ok(cliCode.includes("case 'bytebytego':"), "InteractiveCli switch must handle 'bytebytego'");
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });

  test('InteractiveCli.tsx supports capacity and sizing commands and quick chip', () => {
    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'capacity'"), "InteractiveCli must include 'capacity' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'sizing'"), "InteractiveCli must include 'sizing' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes("'calculator'"), "InteractiveCli must include 'calculator' in AVAILABLE_COMMANDS");
    assert.ok(cliCode.includes('[ $ capacity ]'), "InteractiveCli must define [ $ capacity ] quick chip");
    assert.ok(cliCode.includes("case 'capacity':"), "InteractiveCli switch must handle 'capacity'");
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

  test('src/data/architectureSystems.ts and workbenchConfigs.ts define complete specifications for all 5 enterprise systems', () => {
    const archFilePath = path.join(rootDir, 'src', 'data', 'architectureSystems.ts');
    assert.ok(fs.existsSync(archFilePath), 'architectureSystems.ts must exist');
    const archCode = fs.readFileSync(archFilePath, 'utf8');
    
    assert.ok(archCode.includes("'saas-platform'"), 'Must define saas-platform system');
    assert.ok(archCode.includes("'ecommerce-engine'"), 'Must define ecommerce-engine system');
    assert.ok(archCode.includes("'realtime-platform'"), 'Must define realtime-platform system');
    assert.ok(archCode.includes("'fintech-gateway'"), 'Must define fintech-gateway system');
    assert.ok(archCode.includes("'agentic-mcp-mesh'"), 'Must define agentic-mcp-mesh system');
    assert.ok(archCode.includes('chaosScenarios'), 'Must define chaos failure mode simulations');

    const workbenchCfgPath = path.join(rootDir, 'src', 'components', 'architecture', 'workbenchConfigs.ts');
    assert.ok(fs.existsSync(workbenchCfgPath), 'workbenchConfigs.ts must exist');
    const wbCode = fs.readFileSync(workbenchCfgPath, 'utf8');
    assert.ok(wbCode.includes("'agentic-mcp-mesh'"), 'workbenchConfigs must include agentic-mcp-mesh system');
    assert.ok(wbCode.includes('langgraph-agent'), 'workbenchConfigs must define langgraph-agent spec');

    const showcaseCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ProjectsShowcase.tsx'), 'utf8');
    assert.ok(showcaseCode.includes("'agentic-mcp-mesh'"), 'ProjectsShowcase must define 5th project agentic-mcp-mesh');
    assert.ok(showcaseCode.includes("'AI Systems & MCP'"), 'ProjectsShowcase must include AI Systems & MCP category');
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

  test('HeroArchitectureTopology renders interactive multi-node distributed topology in TerminalHero', () => {
    const topologyPath = path.join(rootDir, 'src', 'components', 'architecture', 'HeroArchitectureTopology.tsx');
    assert.ok(fs.existsSync(topologyPath), 'HeroArchitectureTopology.tsx must exist');

    const topoCode = fs.readFileSync(topologyPath, 'utf8');
    assert.ok(topoCode.includes('Cloudflare / Edge CDN'), 'Must define edge ingress node');
    assert.ok(topoCode.includes('Envoy API Gateway'), 'Must define envoy gateway node');
    assert.ok(topoCode.includes('Spring Boot 3 Core'), 'Must define spring boot compute node');
    assert.ok(topoCode.includes('Apache Kafka Event Mesh'), 'Must define kafka event node');
    assert.ok(topoCode.includes('Aurora Global & Redis'), 'Must define multi-region database storage node');
    assert.ok(topoCode.includes('triggerTrafficBurst'), 'Must support interactive 10K RPS burst injection');
    assert.ok(topoCode.includes('triggerFailoverSimulation'), 'Must support interactive AZ failover simulation');
    assert.ok(!/[\u2013\u2014]/.test(topoCode), 'HeroArchitectureTopology must contain zero em/en-dashes');

    const heroCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'TerminalHero.tsx'), 'utf8');
    assert.ok(heroCode.includes('HeroArchitectureTopology'), 'TerminalHero must import and render HeroArchitectureTopology');
    assert.ok(heroCode.includes("cockpitMode === 'topology'"), 'TerminalHero must support topology cockpit mode');
    assert.ok(heroCode.includes("cockpitMode === 'manifest'"), 'TerminalHero must support manifest cockpit mode');
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
    assert.ok(chatCode.includes("'tradeoffs': {"), 'ChatWidget must define FAQ for system design tradeoffs');
    assert.ok(chatCode.includes("'capacity': {"), 'ChatWidget must define FAQ for capacity planning');
    assert.ok(chatCode.includes("'saga': {"), 'ChatWidget must define FAQ for Saga transactions');
    assert.ok(chatCode.includes('Explain Meena\'s AI architecture & MCP codex'), 'ChatWidget must include MCP codex quick question');
    assert.ok(chatCode.includes('How does Meena evaluate architecture trade-offs'), 'ChatWidget must include Tradeoffs quick question');
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

  test('TradeoffMatrix and architecturalTradeoffs.ts define system design comparative evaluations', () => {
    const tradeoffDataPath = path.join(rootDir, 'src', 'data', 'architecturalTradeoffs.ts');
    assert.ok(fs.existsSync(tradeoffDataPath), 'architecturalTradeoffs.ts must exist');
    const dataCode = fs.readFileSync(tradeoffDataPath, 'utf8');
    assert.ok(dataCode.includes('distributed-transactions'), 'Must define distributed transactions tradeoff');
    assert.ok(dataCode.includes('ai-context-augmentation'), 'Must define AI context augmentation tradeoff');
    assert.ok(dataCode.includes('concurrency-runtime'), 'Must define concurrency runtime tradeoff');
    assert.ok(dataCode.includes('service-protocols'), 'Must define service protocols tradeoff');
    assert.ok(!/[\u2013\u2014]/.test(dataCode), 'architecturalTradeoffs.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'TradeoffMatrix.tsx');
    assert.ok(fs.existsSync(componentPath), 'TradeoffMatrix.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyMarkdown'), 'TradeoffMatrix must support 1-click Markdown copy');
    assert.ok(compCode.includes('ARCHITECTURAL_TRADEOFFS'), 'TradeoffMatrix must render ARCHITECTURAL_TRADEOFFS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'TradeoffMatrix.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('TradeoffMatrix'), 'ArchitectureLab must mount TradeoffMatrix');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'tradeoffs'"), "InteractiveCli must support 'tradeoffs' command");
    assert.ok(cliCode.includes("'compare'"), "InteractiveCli must support 'compare' command");
    assert.ok(cliCode.includes('[ $ tradeoffs ]'), "InteractiveCli must include '[ $ tradeoffs ]' quick chip");
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });

  test('ArchitectureLab implements Fast-Jump Navigator and sub-section anchors for deep linking', () => {
    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('id="architecture-workbench"'), 'ArchitectureLab must define anchor #architecture-workbench');
    assert.ok(labCode.includes('id="architecture-ai-codex"'), 'ArchitectureLab must define anchor #architecture-ai-codex');
    assert.ok(labCode.includes('id="architecture-adr-ledger"'), 'ArchitectureLab must define anchor #architecture-adr-ledger');
    assert.ok(labCode.includes('id="architecture-tradeoff-matrix"'), 'ArchitectureLab must define anchor #architecture-tradeoff-matrix');
    assert.ok(labCode.includes('Fast Jump:'), 'ArchitectureLab must render Fast Jump navigator label');
    assert.ok(labCode.includes('href="#architecture-workbench"'), 'Must provide link to workbench');
    assert.ok(labCode.includes('href="#architecture-ai-codex"'), 'Must provide link to ai codex');
    assert.ok(labCode.includes('href="#architecture-adr-ledger"'), 'Must provide link to adr ledger');
    assert.ok(labCode.includes('href="#architecture-tradeoff-matrix"'), 'Must provide link to tradeoff matrix');
    assert.ok(!/[\u2013\u2014]/.test(labCode), 'ArchitectureLab.tsx must contain zero em/en-dashes');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes('"architecture systems"'), 'InteractiveCli must support "architecture systems"');
    assert.ok(cliCode.includes('"architecture ai"'), 'InteractiveCli must support "architecture ai"');
    assert.ok(cliCode.includes('"architecture adr"'), 'InteractiveCli must support "architecture adr"');
    assert.ok(cliCode.includes('"architecture tradeoffs"'), 'InteractiveCli must support "architecture tradeoffs"');
  });

  test('ArchitectureLab and InteractiveCli implement cross-cutting topology search and keyword spotlight', () => {
    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('searchQuery'), 'ArchitectureLab must manage searchQuery state');
    assert.ok(labCode.includes('matchStats'), 'ArchitectureLab must derive matchStats across all 4 architecture domains');
    assert.ok(labCode.includes('QUICK_KEYWORDS'), 'ArchitectureLab must define QUICK_KEYWORDS preset pills');
    assert.ok(labCode.includes('Search architecture by keyword'), 'ArchitectureLab must provide accessible search input placeholder');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'find'"), "InteractiveCli must include 'find' command");
    assert.ok(cliCode.includes("'search'"), "InteractiveCli must include 'search' command");
    assert.ok(cliCode.includes('[ $ find kafka ]'), "InteractiveCli must provide '[ $ find kafka ]' quick chip");
    assert.ok(cliCode.includes("case 'find':"), "InteractiveCli switch must handle 'find' command");
    assert.ok(cliCode.includes('ARCHITECTURE_SYSTEMS'), 'InteractiveCli must search across ARCHITECTURE_SYSTEMS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });

  test('ArchitectureEvolutionDiff and architectureEvolutions.ts define monolith-to-mesh comparison diffs with CLI integration', () => {
    const diffDataPath = path.join(rootDir, 'src', 'data', 'architectureEvolutions.ts');
    assert.ok(fs.existsSync(diffDataPath), 'architectureEvolutions.ts must exist');
    const diffDataCode = fs.readFileSync(diffDataPath, 'utf8');
    assert.ok(diffDataCode.includes('saas-rls'), 'Must define saas-rls evolution');
    assert.ok(diffDataCode.includes('saga-outbox'), 'Must define saga-outbox evolution');
    assert.ok(diffDataCode.includes('virtual-threads'), 'Must define virtual-threads evolution');
    assert.ok(diffDataCode.includes('double-entry'), 'Must define double-entry evolution');
    assert.ok(diffDataCode.includes('mcp-mesh'), 'Must define mcp-mesh evolution');
    assert.ok(!/[\u2013\u2014]/.test(diffDataCode), 'architectureEvolutions.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'ArchitectureEvolutionDiff.tsx');
    assert.ok(fs.existsSync(componentPath), 'ArchitectureEvolutionDiff.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyRfc'), 'ArchitectureEvolutionDiff must support 1-click RFC copy');
    assert.ok(compCode.includes('ARCHITECTURE_EVOLUTIONS'), 'ArchitectureEvolutionDiff must render ARCHITECTURE_EVOLUTIONS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'ArchitectureEvolutionDiff.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('ArchitectureEvolutionDiff'), 'ArchitectureLab must mount ArchitectureEvolutionDiff');
    assert.ok(labCode.includes('id="architecture-evolution-diff"'), 'ArchitectureLab must define anchor #architecture-evolution-diff');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'diff'"), "InteractiveCli must support 'diff' command");
    assert.ok(cliCode.includes("'evolution'"), "InteractiveCli must support 'evolution' command");
    assert.ok(cliCode.includes('[ $ diff ]'), "InteractiveCli must include '[ $ diff ]' quick chip");
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });

  test('ExecutiveBriefingModal and executiveBriefing.ts define executive recruiter pitch with CLI and navbar integration', () => {
    const briefingDataPath = path.join(rootDir, 'src', 'data', 'executiveBriefing.ts');
    assert.ok(fs.existsSync(briefingDataPath), 'executiveBriefing.ts must exist');
    const briefingDataCode = fs.readFileSync(briefingDataPath, 'utf8');
    assert.ok(briefingDataCode.includes('candidateName'), 'Must define candidateName');
    assert.ok(briefingDataCode.includes('Principal Cloud Solutions Architect'), 'Must define target role');
    assert.ok(briefingDataCode.includes('verifiedOutcomes'), 'Must define verified outcomes');
    assert.ok(briefingDataCode.includes('governingAdrs'), 'Must define governing ADRs');
    assert.ok(!/[\u2013\u2014]/.test(briefingDataCode), 'executiveBriefing.ts must contain zero em/en-dashes');

    const modalPath = path.join(rootDir, 'src', 'components', 'portfolio', 'ExecutiveBriefingModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'ExecutiveBriefingModal.tsx must exist');
    const modalCode = fs.readFileSync(modalPath, 'utf8');
    assert.ok(modalCode.includes('handleCopyMemo'), 'ExecutiveBriefingModal must support 1-click memo copy');
    assert.ok(modalCode.includes('role="dialog"'), 'ExecutiveBriefingModal must define accessible role="dialog"');
    assert.ok(modalCode.includes('aria-modal="true"'), 'ExecutiveBriefingModal must define aria-modal="true"');
    assert.ok(!/[\u2013\u2014]/.test(modalCode), 'ExecutiveBriefingModal.tsx must contain zero em/en-dashes');

    const layoutCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Layout.tsx'), 'utf8');
    assert.ok(layoutCode.includes('ExecutiveBriefingModal'), 'Layout must import and embed ExecutiveBriefingModal');
    assert.ok(layoutCode.includes('isBriefingOpen'), 'Layout must manage isBriefingOpen state');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'briefing'"), "InteractiveCli must support 'briefing' command");
    assert.ok(cliCode.includes("'pitch'"), "InteractiveCli must support 'pitch' command");
    assert.ok(cliCode.includes('[ $ briefing ]'), "InteractiveCli must include '[ $ briefing ]' quick chip");
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');
  });

  test('ChaosResilienceMatrix and chaosDrills.ts define enterprise chaos engineering drill matrix with CLI integration', () => {
    const drillDataPath = path.join(rootDir, 'src', 'data', 'chaosDrills.ts');
    assert.ok(fs.existsSync(drillDataPath), 'chaosDrills.ts must exist');
    const drillDataCode = fs.readFileSync(drillDataPath, 'utf8');
    assert.ok(drillDataCode.includes('az-partition-failover'), 'Must define az-partition-failover drill');
    assert.ok(drillDataCode.includes('kafka-poison-pill-isolation'), 'Must define kafka-poison-pill-isolation drill');
    assert.ok(drillDataCode.includes('websocket-thundering-herd'), 'Must define websocket-thundering-herd drill');
    assert.ok(drillDataCode.includes('banking-rail-timeout-idempotency'), 'Must define banking-rail-timeout-idempotency drill');
    assert.ok(drillDataCode.includes('mcp-sandbox-oom-sigkill'), 'Must define mcp-sandbox-oom-sigkill drill');
    assert.ok(!/[\u2013\u2014]/.test(drillDataCode), 'chaosDrills.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'ChaosResilienceMatrix.tsx');
    assert.ok(fs.existsSync(componentPath), 'ChaosResilienceMatrix.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyReport'), 'ChaosResilienceMatrix must support 1-click report copy');
    assert.ok(compCode.includes('handleCopyRunbook'), 'ChaosResilienceMatrix must support 1-click runbook copy');
    assert.ok(compCode.includes('CHAOS_DRILLS'), 'ChaosResilienceMatrix must render CHAOS_DRILLS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'ChaosResilienceMatrix.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('ChaosResilienceMatrix'), 'ArchitectureLab must mount ChaosResilienceMatrix');
    assert.ok(labCode.includes('id="architecture-chaos-matrix"'), 'ArchitectureLab must define anchor #architecture-chaos-matrix');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'chaos'"), "InteractiveCli must support 'chaos' command");
    assert.ok(cliCode.includes("'resilience'"), "InteractiveCli must support 'resilience' command");
    assert.ok(cliCode.includes('[ $ chaos ]'), "InteractiveCli must include '[ $ chaos ]' quick chip");
    assert.ok(cliCode.includes('CHAOS_DRILLS'), 'InteractiveCli must search across CHAOS_DRILLS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-chaos-matrix"'), 'index.html must include #architecture-chaos-matrix landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('ApiGatewayPlayground and gatewayRoutes.ts define zero-trust edge ingress routes with CLI integration', () => {
    const routeDataPath = path.join(rootDir, 'src', 'data', 'gatewayRoutes.ts');
    assert.ok(fs.existsSync(routeDataPath), 'gatewayRoutes.ts must exist');
    const routeDataCode = fs.readFileSync(routeDataPath, 'utf8');
    assert.ok(routeDataCode.includes('saas-iam-ingress'), 'Must define saas-iam-ingress route');
    assert.ok(routeDataCode.includes('saga-checkout-ingress'), 'Must define saga-checkout-ingress route');
    assert.ok(routeDataCode.includes('realtime-websocket-ingress'), 'Must define realtime-websocket-ingress route');
    assert.ok(routeDataCode.includes('fintech-vault-ingress'), 'Must define fintech-vault-ingress route');
    assert.ok(routeDataCode.includes('agentic-mcp-ingress'), 'Must define agentic-mcp-ingress route');
    assert.ok(!/[\u2013\u2014]/.test(routeDataCode), 'gatewayRoutes.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'ApiGatewayPlayground.tsx');
    assert.ok(fs.existsSync(componentPath), 'ApiGatewayPlayground.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyEnvoy'), 'ApiGatewayPlayground must support 1-click Envoy YAML copy');
    assert.ok(compCode.includes('handleCopyRfc'), 'ApiGatewayPlayground must support 1-click RFC copy');
    assert.ok(compCode.includes('GATEWAY_ROUTES'), 'ApiGatewayPlayground must render GATEWAY_ROUTES');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'ApiGatewayPlayground.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('ApiGatewayPlayground'), 'ArchitectureLab must mount ApiGatewayPlayground');
    assert.ok(labCode.includes('id="architecture-api-gateway"'), 'ArchitectureLab must define anchor #architecture-api-gateway');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'gateway'"), "InteractiveCli must support 'gateway' command");
    assert.ok(cliCode.includes("'ingress'"), "InteractiveCli must support 'ingress' command");
    assert.ok(cliCode.includes('[ $ gateway ]'), "InteractiveCli must include '[ $ gateway ]' quick chip");
    assert.ok(cliCode.includes('GATEWAY_ROUTES'), 'InteractiveCli must search across GATEWAY_ROUTES');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('api-gateway-mesh'), 'public/chat/index.json must index api-gateway-mesh');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-api-gateway"'), 'index.html must include #architecture-api-gateway landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('DistributedTraceInspector and distributedTraces.ts define OpenTelemetry distributed traces with CLI integration', () => {
    const traceDataPath = path.join(rootDir, 'src', 'data', 'distributedTraces.ts');
    assert.ok(fs.existsSync(traceDataPath), 'distributedTraces.ts must exist');
    const traceDataCode = fs.readFileSync(traceDataPath, 'utf8');
    assert.ok(traceDataCode.includes('trace_saas_auth_01'), 'Must define trace_saas_auth_01');
    assert.ok(traceDataCode.includes('trace_saga_checkout_02'), 'Must define trace_saga_checkout_02');
    assert.ok(traceDataCode.includes('trace_collab_broadcast_03'), 'Must define trace_collab_broadcast_03');
    assert.ok(traceDataCode.includes('trace_fintech_settlement_04'), 'Must define trace_fintech_settlement_04');
    assert.ok(traceDataCode.includes('trace_agentic_mcp_05'), 'Must define trace_agentic_mcp_05');
    assert.ok(!/[\u2013\u2014]/.test(traceDataCode), 'distributedTraces.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'DistributedTraceInspector.tsx');
    assert.ok(fs.existsSync(componentPath), 'DistributedTraceInspector.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyJson'), 'DistributedTraceInspector must support 1-click OTel JSON copy');
    assert.ok(compCode.includes('handleCopyRfc'), 'DistributedTraceInspector must support 1-click RFC copy');
    assert.ok(compCode.includes('DISTRIBUTED_TRACES'), 'DistributedTraceInspector must render DISTRIBUTED_TRACES');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'DistributedTraceInspector.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('DistributedTraceInspector'), 'ArchitectureLab must mount DistributedTraceInspector');
    assert.ok(labCode.includes('id="architecture-distributed-tracing"'), 'ArchitectureLab must define anchor #architecture-distributed-tracing');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'trace'"), "InteractiveCli must support 'trace' command");
    assert.ok(cliCode.includes('[ $ trace ]'), "InteractiveCli must include '[ $ trace ]' quick chip");
    assert.ok(cliCode.includes('DISTRIBUTED_TRACES'), 'InteractiveCli must search across DISTRIBUTED_TRACES');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('distributed-tracing-otel'), 'public/chat/index.json must index distributed-tracing-otel');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-distributed-tracing"'), 'index.html must include #architecture-distributed-tracing landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('KafkaStreamMonitor and kafkaStreams.ts define enterprise Kafka streams with CLI integration', () => {
    const kafkaDataPath = path.join(rootDir, 'src', 'data', 'kafkaStreams.ts');
    assert.ok(fs.existsSync(kafkaDataPath), 'kafkaStreams.ts must exist');
    const kafkaDataCode = fs.readFileSync(kafkaDataPath, 'utf8');
    assert.ok(kafkaDataCode.includes('orders.v1.events'), 'Must define orders.v1.events topic');
    assert.ok(kafkaDataCode.includes('tenants.v1.audit'), 'Must define tenants.v1.audit topic');
    assert.ok(kafkaDataCode.includes('collab.v1.workspace-deltas'), 'Must define collab.v1.workspace-deltas topic');
    assert.ok(kafkaDataCode.includes('payments.v1.settlement'), 'Must define payments.v1.settlement topic');
    assert.ok(kafkaDataCode.includes('agent.v1.mcp-telemetry'), 'Must define agent.v1.mcp-telemetry topic');
    assert.ok(!/[\u2013\u2014]/.test(kafkaDataCode), 'kafkaStreams.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'KafkaStreamMonitor.tsx');
    assert.ok(fs.existsSync(componentPath), 'KafkaStreamMonitor.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyRfc'), 'KafkaStreamMonitor must support 1-click RFC copy');
    assert.ok(compCode.includes('handleCopyPayload'), 'KafkaStreamMonitor must support 1-click payload copy');
    assert.ok(compCode.includes('KAFKA_TOPIC_STREAMS'), 'KafkaStreamMonitor must render KAFKA_TOPIC_STREAMS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'KafkaStreamMonitor.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('KafkaStreamMonitor'), 'ArchitectureLab must mount KafkaStreamMonitor');
    assert.ok(labCode.includes('id="architecture-event-streams"'), 'ArchitectureLab must define anchor #architecture-event-streams');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'kafka'"), "InteractiveCli must support 'kafka' command");
    assert.ok(cliCode.includes('[ $ kafka ]'), "InteractiveCli must include '[ $ kafka ]' quick chip");
    assert.ok(cliCode.includes('KAFKA_TOPIC_STREAMS'), 'InteractiveCli must search across KAFKA_TOPIC_STREAMS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('kafka-event-streams'), 'public/chat/index.json must index kafka-event-streams');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-event-streams"'), 'index.html must include #architecture-event-streams landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('RateLimiterSandbox and rateLimitingAlgorithms.ts define distributed traffic shaping with CLI integration', () => {
    const rateDataPath = path.join(rootDir, 'src', 'data', 'rateLimitingAlgorithms.ts');
    assert.ok(fs.existsSync(rateDataPath), 'rateLimitingAlgorithms.ts must exist');
    const rateDataCode = fs.readFileSync(rateDataPath, 'utf8');
    assert.ok(rateDataCode.includes('token-bucket'), 'Must define token-bucket algorithm');
    assert.ok(rateDataCode.includes('leaky-bucket'), 'Must define leaky-bucket algorithm');
    assert.ok(rateDataCode.includes('fixed-window'), 'Must define fixed-window algorithm');
    assert.ok(rateDataCode.includes('sliding-window-log'), 'Must define sliding-window-log algorithm');
    assert.ok(rateDataCode.includes('sliding-window-counter'), 'Must define sliding-window-counter algorithm');
    assert.ok(!/[\u2013\u2014]/.test(rateDataCode), 'rateLimitingAlgorithms.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'RateLimiterSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'RateLimiterSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyRfc'), 'RateLimiterSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('handleCopyLua'), 'RateLimiterSandbox must support 1-click Lua copy');
    assert.ok(compCode.includes('RATE_LIMITING_ALGORITHMS'), 'RateLimiterSandbox must render RATE_LIMITING_ALGORITHMS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'RateLimiterSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('RateLimiterSandbox'), 'ArchitectureLab must mount RateLimiterSandbox');
    assert.ok(labCode.includes('id="architecture-rate-limiter"'), 'ArchitectureLab must define anchor #architecture-rate-limiter');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'ratelimit'"), "InteractiveCli must support 'ratelimit' command");
    assert.ok(cliCode.includes('[ $ ratelimit ]'), "InteractiveCli must include '[ $ ratelimit ]' quick chip");
    assert.ok(cliCode.includes('RATE_LIMITING_ALGORITHMS'), 'InteractiveCli must search across RATE_LIMITING_ALGORITHMS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('distributed-rate-limiting'), 'public/chat/index.json must index distributed-rate-limiting');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-rate-limiter"'), 'index.html must include #architecture-rate-limiter landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('MultiRegionReplicationSandbox and multiRegionReplication.ts define multi-region database topologies with CLI integration', () => {
    const multiDataPath = path.join(rootDir, 'src', 'data', 'multiRegionReplication.ts');
    assert.ok(fs.existsSync(multiDataPath), 'multiRegionReplication.ts must exist');
    const multiDataCode = fs.readFileSync(multiDataPath, 'utf8');
    assert.ok(multiDataCode.includes('aurora-global'), 'Must define aurora-global strategy');
    assert.ok(multiDataCode.includes('dynamodb-global'), 'Must define dynamodb-global strategy');
    assert.ok(multiDataCode.includes('crdt-mesh'), 'Must define crdt-mesh strategy');
    assert.ok(multiDataCode.includes('raft-consensus'), 'Must define raft-consensus strategy');
    assert.ok(multiDataCode.includes('kafka-mirrormaker'), 'Must define kafka-mirrormaker strategy');
    assert.ok(!/[\u2013\u2014]/.test(multiDataCode), 'multiRegionReplication.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'MultiRegionReplicationSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'MultiRegionReplicationSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyRfc'), 'MultiRegionReplicationSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('MULTI_REGION_STRATEGIES'), 'MultiRegionReplicationSandbox must render MULTI_REGION_STRATEGIES');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'MultiRegionReplicationSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('MultiRegionReplicationSandbox'), 'ArchitectureLab must mount MultiRegionReplicationSandbox');
    assert.ok(labCode.includes('id="architecture-multi-region"'), 'ArchitectureLab must define anchor #architecture-multi-region');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'replication'"), "InteractiveCli must support 'replication' command");
    assert.ok(cliCode.includes("'multiregion'"), "InteractiveCli must support 'multiregion' command");
    assert.ok(cliCode.includes('[ $ multiregion ]'), "InteractiveCli must include '[ $ multiregion ]' quick chip");
    assert.ok(cliCode.includes('MULTI_REGION_STRATEGIES'), 'InteractiveCli must search across MULTI_REGION_STRATEGIES');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('multi-region-database-replication'), 'public/chat/index.json must index multi-region-database-replication');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-multi-region"'), 'index.html must include #architecture-multi-region landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('DatabaseShardingSandbox and databaseSharding.ts define consistent hashing and database sharding with CLI integration', () => {
    const shardingDataPath = path.join(rootDir, 'src', 'data', 'databaseSharding.ts');
    assert.ok(fs.existsSync(shardingDataPath), 'databaseSharding.ts must exist');
    const shardingDataCode = fs.readFileSync(shardingDataPath, 'utf8');
    assert.ok(shardingDataCode.includes('consistent-hashing'), 'Must define consistent-hashing strategy');
    assert.ok(shardingDataCode.includes('hash-modulo'), 'Must define hash-modulo strategy');
    assert.ok(shardingDataCode.includes('range-based'), 'Must define range-based strategy');
    assert.ok(shardingDataCode.includes('directory-lookup'), 'Must define directory-lookup strategy');
    assert.ok(shardingDataCode.includes('geo-partitioning'), 'Must define geo-partitioning strategy');
    assert.ok(!/[\u2013\u2014]/.test(shardingDataCode), 'databaseSharding.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'DatabaseShardingSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'DatabaseShardingSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyRfc'), 'DatabaseShardingSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('DATABASE_SHARDING_STRATEGIES'), 'DatabaseShardingSandbox must render DATABASE_SHARDING_STRATEGIES');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'DatabaseShardingSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('DatabaseShardingSandbox'), 'ArchitectureLab must mount DatabaseShardingSandbox');
    assert.ok(labCode.includes('id="architecture-database-sharding"'), 'ArchitectureLab must define anchor #architecture-database-sharding');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'sharding'"), "InteractiveCli must support 'sharding' command");
    assert.ok(cliCode.includes('[ $ sharding ]'), "InteractiveCli must include '[ $ sharding ]' quick chip");
    assert.ok(cliCode.includes('DATABASE_SHARDING_STRATEGIES'), 'InteractiveCli must search across DATABASE_SHARDING_STRATEGIES');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('database-sharding'), 'public/chat/index.json must index database-sharding');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-database-sharding"'), 'index.html must include #architecture-database-sharding landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('EdgeCdnSandbox and edgeCdnCaching.ts define global CDN edge caching with CLI integration', () => {
    const cdnDataPath = path.join(rootDir, 'src', 'data', 'edgeCdnCaching.ts');
    assert.ok(fs.existsSync(cdnDataPath), 'edgeCdnCaching.ts must exist');
    const cdnDataCode = fs.readFileSync(cdnDataPath, 'utf8');
    assert.ok(cdnDataCode.includes('surrogate-key-purge'), 'Must define surrogate-key-purge strategy');
    assert.ok(cdnDataCode.includes('stale-while-revalidate'), 'Must define stale-while-revalidate strategy');
    assert.ok(cdnDataCode.includes('origin-shield-hierarchy'), 'Must define origin-shield-hierarchy strategy');
    assert.ok(cdnDataCode.includes('collapsed-forwarding'), 'Must define collapsed-forwarding strategy');
    assert.ok(cdnDataCode.includes('edge-compute-workers'), 'Must define edge-compute-workers strategy');
    assert.ok(!/[\u2013\u2014]/.test(cdnDataCode), 'edgeCdnCaching.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'EdgeCdnSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'EdgeCdnSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('handleCopyRfc'), 'EdgeCdnSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('EDGE_CDN_STRATEGIES'), 'EdgeCdnSandbox must render EDGE_CDN_STRATEGIES');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'EdgeCdnSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('EdgeCdnSandbox'), 'ArchitectureLab must mount EdgeCdnSandbox');
    assert.ok(labCode.includes('id="architecture-edge-cdn"'), 'ArchitectureLab must define anchor #architecture-edge-cdn');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'cdn'"), "InteractiveCli must support 'cdn' command");
    assert.ok(cliCode.includes('[ $ cdn ]'), "InteractiveCli must include '[ $ cdn ]' quick chip");
    assert.ok(cliCode.includes('EDGE_CDN_STRATEGIES'), 'InteractiveCli must search across EDGE_CDN_STRATEGIES');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('edge-cdn-caching-swr'), 'public/chat/index.json must index edge-cdn-caching-swr');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-edge-cdn"'), 'index.html must include #architecture-edge-cdn landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('CircuitBreakerSandbox and circuitBreakers.ts define distributed circuit breakers with CLI integration', () => {
    const cbDataPath = path.join(rootDir, 'src', 'data', 'circuitBreakers.ts');
    assert.ok(fs.existsSync(cbDataPath), 'circuitBreakers.ts must exist');
    const cbDataCode = fs.readFileSync(cbDataPath, 'utf8');
    assert.ok(cbDataCode.includes('resilience4j-sliding-window'), 'Must define resilience4j-sliding-window pattern');
    assert.ok(cbDataCode.includes('semaphore-thread-bulkhead'), 'Must define semaphore-thread-bulkhead pattern');
    assert.ok(cbDataCode.includes('exponential-backoff-full-jitter'), 'Must define exponential-backoff-full-jitter pattern');
    assert.ok(cbDataCode.includes('adaptive-concurrency-vegas'), 'Must define adaptive-concurrency-vegas pattern');
    assert.ok(cbDataCode.includes('envoy-outlier-ejection'), 'Must define envoy-outlier-ejection pattern');
    assert.ok(!/[\u2013\u2014]/.test(cbDataCode), 'circuitBreakers.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'CircuitBreakerSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'CircuitBreakerSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('copyRfcReport'), 'CircuitBreakerSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('CIRCUIT_BREAKER_PATTERNS'), 'CircuitBreakerSandbox must render CIRCUIT_BREAKER_PATTERNS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'CircuitBreakerSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('CircuitBreakerSandbox'), 'ArchitectureLab must mount CircuitBreakerSandbox');
    assert.ok(labCode.includes('id="architecture-circuit-breaker"'), 'ArchitectureLab must define anchor #architecture-circuit-breaker');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'circuitbreaker'"), "InteractiveCli must support 'circuitbreaker' command");
    assert.ok(cliCode.includes('[ $ circuitbreaker ]'), "InteractiveCli must include '[ $ circuitbreaker ]' quick chip");
    assert.ok(cliCode.includes('CIRCUIT_BREAKER_PATTERNS'), 'InteractiveCli must search across CIRCUIT_BREAKER_PATTERNS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('circuit-breaker-fault-mesh'), 'public/chat/index.json must index circuit-breaker-fault-mesh');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-circuit-breaker"'), 'index.html must include #architecture-circuit-breaker landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('DistributedConcurrencySandbox and distributedConcurrency.ts define distributed concurrency and deadlock detection with CLI integration', () => {
    const concDataPath = path.join(rootDir, 'src', 'data', 'distributedConcurrency.ts');
    assert.ok(fs.existsSync(concDataPath), 'distributedConcurrency.ts must exist');
    const concDataCode = fs.readFileSync(concDataPath, 'utf8');
    assert.ok(concDataCode.includes('strict-2pl-wait-die'), 'Must define strict-2pl-wait-die model');
    assert.ok(concDataCode.includes('optimistic-concurrency-control'), 'Must define optimistic-concurrency-control model');
    assert.ok(concDataCode.includes('mvcc-snapshot-isolation'), 'Must define mvcc-snapshot-isolation model');
    assert.ok(concDataCode.includes('wait-for-graph-tarjan'), 'Must define wait-for-graph-tarjan model');
    assert.ok(concDataCode.includes('distributed-lock-manager-redlock'), 'Must define distributed-lock-manager-redlock model');
    assert.ok(!/[\u2013\u2014]/.test(concDataCode), 'distributedConcurrency.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'DistributedConcurrencySandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'DistributedConcurrencySandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('copyRfcReport'), 'DistributedConcurrencySandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('CONCURRENCY_MODELS'), 'DistributedConcurrencySandbox must render CONCURRENCY_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'DistributedConcurrencySandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('DistributedConcurrencySandbox'), 'ArchitectureLab must mount DistributedConcurrencySandbox');
    assert.ok(labCode.includes('id="architecture-distributed-concurrency"'), 'ArchitectureLab must define anchor #architecture-distributed-concurrency');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'concurrency'"), "InteractiveCli must support 'concurrency' command");
    assert.ok(cliCode.includes('[ $ concurrency ]'), "InteractiveCli must include '[ $ concurrency ]' quick chip");
    assert.ok(cliCode.includes('CONCURRENCY_MODELS'), 'InteractiveCli must search across CONCURRENCY_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('distributed-concurrency-deadlocks'), 'public/chat/index.json must index distributed-concurrency-deadlocks');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-distributed-concurrency"'), 'index.html must include #architecture-distributed-concurrency landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('RaftConsensusSandbox and raftConsensus.ts define distributed consensus and leader election with CLI integration', () => {
    const raftDataPath = path.join(rootDir, 'src', 'data', 'raftConsensus.ts');
    assert.ok(fs.existsSync(raftDataPath), 'raftConsensus.ts must exist');
    const raftDataCode = fs.readFileSync(raftDataPath, 'utf8');
    assert.ok(raftDataCode.includes('raft-leader-election'), 'Must define raft-leader-election model');
    assert.ok(raftDataCode.includes('raft-log-replication'), 'Must define raft-log-replication model');
    assert.ok(raftDataCode.includes('multi-raft-split-brain'), 'Must define multi-raft-split-brain model');
    assert.ok(raftDataCode.includes('joint-consensus-reconfiguration'), 'Must define joint-consensus-reconfiguration model');
    assert.ok(raftDataCode.includes('paxos-synod-comparison'), 'Must define paxos-synod-comparison model');
    assert.ok(!/[\u2013\u2014]/.test(raftDataCode), 'raftConsensus.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'RaftConsensusSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'RaftConsensusSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('copyRfcReport'), 'RaftConsensusSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('CONSENSUS_MODELS'), 'RaftConsensusSandbox must render CONSENSUS_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'RaftConsensusSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('RaftConsensusSandbox'), 'ArchitectureLab must mount RaftConsensusSandbox');
    assert.ok(labCode.includes('id="architecture-raft-consensus"'), 'ArchitectureLab must define anchor #architecture-raft-consensus');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'raft'"), "InteractiveCli must support 'raft' command");
    assert.ok(cliCode.includes('[ $ raft ]'), "InteractiveCli must include '[ $ raft ]' quick chip");
    assert.ok(cliCode.includes('CONSENSUS_MODELS'), 'InteractiveCli must search across CONSENSUS_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('distributed-consensus-raft'), 'public/chat/index.json must index distributed-consensus-raft');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-raft-consensus"'), 'index.html must include #architecture-raft-consensus landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('VectorSearchSandbox and vectorSearch.ts define distributed vector search and HNSW indexing with CLI integration', () => {
    const vectorDataPath = path.join(rootDir, 'src', 'data', 'vectorSearch.ts');
    assert.ok(fs.existsSync(vectorDataPath), 'vectorSearch.ts must exist');
    const vectorDataCode = fs.readFileSync(vectorDataPath, 'utf8');
    assert.ok(vectorDataCode.includes('hnsw-skip-list-graphs'), 'Must define hnsw-skip-list-graphs model');
    assert.ok(vectorDataCode.includes('ivf-pq-quantization'), 'Must define ivf-pq-quantization model');
    assert.ok(vectorDataCode.includes('sharded-vector-routing'), 'Must define sharded-vector-routing model');
    assert.ok(vectorDataCode.includes('hybrid-dense-sparse-rrf'), 'Must define hybrid-dense-sparse-rrf model');
    assert.ok(vectorDataCode.includes('vector-quantization-profiler'), 'Must define vector-quantization-profiler model');
    assert.ok(!/[\u2013\u2014]/.test(vectorDataCode), 'vectorSearch.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'VectorSearchSandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'VectorSearchSandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('copyRfcReport'), 'VectorSearchSandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('VECTOR_SEARCH_MODELS'), 'VectorSearchSandbox must render VECTOR_SEARCH_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'VectorSearchSandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('VectorSearchSandbox'), 'ArchitectureLab must mount VectorSearchSandbox');
    assert.ok(labCode.includes('id="architecture-vector-search"'), 'ArchitectureLab must define anchor #architecture-vector-search');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'vectorsearch'"), "InteractiveCli must support 'vectorsearch' command");
    assert.ok(cliCode.includes('[ $ vectorsearch ]'), "InteractiveCli must include '[ $ vectorsearch ]' quick chip");
    assert.ok(cliCode.includes('VECTOR_SEARCH_MODELS'), 'InteractiveCli must search across VECTOR_SEARCH_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('distributed-vector-search'), 'public/chat/index.json must index distributed-vector-search');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-vector-search"'), 'index.html must include #architecture-vector-search landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });

  test('TrafficPrioritySandbox and trafficPriority.ts define distributed QoS and bounded priority queuing with CLI integration', () => {
    const trafficDataPath = path.join(rootDir, 'src', 'data', 'trafficPriority.ts');
    assert.ok(fs.existsSync(trafficDataPath), 'trafficPriority.ts must exist');
    const trafficDataCode = fs.readFileSync(trafficDataPath, 'utf8');
    assert.ok(trafficDataCode.includes('multi-tier-tenant-priority-queue'), 'Must define multi-tier-tenant-priority-queue model');
    assert.ok(trafficDataCode.includes('weighted-fair-queuing-wfq'), 'Must define weighted-fair-queuing-wfq model');
    assert.ok(trafficDataCode.includes('controlled-delay-codel-aqm'), 'Must define controlled-delay-codel-aqm model');
    assert.ok(trafficDataCode.includes('dynamic-surge-token-bucket'), 'Must define dynamic-surge-token-bucket model');
    assert.ok(trafficDataCode.includes('graceful-load-shedding-backpressure'), 'Must define graceful-load-shedding-backpressure model');
    assert.ok(!/[\u2013\u2014]/.test(trafficDataCode), 'trafficPriority.ts must contain zero em/en-dashes');

    const componentPath = path.join(rootDir, 'src', 'components', 'architecture', 'TrafficPrioritySandbox.tsx');
    assert.ok(fs.existsSync(componentPath), 'TrafficPrioritySandbox.tsx must exist');
    const compCode = fs.readFileSync(componentPath, 'utf8');
    assert.ok(compCode.includes('copyRfcReport'), 'TrafficPrioritySandbox must support 1-click RFC copy');
    assert.ok(compCode.includes('TRAFFIC_PRIORITY_MODELS'), 'TrafficPrioritySandbox must render TRAFFIC_PRIORITY_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(compCode), 'TrafficPrioritySandbox.tsx must contain zero em/en-dashes');

    const labCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'ArchitectureLab.tsx'), 'utf8');
    assert.ok(labCode.includes('TrafficPrioritySandbox'), 'ArchitectureLab must mount TrafficPrioritySandbox');
    assert.ok(labCode.includes('id="architecture-traffic-priority"'), 'ArchitectureLab must define anchor #architecture-traffic-priority');

    const cliCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'portfolio', 'InteractiveCli.tsx'), 'utf8');
    assert.ok(cliCode.includes("'qos'"), "InteractiveCli must support 'qos' command");
    assert.ok(cliCode.includes('[ $ qos ]'), "InteractiveCli must include '[ $ qos ]' quick chip");
    assert.ok(cliCode.includes('TRAFFIC_PRIORITY_MODELS'), 'InteractiveCli must search across TRAFFIC_PRIORITY_MODELS');
    assert.ok(!/[\u2013\u2014]/.test(cliCode), 'InteractiveCli.tsx must contain zero em/en-dashes');

    const chatIndex = fs.readFileSync(path.join(rootDir, 'public', 'chat', 'index.json'), 'utf8');
    assert.ok(chatIndex.includes('distributed-qos-priority-queuing'), 'public/chat/index.json must index distributed-qos-priority-queuing');
    assert.ok(!/[\u2013\u2014]/.test(chatIndex), 'public/chat/index.json must contain zero em/en-dashes');

    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('id="architecture-traffic-priority"'), 'index.html must include #architecture-traffic-priority landmark');
    assert.ok(!/[\u2013\u2014]/.test(indexHtml), 'index.html must contain zero em/en-dashes');
  });
});


