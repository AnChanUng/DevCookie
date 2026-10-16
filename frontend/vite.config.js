import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFileSync } from 'node:child_process'
import process from 'node:process'

function deploymentVersion() {
  return {
    name: 'deployment-version',
    generateBundle() {
      let commit = process.env.VERCEL_GIT_COMMIT_SHA
      if (!commit) {
        try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() }
        catch { commit = 'unknown' }
      }
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ commit, builtAt: new Date().toISOString() }) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), deploymentVersion()],
})
