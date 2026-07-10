const pool = require('../db/pool')
const cloudinary = require('../config/cloudinary')

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 800, crop: 'limit' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })

// GET /api/profile
const getProfile = async (req, res) => {
  const { userId, relationshipId } = req.user
  try {
    // Fetch only columns that are guaranteed to exist; extras added via safe coalesce
    const selfResult = await pool.query(
      `SELECT id, email, display_name,
              COALESCE(avatar_url, '') AS avatar_url,
              COALESCE(CAST(NULL AS TEXT), '') AS bio,
              COALESCE(CAST(NULL AS TEXT), '') AS location,
              NULL AS birthday
       FROM users WHERE id = $1`,
      [userId]
    )

    // Now try to get the optional columns if they exist
    let selfExtended = {}
    try {
      const ext = await pool.query(
        `SELECT bio, location, birthday FROM users WHERE id = $1`, [userId]
      )
      if (ext.rows.length > 0) selfExtended = ext.rows[0]
    } catch (_) { /* columns don't exist yet */ }

    if (selfResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    const self = { ...selfResult.rows[0], ...selfExtended }

    let partner = null
    if (relationshipId) {
      const relResult = await pool.query(
        `SELECT user_one_id, user_two_id FROM relationships WHERE id = $1`,
        [relationshipId]
      )
      if (relResult.rows.length > 0) {
        const rel = relResult.rows[0]
        const partnerId =
          rel.user_one_id === userId ? rel.user_two_id : rel.user_one_id
        if (partnerId !== userId) {
          const partnerResult = await pool.query(
            `SELECT id, display_name, COALESCE(avatar_url, '') AS avatar_url
             FROM users WHERE id = $1`,
            [partnerId]
          )
          if (partnerResult.rows.length > 0) {
            partner = partnerResult.rows[0]
            try {
              const pExt = await pool.query(
                `SELECT bio, location, birthday FROM users WHERE id = $1`, [partnerId]
              )
              if (pExt.rows.length > 0) partner = { ...partner, ...pExt.rows[0] }
            } catch (_) { /* columns don't exist yet */ }
          }
        }
      }
    }

    return res.status(200).json({ self, partner })
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching profile', error: err.message })
  }
}

// PUT /api/profile
const updateProfile = async (req, res) => {
  const { userId } = req.user
  const { display_name, avatar_url, bio, location, birthday } = req.body
  try {
    // Always update base columns
    const base = await pool.query(
      `UPDATE users
       SET display_name = COALESCE($1, display_name),
           avatar_url   = $2
       WHERE id = $3
       RETURNING id, email, display_name, avatar_url`,
      [display_name || null, avatar_url || null, userId]
    )
    let user = base.rows[0]

    // Try updating optional columns if they exist
    try {
      const ext = await pool.query(
        `UPDATE users SET bio = $1, location = $2, birthday = $3
         WHERE id = $4
         RETURNING bio, location, birthday`,
        [bio || null, location || null, birthday || null, userId]
      )
      if (ext.rows.length > 0) user = { ...user, ...ext.rows[0] }
    } catch (_) { /* optional columns not yet added */ }

    return res.status(200).json({ user })
  } catch (err) {
    return res.status(500).json({ message: 'Error updating profile', error: err.message })
  }
}

// POST /api/profile/avatar
const uploadAvatarPhoto = async (req, res) => {
  const { userId } = req.user
  if (!req.file) return res.status(400).json({ message: 'No file provided' })
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'memento/avatars')
    const avatarUrl = result.secure_url
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId])
    return res.status(200).json({ avatar_url: avatarUrl })
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message })
  }
}

module.exports = { getProfile, updateProfile, uploadAvatarPhoto }
