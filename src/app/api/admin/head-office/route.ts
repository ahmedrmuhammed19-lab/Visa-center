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
 * GET /api/admin/head-office
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  const offices = await db.headOffice.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ offices })
}

/**
 * POST /api/admin/head-office
 * Body: { labelAr, labelEn, addressAr, addressEn, hoursAr, hoursEn, mapLink, isActive? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return auth.error

  try {
    const body = await request.json()
    const {
      labelAr, labelEn, addressAr, addressEn,
      hoursAr, hoursEn, mapLink, isActive,
    } = body

    if (!labelAr || !labelEn || !addressAr || !addressEn || !hoursAr || !hoursEn || !mapLink) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // If new office is active, deactivate existing ones
    if (isActive !== false) {
      await db.headOffice.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const office = await db.headOffice.create({
      data: {
        labelAr: labelAr.trim(),
        labelEn: labelEn.trim(),
        addressAr: addressAr.trim(),
        addressEn: addressEn.trim(),
        hoursAr: hoursAr.trim(),
        hoursEn: hoursEn.trim(),
        mapLink: mapLink.trim(),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ office }, { status: 201 })
  } catch (error) {
    console.error('Create head office error:', error)
    return NextResponse.json({ error: 'Failed to create head office' }, { status: 500 })
  }
}
