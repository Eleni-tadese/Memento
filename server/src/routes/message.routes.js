const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { uploadMessageFile } = require('../middleware/upload.middleware')
const {
  getMessages, sendMessage, editMessage,
  deleteMessage, markRead, uploadMessageMedia,
} = require('../controllers/message.controller')

const router = express.Router()
router.use(requireAuth)

router.get('/', getMessages)
router.post('/', sendMessage)
router.put('/:id', editMessage)
router.delete('/:id', deleteMessage)
router.patch('/read', markRead)
router.post('/upload', uploadMessageFile, uploadMessageMedia)

module.exports = router
