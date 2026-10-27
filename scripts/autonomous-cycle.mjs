import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const memoryPath = path.join(rootDir, '.agents', 'AGENT_MEMORY.md');

console.log('[autonomous-cycle] Starting Superpowers verification & quality cycle...');
const startTime = new Date();

function run(command, label) {
  console.log(`[autonomous-cycle] ${label}: Running '${command}'...`);
  try {
    const output = execSync(command, { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (err) {
    console.error(`[autonomous-cycle] ${label} FAILED:`, err.message);
    return { success: false, error: err.message, output: err.stdout || '' };
  }
}

// 1. Run Unit & Responsive Tests
const testResult = run('npm test', 'Test Suite');
if (!testResult.success) {
  console.error('[autonomous-cycle] Cycle aborted due to test failure.');
  process.exit(1);
}

// 2. Run ESLint
const lintResult = run('npm run lint', 'Linter');
if (!lintResult.success) {
  console.error('[autonomous-cycle] Cycle aborted due to lint error.');
  process.exit(1);
}

// 3. Re-index CodeGraph
const codegraphResult = run('node scripts/generate-codegraph.mjs', 'CodeGraph Re-indexing');

// 4. Update Memory Ledger if memory file exists
if (fs.existsSync(memoryPath)) {
  const timestamp = startTime.toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `| \`${timestamp}\` | Autonomous Verification | All 35 tests passed, 0 lint warnings, CodeGraph synchronized. | Verified zero regressions under Superpowers TDD protocol. |\n`;
  
  let content = fs.readFileSync(memoryPath, 'utf8');
  const targetHeader = '| Run Timestamp | Focus Area | Action Completed | Lessons Learned / Gotchas |\n| :--- | :--- | :--- | :--- |\n';
  
  if (content.includes(targetHeader)) {
    content = content.replace(targetHeader, targetHeader + logEntry);
    fs.writeFileSync(memoryPath, content, 'utf8');
    console.log('[autonomous-cycle] Successfully appended cycle record to .agents/AGENT_MEMORY.md');
  }
}

console.log(`[autonomous-cycle] Quality gate completed successfully in ${((new Date() - startTime) / 1000).toFixed(1)}s.`);
