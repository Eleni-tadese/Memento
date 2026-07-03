require('dotenv').config()
const express = require('express')
const cors = require('cors')
require('./src/db/pool')


const app = express()
const PORT = process.env.PORT || 5000

const authRoutes = require('./src/routes/auth.routes')

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Memento server running on port ${PORT}`)
})
