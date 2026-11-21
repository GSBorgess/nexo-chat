import { z } from 'zod'

import { prisma } from '../../infrastructure/database/prisma.js'
import { ApiError } from '../../infrastructure/http/errors.js'
import { generateUniquePublicId } from './public-id.service.js'

const authProfileClaimsSchema = z
  .object({
    sub: z.string().trim().min(1),
    email: z.string().trim().email(),
    name: z.string().trim().min(1).optional(),
    nickname: z.string().trim().min(1).optional(),
    email_verified: z.boolean().optional(),
  })
  .passthrough()

export interface ProvisionedAuthProfile {
  id: string
  publicId: string
  email: string
  displayName: string
  createdAt: Date
}

export function validateAuthProfileClaims(
  claims: Record<string, unknown>,
): {
  sub: string
  email: string
  displayName: string
} {
  const result = authProfileClaimsSchema.safeParse(claims)

  if (
    !result.success ||
    (result.data.email_verified !== undefined && result.data.email_verified === false)
  ) {
    throw new ApiError('VALIDATION_ERROR')
  }

  const displayName =
    result.data.name ?? result.data.nickname ?? result.data.email.split('@')[0]?.trim()

  if (!displayName) {
    throw new ApiError('VALIDATION_ERROR')
  }

  return {
    sub: result.data.sub,
    email: result.data.email,
    displayName,
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}

export async function provisionUserFromAuthClaims(
  claims: Record<string, unknown>,
): Promise<ProvisionedAuthProfile> {
  const profile = validateAuthProfileClaims(claims)

  return prisma.$transaction(async (transaction) => {
    const existingIdentity = await transaction.authIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: 'AUTH0',
          providerSubject: profile.sub,
        },
      },
      include: { user: true },
    })

    if (existingIdentity) {
      const user = await transaction.user.update({
        where: { id: existingIdentity.userId },
        data: {
          email: profile.email,
          displayName: profile.displayName,
        },
      })

      return {
        id: user.id,
        publicId: user.publicId,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      }
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const publicId = await generateUniquePublicId()

      try {
        const user = await transaction.user.create({
          data: {
            publicId,
            email: profile.email,
            displayName: profile.displayName,
            authIdentity: {
              create: {
                provider: 'AUTH0',
                providerSubject: profile.sub,
              },
            },
          },
        })

        return {
          id: user.id,
          publicId: user.publicId,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        }
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error
        }

        const identityCreatedByConcurrentRequest =
          await transaction.authIdentity.findUnique({
            where: {
              provider_providerSubject: {
                provider: 'AUTH0',
                providerSubject: profile.sub,
              },
            },
            include: { user: true },
          })

        if (identityCreatedByConcurrentRequest) {
          const user = await transaction.user.update({
            where: { id: identityCreatedByConcurrentRequest.userId },
            data: {
              email: profile.email,
              displayName: profile.displayName,
            },
          })

          return {
            id: user.id,
            publicId: user.publicId,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt,
          }
        }
      }
    }

    throw new Error('Unable to provision a user with a unique public ID')
  })
}
