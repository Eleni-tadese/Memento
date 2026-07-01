const express = require('express')
const { body, validationResult } = require('express-validator')
const authController = require('../controllers/auth.controller')
const { requireAuth } = require('../middleware/auth.middleware')

const router = express.Router()

// Validation error handler middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Validation schemas
const signupValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('display_name').trim().notEmpty().withMessage('Display name is required'),
  validate
]

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
]

const joinValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('display_name').trim().notEmpty().withMessage('Display name is required'),
  validate
]

// Routes
router.post('/signup', signupValidation, authController.signup)
router.post('/login', loginValidation, authController.login)
router.get('/invite-link', requireAuth, authController.getInviteLink)
router.post('/join/:token', joinValidation, authController.join)

module.exports = router
