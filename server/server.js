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

const memoryRoutes = require('./src/routes/memory.routes')
app.use('/api/memories', memoryRoutes)

const mediaRoutes = require('./src/routes/media.routes')
app.use('/api/media', mediaRoutes)

const publicRoutes = require('./src/routes/public.routes')
app.use('/api/public', publicRoutes)

const profileRoutes = require('./src/routes/profile.routes')
app.use('/api/profile', profileRoutes)

const messageRoutes = require('./src/routes/message.routes')
app.use('/api/messages', messageRoutes)


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Memento server running on port ${PORT}`)
})
