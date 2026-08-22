import { existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const distIndex = path.join(process.cwd(), 'dist', 'index.html')
const forceBuild = process.argv.includes('--force')

function sourceIsNewer() {
  if (!existsSync(distIndex)) return true

  const distTime = statSync(distIndex).mtimeMs
  const srcDirs = ['src', 'server', 'index.html', 'vite.config.ts']
  for (const entry of srcDirs) {
    const full = path.join(process.cwd(), entry)
    if (!existsSync(full)) continue
    if (statSync(full).mtimeMs > distTime) return true
  }
  return false
}

if (forceBuild || sourceIsNewer()) {
  console.log('[garmin-dash] Building frontend…')
  const result = spawnSync('npm', ['run', 'build-only'], {
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
  console.log('[garmin-dash] Build complete.')
}
