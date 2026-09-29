import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminFromRequest(new NextRequest('http://localhost/api/admin/me'))
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({
    authenticated: true,
    user: { username: admin.username },
  })
}
