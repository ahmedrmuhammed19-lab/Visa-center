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
  
  if (url.startsWith('file:')) {
    return createClient({ url })
  }
  
  if (!authToken) {
    throw new Error('DATABASE_AUTH_TOKEN is required for Turso')
  }
  
  return createClient({ url, authToken })
}

const client = globalForDb.tursoClient ?? createDbClient()
if (process.env.NODE_ENV !== 'production') globalForDb.tursoClient = client

// Types
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

// Helper: build WHERE clause and args from conditions
function buildWhere(conditions: Record<string, any>): { clause: string, args: any[] } {
  const keys = Object.keys(conditions).filter(k => conditions[k] !== undefined)
  if (keys.length === 0) return { clause: '', args: [] }
  const clause = 'WHERE ' + keys.map(k => {
    if (conditions[k] === null) return `${k} IS NULL`
    return `${k} = ?`
  }).join(' AND ')
  const args = keys.filter(k => conditions[k] !== null).map(k => conditions[k])
  return { clause, args }
}

// Generic table gateway
function table<T extends { id: string }>(name: string) {
  return {
    async findMany(opts: { 
      where?: Record<string, any>, 
      orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>,
      include?: Record<string, boolean>,
    } = {}): Promise<(T & any)[]> {
      const { clause, args } = buildWhere(opts.where || {})
      let orderClause = ''
      if (opts.orderBy) {
        const orderBys = Array.isArray(opts.orderBy) ? opts.orderBy : [opts.orderBy]
        orderClause = 'ORDER BY ' + orderBys.map(o => {
          const k = Object.keys(o)[0]
          return `${k} ${o[k].toUpperCase()}`
        }).join(', ')
      }
      const sql = `SELECT * FROM ${name} ${clause} ${orderClause}`.trim()
      const result = await client.execute({ sql, args })
      let rows = result.rows as any[]
      
      // Handle includes (only for country.branches pattern)
      if (opts.include?.branches && name === 'Country') {
        for (const row of rows) {
          const branchResult = await client.execute({
            sql: `SELECT * FROM Branch WHERE countryId = ? ORDER BY sortOrder ASC`,
            args: [row.id]
          })
          row.branches = branchResult.rows
        }
      }
      
      return rows
    },
    
    async findFirst(opts: { where?: Record<string, any> } = {}): Promise<(T & any) | null> {
      const { clause, args } = buildWhere(opts.where || {})
      const sql = `SELECT * FROM ${name} ${clause} LIMIT 1`.trim()
      const result = await client.execute({ sql, args })
      return result.rows[0] as any || null
    },
    
    async findUnique(opts: { where: Record<string, any> }): Promise<(T & any) | null> {
      const { clause, args } = buildWhere(opts.where)
      const sql = `SELECT * FROM ${name} ${clause} LIMIT 1`.trim()
      const result = await client.execute({ sql, args })
      return result.rows[0] as any || null
    },
    
    async count(opts: { where?: Record<string, any> } = {}): Promise<number> {
      const { clause, args } = buildWhere(opts.where || {})
      const sql = `SELECT COUNT(*) as count FROM ${name} ${clause}`.trim()
      const result = await client.execute({ sql, args })
      return Number((result.rows[0] as any).count)
    },
    
    async create(opts: { data: Record<string, any> }): Promise<T & any> {
      const keys = Object.keys(opts.data)
      const values = keys.map(k => opts.data[k])
      const placeholders = keys.map(() => '?').join(', ')
      const sql = `INSERT INTO ${name} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
      const result = await client.execute({ sql, args: values })
      // For create with nested creates (like country.branches), need to handle separately
      if (result.rows.length > 0) {
        return result.rows[0] as any
      }
      // If no RETURNING support, query back
      const lastInsert = await client.execute(`SELECT * FROM ${name} ORDER BY rowid DESC LIMIT 1`)
      return lastInsert.rows[0] as any
    },
    
    async update(opts: { where: Record<string, any>, data: Record<string, any> }): Promise<T & any> {
      const { clause: whereClause, args: whereArgs } = buildWhere(opts.where)
      const setKeys = Object.keys(opts.data)
      const setArgs = setKeys.map(k => opts.data[k])
      const setClause = setKeys.map(k => `${k} = ?`).join(', ')
      const sql = `UPDATE ${name} SET ${setClause} ${whereClause} RETURNING *`
      const result = await client.execute({ sql, args: [...setArgs, ...whereArgs] })
      return result.rows[0] as any
    },
    
    async deleteMany(opts: { where?: Record<string, any> } = {}): Promise<{ count: number }> {
      const { clause, args } = buildWhere(opts.where || {})
      const sql = `DELETE FROM ${name} ${clause}`.trim()
      await client.execute({ sql, args })
      return { count: 0 } // libsql doesn't return affected rows count easily
    },
    
    async delete(opts: { where: Record<string, any> }): Promise<void> {
      const { clause, args } = buildWhere(opts.where)
      const sql = `DELETE FROM ${name} ${clause}`.trim()
      await client.execute({ sql, args })
    },
  }
}

// Prisma-like db object
export const db = {
  country: table<Country>('Country'),
  branch: table<Branch>('Branch'),
  headOffice: table<HeadOffice>('HeadOffice'),
  adminUser: table<AdminUser>('AdminUser'),
  siteSettings: table('SiteSettings'),
  
  // For nested create (Prisma's `create: { branches: { create: [...] } }`)
  // This is handled specially in the seed script and country create route.
}

// Helper for explicit queries if needed
export async function rawQuery<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await client.execute({ sql, args })
  return result.rows as T[]
}

export async function rawExecute(sql: string, args: any[] = []) {
  return client.execute({ sql, args })
}

export async function rawBatch(statements: { sql: string, args: any[] }[]) {
  return client.batch(statements)
}

// Helper for cascading deletes (since libsql doesn't have FK enforcement by default)
export async function deleteCountryCascade(countryId: string) {
  await client.execute({ sql: 'DELETE FROM Branch WHERE countryId = ?', args: [countryId] })
  await client.execute({ sql: 'DELETE FROM Country WHERE id = ?', args: [countryId] })
}

// Helper for creating country + branches together
export async function createCountryWithBranches(
  country: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>,
  branches: Array<Omit<Branch, 'id' | 'countryId' | 'createdAt' | 'updatedAt'>>
): Promise<{ country: Country, branches: Branch[] }> {
  const crypto = await import('crypto')
  const countryId = crypto.randomUUID()
  const now = new Date().toISOString()
  
  await client.execute({
    sql: `INSERT INTO Country (id, name, code, flag, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [countryId, country.name, country.code, country.flag, country.sortOrder, now, now]
  })
  
  const createdBranches: Branch[] = []
  for (const b of branches) {
    const branchId = crypto.randomUUID()
    await client.execute({
      sql: `INSERT INTO Branch (id, countryId, name, city, address, phone, visaCenter, reference, mapLink, workingHours, submissionHours, sortOrder, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [branchId, countryId, b.name, b.city, b.address, b.phone, b.visaCenter, 
             b.reference, b.mapLink, b.workingHours, b.submissionHours, b.sortOrder, now, now]
    })
    createdBranches.push({ ...b, id: branchId, countryId, createdAt: now, updatedAt: now } as Branch)
  }
  
  return {
    country: { ...country, id: countryId, createdAt: now, updatedAt: now } as Country,
    branches: createdBranches,
  }
}
