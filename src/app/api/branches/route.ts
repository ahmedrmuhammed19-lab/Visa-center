import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Cache for 60 seconds at the CDN level (helps with cold starts)
export const revalidate = 60

export async function GET() {
  try {
    const [countries, headOffice] = await Promise.all([
      db.country.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { branches: true },
      }),
      db.headOffice.findFirst({ where: { isActive: true } }),
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
      { error: 'Failed to fetch branches', message: error?.message },
      { status: 500 }
    )
  }
}
