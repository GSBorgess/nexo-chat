import type { FastifyInstance, FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

import { env } from '../../config/env.js'
import { ApiError } from './errors.js'

export type Auth0ClaimSet = JWTPayload & {
  sub: string
  iss: string
  aud: string | string[]
}

declare module 'fastify' {
  interface FastifyRequest {
    auth?: Auth0ClaimSet
  }
}

const jwks = createRemoteJWKSet(
  new URL(`https://${env.auth0Domain}/.well-known/jwks.json`),
)

export async function validateAuth0AccessToken(
  token: string,
): Promise<Auth0ClaimSet> {
  if (!token) {
    throw new ApiError('UNAUTHORIZED')
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: env.auth0Issuer,
      audience: env.auth0Audience,
    })

    if (typeof payload.sub !== 'string' || !payload.sub.trim()) {
      throw new ApiError('UNAUTHORIZED')
    }

    return payload as Auth0ClaimSet
  } catch {
    throw new ApiError('UNAUTHORIZED')
  }
}

export async function requireAuth(request: FastifyRequest): Promise<void> {
  const authorization = request.headers.authorization

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    throw new ApiError('UNAUTHORIZED')
  }

  const token = authorization.slice(7).trim()

  if (!token) {
    throw new ApiError('UNAUTHORIZED')
  }

  const verifiedToken = await validateAuth0AccessToken(token)
  request.auth = verifiedToken
}

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
