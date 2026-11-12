import { buildApp } from './app.js'

export async function startServer(): Promise<void> {
  const app = await buildApp()
  const port = Number(process.env.PORT ?? 4000)
  const host = process.env.HOST ?? '0.0.0.0'

  const address = await app.listen({ host, port })
  app.log.info({ address }, 'Nexo Chat API ready')

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) {
      return
    }

    isShuttingDown = true
    app.log.warn({ signal }, 'shutting down Nexo Chat API')

    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

let isShuttingDown = false

startServer().catch((error: unknown) => {
  console.error('Failed to start Nexo Chat API', error)
  process.exit(1)
})
