import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'set (libsql://...)' : null,
    DATABASE_AUTH_TOKEN_set: !!process.env.DATABASE_AUTH_TOKEN,
    JWT_SECRET_set: !!process.env.JWT_SECRET,
  }
  
  // Try to count countries
  let dbTest: any = null
  try {
    const count = await db.country.count()
    dbTest = { ok: true, count }
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
