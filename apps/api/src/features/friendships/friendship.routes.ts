import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

import { provisionUserFromAuthClaims } from '../auth/auth.service.js'
import { ApiError } from '../../infrastructure/http/errors.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  createFriendshipRequest,
  decideFriendship,
  listFriendships,
} from './friendship.service.js'

const publicIdSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{12}$/)

const publicIdParamsSchema = z.object({
  publicId: publicIdSchema,
})

const createFriendshipBodySchema = z.object({
  publicId: publicIdSchema,
})

const friendshipIdParamsSchema = z.object({
  friendshipId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
})

const decideFriendshipBodySchema = z.object({
  decision: z.enum(['ACCEPTED', 'DECLINED']),
})

export const friendshipRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/users/by-public-id/:publicId',
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

      await provisionUserFromAuthClaims(claims)

      const params = publicIdParamsSchema.safeParse(request.params)

      if (!params.success) {
        throw new ApiError('VALIDATION_ERROR')
      }

      const user = await prisma.user.findUnique({
        where: { publicId: params.data.publicId },
        select: { publicId: true, displayName: true },
      })

      if (!user) {
        throw new ApiError('NOT_FOUND')
      }

      return user
    },
  )

  app.get(
    '/friendships',
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
      const items = await listFriendships(profile.id)

      return { items }
    },
  )

  app.post(
    '/friendships',
    {
      config: {
        requireAuth: true,
      },
    },
    async (request, reply) => {
      const claims = request.auth

      if (!claims) {
        throw new ApiError('UNAUTHORIZED')
      }

      const body = createFriendshipBodySchema.safeParse(request.body)

      if (!body.success) {
        throw new ApiError('VALIDATION_ERROR')
      }

      const profile = await provisionUserFromAuthClaims(claims)
      const recipient = await prisma.user.findUnique({
        where: { publicId: body.data.publicId },
        select: { id: true },
      })

      if (!recipient) {
        throw new ApiError('NOT_FOUND')
      }

      const friendship = await createFriendshipRequest(
        profile.id,
        recipient.id,
      )

      return reply.status(201).send(friendship)
    },
  )

  app.patch(
    '/friendships/:friendshipId',
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

      const params = friendshipIdParamsSchema.safeParse(request.params)
      const body = decideFriendshipBodySchema.safeParse(request.body)

      if (!params.success || !body.success) {
        throw new ApiError('VALIDATION_ERROR')
      }

      const profile = await provisionUserFromAuthClaims(claims)
      const friendship = await decideFriendship(
        params.data.friendshipId,
        profile.id,
        body.data.decision,
      )

      return friendship
    },
  )
}
