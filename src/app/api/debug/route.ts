import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL_set: !!process.env.TURSO_DATABASE_URL,
    TURSO_DATABASE_URL_starts_libsql: process.env.TURSO_DATABASE_URL?.startsWith('libsql://'),
    DATABASE_AUTH_TOKEN_set: !!process.env.DATABASE_AUTH_TOKEN,
  }
  
  // Try direct adapter approach (without our db.ts)
  let dbTest: any = null
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    const tursoToken = process.env.DATABASE_AUTH_TOKEN
    
    if (!tursoUrl || !tursoUrl.startsWith('libsql://') || !tursoToken) {
      dbTest = { ok: false, reason: 'env vars missing', env }
    } else {
      const libsql = createClient({ url: tursoUrl, authToken: tursoToken })
      const adapter = new PrismaLibSql(libsql)
      const prisma = new PrismaClient({ adapter })
      const count = await prisma.country.count()
      dbTest = { ok: true, count, usedAdapter: true }
    }
  } catch (e: any) {
    dbTest = { 
      ok: false, 
      error: e?.message,
      name: e?.name,
      code: e?.code,
    }
  }
  
  return NextResponse.json({ env, dbTest })
}
