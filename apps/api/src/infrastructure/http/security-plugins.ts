import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'

import { env } from '../../config/env.js'
import { requireAuth } from '../auth/require-auth.js'

export {
  requireAuth,
  validateAuth0AccessToken,
  type Auth0ClaimSet,
} from '../auth/require-auth.js'

export async function registerSecurityPlugins(
  app: FastifyInstance,
): Promise<void> {
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }

      if (origin === env.webOrigin) {
        callback(null, true)
        return
      }

      callback(new Error('CORS origin not allowed'), false)
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    strictPreflight: true,
  })

  app.decorateRequest('auth', undefined)

  app.addHook('preHandler', async (request) => {
    const routeConfig = request.routeOptions.config as
      | {
          requireAuth?: boolean
        }
      | undefined

    if (routeConfig?.requireAuth) {
      await requireAuth(request)
    }
  })
}
