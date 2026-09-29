import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/branches
 * Returns all countries + their branches + head office info.
 * Public endpoint.
 */
export async function GET() {
  try {
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
  } catch (error) {
    console.error('GET /api/branches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}
