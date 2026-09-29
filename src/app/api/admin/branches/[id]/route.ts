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
 * PATCH /api/admin/branches/[id]
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
      name, city, address, phone, visaCenter,
      reference, mapLink, workingHours, submissionHours, sortOrder,
      countryId,
    } = body

    const data: any = {}
    if (typeof name === 'string') data.name = name.trim()
    if (typeof city === 'string') data.city = city.trim()
    if (typeof address === 'string') data.address = address.trim()
    if (typeof phone === 'string') data.phone = phone.trim()
    if (typeof visaCenter === 'string') data.visaCenter = visaCenter.trim()
    if (typeof reference === 'string') data.reference = reference.trim() || null
    if (typeof mapLink === 'string') data.mapLink = mapLink.trim() || null
    if (typeof workingHours === 'string') data.workingHours = workingHours.trim() || null
    if (typeof submissionHours === 'string') data.submissionHours = submissionHours.trim() || null
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder
    if (typeof countryId === 'string' && countryId) data.countryId = countryId

    const branch = await db.branch.update({
      where: { id },
      data,
    })

    return NextResponse.json({ branch })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }
    console.error('Update branch error:', error)
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/branches/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    await db.branch.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }
    console.error('Delete branch error:', error)
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}
