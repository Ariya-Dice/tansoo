/**
 * Build frontend and start production server (Express + SQLite/Supabase).
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, command, args, env = {}) {
  console.log(`\n▶ ${label}...`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('Build', npmCmd, ['run', 'build']);
run('Start server', 'node', ['local-products-api.js'], { NODE_ENV: 'production' });
