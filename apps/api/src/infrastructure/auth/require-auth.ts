import type { FastifyRequest } from 'fastify'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

import { env } from '../../config/env.js'
import { ApiError } from '../http/errors.js'

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
  if (!token || token.trim() !== token) {
    throw new ApiError('UNAUTHORIZED')
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: env.auth0Issuer,
      audience: env.auth0Audience,
    })

    if (
      typeof payload.sub !== 'string' ||
      !payload.sub.trim() ||
      typeof payload.iss !== 'string' ||
      (typeof payload.aud !== 'string' && !Array.isArray(payload.aud))
    ) {
      throw new ApiError('UNAUTHORIZED')
    }

    return payload as Auth0ClaimSet
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError('UNAUTHORIZED')
  }
}

export async function requireAuth(request: FastifyRequest): Promise<void> {
  const authorization = request.headers.authorization
  const match = authorization?.match(/^Bearer[ \t]+([^ \t]+)[ \t]*$/i)

  const token = match?.[1]

  if (!token) {
    throw new ApiError('UNAUTHORIZED')
  }

  request.auth = await validateAuth0AccessToken(token)
}
