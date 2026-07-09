const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const memoryController = require('../controllers/memory.controller')

const router = express.Router()

router.use(requireAuth)

router.delete('/:mediaId', memoryController.deleteMedia)

module.exports = router
