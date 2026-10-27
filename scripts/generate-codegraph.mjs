import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const memoryDir = path.join(rootDir, '.agents', 'memory');

if (!fs.existsSync(memoryDir)) {
  fs.mkdirSync(memoryDir, { recursive: true });
}

function scanFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFiles(fullPath, fileList);
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = scanFiles(srcDir);
const graph = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  nodes: {},
  edges: [],
  symbolMap: {}
};

for (const file of allFiles) {
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract imports
  const importRegex = /import\s+(?:(?:{[^}]+})|(?:[*\w\s,]+))\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Extract exported symbols (functions, consts, types, interfaces)
  const exportRegex = /export\s+(?:default\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/g;
  const exports = [];
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
    graph.symbolMap[match[1]] = relPath;
  }

  graph.nodes[relPath] = {
    file: relPath,
    imports,
    exports,
    loc: content.split('\n').length
  };

  for (const imp of imports) {
    if (imp.startsWith('.')) {
      const impDir = path.dirname(file);
      let targetPath = path.resolve(impDir, imp).replace(/\\/g, '/');
      let targetRel = path.relative(rootDir, targetPath).replace(/\\/g, '/');
      
      // Resolve common extensions
      for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']) {
        const candidate = targetRel + ext;
        if (graph.nodes[candidate] || fs.existsSync(path.join(rootDir, candidate))) {
          targetRel = candidate;
          break;
        }
      }

      graph.edges.push({
        source: relPath,
        target: targetRel,
        type: 'import'
      });
    }
  }
}

const outPath = path.join(memoryDir, 'CODEGRAPH.json');
fs.writeFileSync(outPath, JSON.stringify(graph, null, 2), 'utf8');

console.log(`[codegraph] Generated codebase intelligence graph: ${Object.keys(graph.nodes).length} files, ${graph.edges.length} dependency edges, ${Object.keys(graph.symbolMap).length} indexed symbols.`);
console.log(`[codegraph] Stored at: ${outPath}`);
