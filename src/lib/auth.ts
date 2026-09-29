import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'globaleis-dev-secret-change-in-production-2026'

const ADMIN_COOKIE = 'globaleis_admin'

export async function signAdminToken(payload: { userId: string; username: string }): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyAdminToken(token: string): Promise<{ userId: string; username: string } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
    return decoded
  } catch {
    return null
  }
}

export async function getAdminFromRequest(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

export async function authenticateAdmin(username: string, password: string) {
  const user = await db.adminUser.findUnique({ where: { username } })
  if (!user) return null
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return null
  return { id: user.id, username: user.username }
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE
