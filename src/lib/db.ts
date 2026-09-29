import { createClient, type Client } from '@libsql/client'

const globalForDb = globalThis as unknown as { 
  tursoClient: Client | undefined 
}

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  const authToken = process.env.DATABASE_AUTH_TOKEN
  
  if (!url) {
    throw new Error('DATABASE_URL or TURSO_DATABASE_URL is required')
  }
  
  // For local SQLite (development)
  if (url.startsWith('file:')) {
    return createClient({ url })
  }
  
  // For Turso (production)
  if (!authToken) {
    throw new Error('DATABASE_AUTH_TOKEN is required for Turso')
  }
  
  return createClient({ url, authToken })
}

export const turso = globalForDb.tursoClient ?? createDbClient()

if (process.env.NODE_ENV !== 'production') globalForDb.tursoClient = turso

// Helper query functions
export async function query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await turso.execute({ sql, args })
  return result.rows as T[]
}

export async function execute(sql: string, args: any[] = []) {
  return turso.execute({ sql, args })
}

export async function transaction<T>(fn: (tx: Client) => Promise<T>): Promise<T> {
  return turso.transaction(fn)
}

// Types matching Prisma models
export type Country = {
  id: string
  name: string
  code: string | null
  flag: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type Branch = {
  id: string
  countryId: string
  name: string
  city: string
  address: string
  phone: string
  visaCenter: string
  reference: string | null
  mapLink: string | null
  workingHours: string | null
  submissionHours: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type HeadOffice = {
  id: string
  labelAr: string
  labelEn: string
  addressAr: string
  addressEn: string
  hoursAr: string
  hoursEn: string
  mapLink: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminUser = {
  id: string
  username: string
  password: string
  createdAt: string
  updatedAt: string
}
