import Fastify, { type FastifyInstance } from 'fastify'

import { disconnectPrisma } from './infrastructure/database/prisma.js'
import { registerErrorHandler } from './infrastructure/http/error-handler.js'
import { registerSecurityPlugins } from './infrastructure/http/security-plugins.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  })

  registerErrorHandler(app)
  await registerSecurityPlugins(app)

  await app.register(
    async (instance) => {
      instance.get('/', async () => ({
        ok: true,
        service: 'nexo-chat-api',
        version: 'v1',
      }))

      instance.get('/health', async () => ({
        ok: true,
        service: 'nexo-chat-api',
        timestamp: new Date().toISOString(),
      }))
    },
    { prefix: '/api/v1' },
  )

  app.addHook('onClose', async () => {
    await disconnectPrisma()
  })

  return app
}

export async function createApp(): Promise<FastifyInstance> {
  return buildApp()
}
