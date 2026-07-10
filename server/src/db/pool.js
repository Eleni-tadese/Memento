const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

pool.connect()
  .then(client => {
    console.log('Database connected')
    client.release()
  })
  .catch(err => console.error('Database error:', err))

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

module.exports = pool

