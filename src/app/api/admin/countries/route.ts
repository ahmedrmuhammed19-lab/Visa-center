import { NextRequest, NextResponse } from 'next/server'
import { db, rawQuery } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

async function requireAdmin(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { admin }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const countries = await db.country.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  
  const counts = await rawQuery<{ countryId: string, count: number }>(
    'SELECT countryId, COUNT(*) as count FROM Branch GROUP BY countryId'
  )
  const countMap = new Map(counts.map(c => [c.countryId, Number(c.count)]))
  
  const countriesWithCounts = countries.map(c => ({
    ...c,
    _count: { branches: countMap.get(c.id) || 0 },
  }))
  
  return NextResponse.json({ countries: countriesWithCounts })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const { name, code, flag, sortOrder } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const existing = await db.country.findFirst({ where: { name: name.trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Country name already exists' }, { status: 409 })
    }

    const country = await db.country.create({
      data: {
        name: name.trim(),
        code: (code || '').trim().toUpperCase() || null,
        flag: flag || '🌍',
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    })

    return NextResponse.json({ country }, { status: 201 })
  } catch (error: any) {
    console.error('Create country error:', error)
    return NextResponse.json(
      { error: 'Failed to create country', message: error?.message, stack: error?.stack?.split('\n').slice(0, 5) },
      { status: 500 }
    )
  }
}
