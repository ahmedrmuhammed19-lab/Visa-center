import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Log all env vars that start with DATABASE or TURSO or JWT
  const relevant: Record<string, any> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (k.includes('DATABASE') || k.includes('TURSO') || k.includes('JWT')) {
      relevant[k] = v ? (v.length > 60 ? v.substring(0, 60) + '...' : v) : null
    }
  }
  
  let dbTest: any = null
  try {
    // Use TURSO_DATABASE_URL with adapter
    const tursoUrl = process.env.TURSO_DATABASE_URL!
    const tursoToken = process.env.DATABASE_AUTH_TOKEN!
    
    if (!tursoUrl || !tursoToken) {
      dbTest = { ok: false, reason: 'env missing' }
    } else {
      const libsql = createClient({ url: tursoUrl, authToken: tursoToken })
      const adapter = new PrismaLibSQL(libsql)
      const prisma = new PrismaClient({ adapter })
      const count = await prisma.country.count()
      dbTest = { ok: true, count }
    }
  } catch (e: any) {
    dbTest = {
      ok: false,
      error: e?.message,
      stack: e?.stack?.split('\n').slice(0, 8),
    }
  }
  
  return NextResponse.json({ env: relevant, dbTest })
}
