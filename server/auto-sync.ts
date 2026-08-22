import { getAppConfig } from './app-config.js'
import { hasGarminCredentials } from './app-config.js'
import { runSyncJob } from './sync.js'
import { logger } from './logger.js'

let intervalHandle: ReturnType<typeof setInterval> | null = null

export function restartAutoSyncScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }

  const config = getAppConfig()
  if (!config.autoSyncEnabled || !hasGarminCredentials()) return

  const minutes = Math.max(15, config.autoSyncIntervalMinutes)
  intervalHandle = setInterval(() => {
    void runSyncJob(false, 'auto').catch((error) => {
      logger.warn('Auto-sync failed', error instanceof Error ? error.message : error)
    })
  }, minutes * 60 * 1000)
}

export function scheduleStartupSync() {
  const config = getAppConfig()
  if (!config.autoSyncEnabled || !config.autoSyncOnStartup || !hasGarminCredentials()) {
    return
  }

  setTimeout(() => {
    void runSyncJob(false, 'startup').catch((error) => {
      logger.warn('Startup sync failed', error instanceof Error ? error.message : error)
    })
  }, 3000)
}
