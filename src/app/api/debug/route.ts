import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    DATABASE_URL_set: !!process.env.DATABASE_URL,
    DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 30),
    DATABASE_AUTH_TOKEN_set: !!process.env.DATABASE_AUTH_TOKEN,
    JWT_SECRET_set: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }
  return NextResponse.json(env)
}
