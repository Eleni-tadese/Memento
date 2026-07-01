require('dotenv').config()
const express = require('express')
const cors = require('cors')
require('./src/db/pool')


const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.CLIENT_URL
}))
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

app.listen(PORT, () => {
  console.log(`Memento server running on port ${PORT}`)
})
