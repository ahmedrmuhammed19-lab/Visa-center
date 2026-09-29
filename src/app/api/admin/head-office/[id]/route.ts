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
 * PATCH /api/admin/head-office/[id]
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
    const {
      labelAr, labelEn, addressAr, addressEn,
      hoursAr, hoursEn, mapLink, isActive,
    } = body

    const data: any = {}
    if (typeof labelAr === 'string') data.labelAr = labelAr.trim()
    if (typeof labelEn === 'string') data.labelEn = labelEn.trim()
    if (typeof addressAr === 'string') data.addressAr = addressAr.trim()
    if (typeof addressEn === 'string') data.addressEn = addressEn.trim()
    if (typeof hoursAr === 'string') data.hoursAr = hoursAr.trim()
    if (typeof hoursEn === 'string') data.hoursEn = hoursEn.trim()
    if (typeof mapLink === 'string') data.mapLink = mapLink.trim()
    if (typeof isActive === 'boolean') data.isActive = isActive

    // If activating, deactivate others
    if (isActive === true) {
      await db.headOffice.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
      })
    }

    const office = await db.headOffice.update({
      where: { id },
      data,
    })

    return NextResponse.json({ office })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Head office not found' }, { status: 404 })
    }
    console.error('Update head office error:', error)
    return NextResponse.json({ error: 'Failed to update head office' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/head-office/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    await db.headOffice.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Head office not found' }, { status: 404 })
    }
    console.error('Delete head office error:', error)
    return NextResponse.json({ error: 'Failed to delete head office' }, { status: 500 })
  }
}
