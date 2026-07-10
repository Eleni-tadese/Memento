const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { uploadAvatar } = require('../middleware/upload.middleware')
const profileController = require('../controllers/profile.controller')

const router = express.Router()
router.use(requireAuth)

router.get('/', profileController.getProfile)
router.put('/', profileController.updateProfile)
router.post('/avatar', uploadAvatar, profileController.uploadAvatarPhoto)

module.exports = router
