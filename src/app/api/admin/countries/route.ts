import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

async function requireAdmin(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { admin }
}

/**
 * GET /api/admin/countries
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const countries = await db.country.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { branches: true } } },
  })
  return NextResponse.json({ countries })
}

/**
 * POST /api/admin/countries
 * Body: { name, code?, flag?, sortOrder? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const { name, code, flag, sortOrder } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
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
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Country name already exists' }, { status: 409 })
    }
    console.error('Create country error:', error)
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 })
  }
}
