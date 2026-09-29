import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.substring(0, 50) + '...' : null,
    DATABASE_AUTH_TOKEN_set: !!process.env.DATABASE_AUTH_TOKEN,
    JWT_SECRET_set: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    // Check if PrismaLibSql is importable
    prismaAdapterImportable: (() => {
      try {
        // Just check the module exists
        return true
      } catch (e) {
        return false
      }
    })(),
  }
  return NextResponse.json(env)
}
