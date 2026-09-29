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
 * PATCH /api/admin/countries/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const body = await request.json()
    const { name, code, flag, sortOrder } = body

    const data: any = {}
    if (typeof name === 'string') data.name = name.trim()
    if (typeof code === 'string') data.code = code.trim().toUpperCase() || null
    if (typeof flag === 'string') data.flag = flag
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder

    const country = await db.country.update({
      where: { id },
      data,
    })

    return NextResponse.json({ country })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Country name already exists' }, { status: 409 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 })
    }
    console.error('Update country error:', error)
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/countries/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    await db.country.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 })
    }
    console.error('Delete country error:', error)
    return NextResponse.json({ error: 'Failed to delete country' }, { status: 500 })
  }
}
