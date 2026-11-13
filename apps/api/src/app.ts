import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'

import { env } from './config/env.js'
import { disconnectPrisma } from './infrastructure/database/prisma.js'
import { registerErrorHandler } from './infrastructure/http/error-handler.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  })

  registerErrorHandler(app)

  await app.register(cors, {
    origin: env.webOrigin,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

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
