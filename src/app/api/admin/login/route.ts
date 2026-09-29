import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, signAdminToken, setAdminCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const admin = await authenticateAdmin(username, password)
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await signAdminToken({
      userId: admin.id,
      username: admin.username,
    })

    await setAdminCookie(token)

    return NextResponse.json({
      ok: true,
      user: { username: admin.username },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
