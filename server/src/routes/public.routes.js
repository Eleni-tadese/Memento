const express = require('express')
const publicController = require('../controllers/public.controller')

const router = express.Router()

// No auth — public landing page data only
router.get('/preview', publicController.getPreview)

module.exports = router
