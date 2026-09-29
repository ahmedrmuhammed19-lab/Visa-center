import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== /api/branches called ===')
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL)
    console.log('DATABASE_AUTH_TOKEN set:', !!process.env.DATABASE_AUTH_TOKEN)
    console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 30))
    
    const [countries, headOffice] = await Promise.all([
      db.country.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          branches: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      db.headOffice.findFirst({
        where: { isActive: true },
      }),
    ])

    return NextResponse.json({
      countries,
      headOffice,
      stats: {
        countryCount: countries.length,
        branchCount: countries.reduce((s, c) => s + c.branches.length, 0),
      },
    })
  } catch (error: any) {
    console.error('GET /api/branches error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch branches',
        message: error?.message,
        stack: error?.stack?.split('\n').slice(0, 5),
        name: error?.name,
        code: error?.code,
      },
      { status: 500 }
    )
  }
}
