import { randomInt } from 'node:crypto'
import { prisma } from '../../infrastructure/database/prisma.js'

const PUBLIC_ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const PUBLIC_ID_LENGTH = 12
const MAX_GENERATION_ATTEMPTS = 5

export async function generateUniquePublicId(): Promise<string> {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const publicId = Array.from({ length: PUBLIC_ID_LENGTH }, () =>
      PUBLIC_ID_ALPHABET.charAt(randomInt(PUBLIC_ID_ALPHABET.length)),
    ).join('')

    const existingUser = await prisma.user.findUnique({
      where: { publicId },
      select: { id: true },
    })

    if (!existingUser) {
      return publicId
    }
  }

  throw new Error(
    `Unable to generate a unique public ID after ${MAX_GENERATION_ATTEMPTS} attempts`,
  )
}
