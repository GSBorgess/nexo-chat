import { FriendshipStatus } from '../../generated/prisma/enums.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { ApiError } from '../../infrastructure/http/errors.js'

export type FriendshipDecision = 'ACCEPTED' | 'DECLINED'

export interface FriendshipResult {
  id: string
  status: FriendshipStatus
  direction: 'INCOMING' | 'OUTGOING'
  otherUser: {
    publicId: string
    displayName: string
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

export function getCanonicalPair(
  firstUserId: string,
  secondUserId: string,
): { userLowId: string; userHighId: string } {
  if (!firstUserId || !secondUserId) {
    throw new ApiError('VALIDATION_ERROR')
  }

  if (firstUserId === secondUserId) {
    throw new ApiError('VALIDATION_ERROR')
  }

  return firstUserId < secondUserId
    ? { userLowId: firstUserId, userHighId: secondUserId }
    : { userLowId: secondUserId, userHighId: firstUserId }
}

function toFriendshipResultByIds(
  friendship: {
    id: string
    status: FriendshipStatus
    requestedById: string
    userLowId: string
    userHighId: string
    userLow: { publicId: string; displayName: string }
    userHigh: { publicId: string; displayName: string }
  },
  currentUserId: string,
): FriendshipResult {
  const otherUser =
    currentUserId === friendship.userLowId
      ? friendship.userHigh
      : friendship.userLow

  return {
    id: friendship.id,
    status: friendship.status,
    direction:
      friendship.requestedById === currentUserId ? 'OUTGOING' : 'INCOMING',
    otherUser: {
      publicId: otherUser.publicId,
      displayName: otherUser.displayName,
    },
  }
}

export async function createFriendshipRequest(
  requesterId: string,
  recipientId: string,
): Promise<FriendshipResult> {
  if (requesterId === recipientId) {
    throw new ApiError('VALIDATION_ERROR')
  }

  const pair = getCanonicalPair(requesterId, recipientId)

  return prisma.$transaction(async (transaction) => {
    const recipient = await transaction.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    })

    if (!recipient) {
      throw new ApiError('NOT_FOUND')
    }

    const existing = await transaction.friendship.findUnique({
      where: {
        userLowId_userHighId: pair,
      },
      include: {
        userLow: {
          select: { publicId: true, displayName: true },
        },
        userHigh: {
          select: { publicId: true, displayName: true },
        },
      },
    })

    if (existing?.status === FriendshipStatus.PENDING) {
      throw new ApiError('CONFLICT')
    }

    if (existing?.status === FriendshipStatus.ACCEPTED) {
      throw new ApiError('CONFLICT')
    }

    try {
      const friendship =
        existing?.status === FriendshipStatus.DECLINED
          ? await transaction.friendship.update({
              where: {
                userLowId_userHighId: pair,
              },
              data: {
                requestedById: requesterId,
                status: FriendshipStatus.PENDING,
              },
              include: {
                userLow: {
                  select: { publicId: true, displayName: true },
                },
                userHigh: {
                  select: { publicId: true, displayName: true },
                },
              },
            })
          : await transaction.friendship.create({
              data: {
                ...pair,
                requestedById: requesterId,
                status: FriendshipStatus.PENDING,
              },
              include: {
                userLow: {
                  select: { publicId: true, displayName: true },
                },
                userHigh: {
                  select: { publicId: true, displayName: true },
                },
              },
            })

      return toFriendshipResultByIds(friendship, requesterId)
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError('CONFLICT')
      }
      throw error
    }
  })
}

export async function decideFriendship(
  friendshipId: string,
  currentUserId: string,
  decision: FriendshipDecision,
): Promise<FriendshipResult> {
  if (
    decision !== FriendshipStatus.ACCEPTED &&
    decision !== FriendshipStatus.DECLINED
  ) {
    throw new ApiError('VALIDATION_ERROR')
  }

  return prisma.$transaction(async (transaction) => {
    const friendship = await transaction.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        userLow: {
          select: { publicId: true, displayName: true },
        },
        userHigh: {
          select: { publicId: true, displayName: true },
        },
      },
    })

    if (!friendship) {
      throw new ApiError('NOT_FOUND')
    }

    const isMember =
      friendship.userLowId === currentUserId ||
      friendship.userHighId === currentUserId

    if (!isMember) {
      throw new ApiError('FORBIDDEN')
    }

    const recipientId =
      friendship.requestedById === friendship.userLowId
        ? friendship.userHighId
        : friendship.userLowId

    if (recipientId !== currentUserId) {
      throw new ApiError('FORBIDDEN')
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ApiError('CONFLICT')
    }

    const updated = await transaction.friendship.update({
      where: { id: friendshipId },
      data: { status: decision },
      include: {
        userLow: {
          select: { publicId: true, displayName: true },
        },
        userHigh: {
          select: { publicId: true, displayName: true },
        },
      },
    })

    return toFriendshipResultByIds(updated, currentUserId)
  })
}

export async function listFriendships(
  currentUserId: string,
): Promise<FriendshipResult[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userLowId: currentUserId },
        { userHighId: currentUserId },
      ],
    },
    include: {
      userLow: {
        select: { publicId: true, displayName: true },
      },
      userHigh: {
        select: { publicId: true, displayName: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return friendships.map((friendship) =>
    toFriendshipResultByIds(friendship, currentUserId),
  )
}
