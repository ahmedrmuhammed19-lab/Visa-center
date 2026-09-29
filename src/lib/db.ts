import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Use TURSO_DATABASE_URL for the actual connection (separate from DATABASE_URL
  // which Prisma uses for schema validation)
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.DATABASE_AUTH_TOKEN

  // For Turso (production): both URL and token required
  if (tursoUrl && tursoUrl.startsWith('libsql://') && tursoToken) {
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }

  // Fallback: local SQLite file
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
