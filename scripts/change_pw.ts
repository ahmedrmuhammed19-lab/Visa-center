import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const hash = await bcrypt.hash('admin', 10)
  const u = await db.adminUser.update({
    where: { username: 'admin' },
    data: { password: hash },
  })
  console.log('✓ Password updated for user:', u.username)
  // Test the new password
  const ok = await bcrypt.compare('admin', u.password)
  console.log('✓ Verification (admin/admin matches hash):', ok)
}

main().catch(e => { console.error('✗ Failed:', e); process.exit(1) }).finally(() => db.$disconnect())
