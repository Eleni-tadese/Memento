const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

// POST /api/auth/signup
const signup = async (req, res) => {
  const { email, password, display_name } = req.body

  const normalizedEmail = email.toLowerCase().trim()

  const client = await pool.connect()
  try {
    // Check if email already exists
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (userCheck.rows.length > 0) {
      client.release()
      return res.status(409).json({ message: "Email already in use" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    await client.query('BEGIN')

    // Insert user
    const userInsertResult = await client.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [normalizedEmail, hashedPassword, display_name]
    )
    const newUser = userInsertResult.rows[0]
    const userId = newUser.id

    // Generate invitation code
    const inviteCode = crypto.randomBytes(32).toString('hex')

    // Insert relationship: user_two_id is user_one_id as a placeholder
    const relInsertResult = await client.query(
      `INSERT INTO relationships 
        (user_one_id, user_two_id, invitation_code, invitation_expires_at, created_by_user_id)
       VALUES 
        ($1, $2, $3, NOW() + INTERVAL '72 hours', $4)
       RETURNING id`,
      [userId, userId, inviteCode, userId]
    )
    const relationshipId = relInsertResult.rows[0].id

    await client.query('COMMIT')
    client.release()

    // Sign JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, relationshipId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name
      },
      relationshipId
    })
  } catch (err) {
    await client.query('ROLLBACK')
    client.release()
    return res.status(500).json({
      message: "An error occurred during signup",
      error: err.message
    })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body

  const normalizedEmail = email.toLowerCase().trim()

  try {
    // Find user
    const userResult = await pool.query(
      'SELECT id, email, display_name, password_hash FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const user = userResult.rows[0]

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Update last_login_at
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])

    // Find relationship
    const relationshipResult = await pool.query(
      `SELECT id, status FROM relationships
       WHERE (user_one_id = $1 OR user_two_id = $1)
       AND status != 'archived'
       LIMIT 1`,
      [user.id]
    )

    const relationship = relationshipResult.rows[0]
    const relationshipId = relationship ? relationship.id : null

    // Sign JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, relationshipId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      },
      relationshipId
    })
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred during login",
      error: err.message
    })
  }
}

// GET /api/auth/invite-link
const getInviteLink = async (req, res) => {
  const { userId, relationshipId } = req.user

  try {
    // Find relationship
    const relResult = await pool.query(
      `SELECT id, user_one_id, user_two_id, invitation_code, invitation_expires_at
       FROM relationships WHERE id = $1`,
      [relationshipId]
    )

    if (relResult.rows.length === 0) {
      return res.status(404).json({ message: "Relationship not found" })
    }

    const relationship = relResult.rows[0]

    // Check if partner already joined
    if (relationship.user_two_id !== relationship.user_one_id) {
      // Determine which user is the partner (not the one requesting)
      const partnerId = relationship.user_one_id === userId
        ? relationship.user_two_id
        : relationship.user_one_id

      const partnerResult = await pool.query(
        'SELECT display_name FROM users WHERE id = $1',
        [partnerId]
      )
      const partnerName = partnerResult.rows[0]?.display_name || null

      return res.status(200).json({ partnerJoined: true, partnerName })
    }

    // Generating new code
    const newCode = crypto.randomBytes(32).toString('hex')

    await pool.query(
      `UPDATE relationships SET
         invitation_code = $1,
         invitation_expires_at = NOW() + INTERVAL '72 hours'
       WHERE id = $2`,
      [newCode, relationshipId]
    )

    return res.status(200).json({
      partnerJoined: false,
      inviteUrl: `${process.env.CLIENT_URL}/join/${newCode}`
    })
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred fetching invite link",
      error: err.message
    })
  }
}

// POST /api/auth/join/:token
const join = async (req, res) => {
  const { token } = req.params
  const { email, password, display_name } = req.body

  const normalizedEmail = email.toLowerCase().trim()

  const client = await pool.connect()
  try {
    // Find relationship matching invitation code and not expired and not accepted yet
    const relResult = await client.query(
      `SELECT id, user_one_id FROM relationships
       WHERE invitation_code = $1
       AND invitation_expires_at > NOW()
       AND user_two_id = user_one_id
       LIMIT 1`,
      [token]
    )

    if (relResult.rows.length === 0) {
      client.release()
      return res.status(400).json({ message: "This invitation link has expired or is invalid." })
    }

    const relationship = relResult.rows[0]
    const relationshipId = relationship.id

    // Check email availability
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (userCheck.rows.length > 0) {
      client.release()
      return res.status(409).json({ message: "Email already in use" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    await client.query('BEGIN')

    // Insert new user
    const userInsertResult = await client.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [normalizedEmail, hashedPassword, display_name]
    )
    const newUser = userInsertResult.rows[0]
    const newUserId = newUser.id

    // Update relationship: partner joins, set status active and accepted_at
    await client.query(
      `UPDATE relationships SET
         user_two_id = $1,
         status = 'active',
         accepted_at = NOW()
       WHERE id = $2`,
      [newUserId, relationshipId]
    )

    await client.query('COMMIT')
    client.release()

    // Sign JWT
    const jwtToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, relationshipId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      token: jwtToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name
      },
      relationshipId
    })
  } catch (err) {
    await client.query('ROLLBACK')
    client.release()
    return res.status(500).json({
      message: "An error occurred during joining",
      error: err.message
    })
  }
}

module.exports = {
  signup,
  login,
  getInviteLink,
  join
}
