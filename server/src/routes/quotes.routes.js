const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { getQuotes, saveQuotes } = require('../controllers/quotes.controller')

const router = express.Router()
router.use(requireAuth)

router.get('/', getQuotes)
router.put('/', saveQuotes)

module.exports = router
