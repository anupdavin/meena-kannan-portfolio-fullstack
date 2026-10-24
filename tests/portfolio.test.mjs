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
    
    const content = JSON.parse(fs.readFileSync(chatIndexPath, 'utf8'));
    assert.ok(Array.isArray(content), 'Chat knowledge base should be an array');
    assert.ok(content.length >= 5, 'Knowledge base should have multiple entries');
    
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
