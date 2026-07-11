const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const {
  getLetters, getLetter, createLetter, updateLetter, deleteLetter, pinLetter,
} = require('../controllers/letters.controller')

const router = express.Router()
router.use(requireAuth)

router.get('/', getLetters)
router.get('/:id', getLetter)
router.post('/', createLetter)
router.put('/:id', updateLetter)
router.delete('/:id', deleteLetter)
router.patch('/:id/pin', pinLetter)

module.exports = router
