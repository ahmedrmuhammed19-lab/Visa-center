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
 * GET /api/admin/branches?countryId=xxx
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const countryId = searchParams.get('countryId')

  const branches = await db.branch.findMany({
    where: countryId ? { countryId } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { country: true },
  })
  return NextResponse.json({ branches })
}

/**
 * POST /api/admin/branches
 * Body: { countryId, name, city, address, phone, visaCenter, reference?, mapLink?, workingHours?, submissionHours?, sortOrder? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const {
      countryId, name, city, address, phone, visaCenter,
      reference, mapLink, workingHours, submissionHours, sortOrder,
    } = body

    if (!countryId || !name || !city || !address || !phone || !visaCenter) {
      return NextResponse.json(
        { error: 'Missing required fields: countryId, name, city, address, phone, visaCenter' },
        { status: 400 }
      )
    }

    // Verify country exists
    const country = await db.country.findUnique({ where: { id: countryId } })
    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 })
    }

    const branch = await db.branch.create({
      data: {
        countryId,
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        visaCenter: visaCenter.trim(),
        reference: reference?.trim() || null,
        mapLink: mapLink?.trim() || null,
        workingHours: workingHours?.trim() || null,
        submissionHours: submissionHours?.trim() || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    })

    return NextResponse.json({ branch }, { status: 201 })
  } catch (error) {
    console.error('Create branch error:', error)
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
  }
}
