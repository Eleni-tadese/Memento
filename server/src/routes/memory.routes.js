const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { uploadMemory } = require('../middleware/upload.middleware')
const memoryController = require('../controllers/memory.controller')

const router = express.Router()

// All memory routes require authentication
router.use(requireAuth)

router.post('/', uploadMemory, memoryController.createMemory)
router.get('/', memoryController.getMemories)
router.get('/:id', memoryController.getMemory)
router.patch('/:id', memoryController.updateMemory)
router.delete('/:id', memoryController.deleteMemory)
router.post('/:id/media', uploadMemory, memoryController.addMediaToMemory)
router.post('/:id/comments', memoryController.addComment)

module.exports = router
