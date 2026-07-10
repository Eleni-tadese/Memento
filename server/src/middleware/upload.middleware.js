const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB global limit
  }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 },
  { name: 'audio', maxCount: 5 }
])

const uploadMemory = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` })
      }
      return res.status(400).json({ message: err.message })
    }

    // Enforce specific size limits
    if (req.files) {
      if (req.files.images) {
        for (const file of req.files.images) {
          if (file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ message: `Image ${file.originalname} exceeds the 10MB limit` })
          }
        }
      }
      if (req.files.videos) {
        for (const file of req.files.videos) {
          if (file.size > 500 * 1024 * 1024) {
            return res.status(400).json({ message: `Video ${file.originalname} exceeds the 500MB limit` })
          }
        }
      }
      if (req.files.audio) {
        for (const file of req.files.audio) {
          if (file.size > 50 * 1024 * 1024) {
            return res.status(400).json({ message: `Audio ${file.originalname} exceeds the 50MB limit` })
          }
        }
      }
    }

    next()
  })
}

// Single avatar upload (5 MB limit)
const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar')

const uploadAvatar = (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` })
      }
      return res.status(400).json({ message: err.message })
    }
    next()
  })
}

module.exports = {
  uploadMemory,
  uploadAvatar,
}
