import type { FastifyPluginAsync } from 'fastify'

import { ApiError } from '../../infrastructure/http/errors.js'
import { provisionUserFromAuthClaims } from './auth.service.js'

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/auth/me',
    {
      config: {
        requireAuth: true,
      },
    },
    async (request) => {
      const claims = request.auth

      if (!claims) {
        throw new ApiError('UNAUTHORIZED')
      }

      const profile = await provisionUserFromAuthClaims(claims)

      return {
        sub: claims.sub,
        publicId: profile.publicId,
        displayName: profile.displayName,
      }
    },
  )
}
