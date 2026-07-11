const { Pool, neonConfig } = require('@neondatabase/serverless')
const ws = require('ws')

// Use WebSocket transport (HTTPS/443) instead of raw PostgreSQL TCP/5432.
// Required on networks where outbound TLS on port 5432 is blocked.
neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.on('error', (err) => {
  if (err.code !== 'ECONNRESET' && err.code !== 'EPIPE') {
    console.error('Unexpected pool error:', err.message)
  }
})

// Non-blocking startup probe
pool.connect()
  .then(client => {
    console.log('Database connected')
    client.release()
  })
  .catch(err => {
    console.warn('DB probe on startup failed:', err.message)
  })

module.exports = pool
