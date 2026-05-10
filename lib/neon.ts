import { Pool } from 'pg'

// Singleton pool — reused across requests in the same Node.js process
let _pool: Pool | null = null

export function getNeonPool(): Pool {
  if (!_pool) {
    // Replace sslmode=require with verify-full to silence pg v8 deprecation warning
    const connectionString = (process.env.DATABASE_URL ?? '').replace(
      'sslmode=require',
      'sslmode=verify-full'
    )
    _pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
    })
  }
  return _pool
}
