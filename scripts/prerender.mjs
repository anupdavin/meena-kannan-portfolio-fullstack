import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distHtmlPath = path.join(rootDir, 'dist', 'index.html');

console.log('[prerender] Auditing build output at:', distHtmlPath);

if (!fs.existsSync(distHtmlPath)) {
  console.error('[prerender] Error: dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const html = fs.readFileSync(distHtmlPath, 'utf8');

// Required landmarks check
const requiredLandmarks = ['<header', '<main', '<section', '<footer'];
for (const landmark of requiredLandmarks) {
  if (!html.includes(landmark)) {
    console.error(`[prerender] Error: Missing required semantic HTML landmark: ${landmark}`);
    process.exit(1);
  }
}

// Required OpenGraph check
const requiredMeta = ['og:title', 'og:description', 'og:image', 'twitter:card', 'favicon.svg'];
for (const meta of requiredMeta) {
  if (!html.includes(meta)) {
    console.error(`[prerender] Error: Missing required SEO / social metadata: ${meta}`);
    process.exit(1);
  }
}

// Verify root is not an empty div
if (html.includes('<div id="root"></div>') || html.includes('<div id="root">\n    </div>')) {
  console.error('[prerender] Error: Found empty <div id="root"> shell! Must contain pre-rendered markup.');
  process.exit(1);
}

console.log('[prerender] Pre-rendering verification succeeded: Semantic landmarks, OG tags, and SSR shell intact.');
