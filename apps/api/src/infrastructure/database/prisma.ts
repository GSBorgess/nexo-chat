import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '../../generated/prisma/client.js'

const databaseDirectory = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(databaseDirectory, '../../../.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to initialize Prisma')
}

const adapter = new PrismaPg({ connectionString: databaseUrl })

export const prisma = new PrismaClient({ adapter })

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}
