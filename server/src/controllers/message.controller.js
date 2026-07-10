const pool = require('../db/pool')
const cloudinary = require('../config/cloudinary')

/* ── Cloudinary upload helper ── */
const uploadToCloudinary = (buffer, resourceType, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })

/* GET /api/messages?after=ISO */
const getMessages = async (req, res) => {
  const { userId, relationshipId } = req.user
  if (!relationshipId) return res.status(400).json({ message: 'No relationship found' })

  const { after } = req.query
  try {
    // Try with reply join; fall back to simple query if reply_to_id column missing
    let result
    try {
      let query = `
        SELECT msg.*, u.display_name, u.avatar_url,
               reply.content   AS reply_content,
               reply.media_type AS reply_media_type,
               ru.display_name  AS reply_sender_name
        FROM messages msg
        JOIN users u ON u.id = msg.sender_user_id
        LEFT JOIN messages reply ON reply.id = msg.reply_to_id
        LEFT JOIN users ru ON ru.id = reply.sender_user_id
        WHERE msg.relationship_id = $1
      `
      const params = [relationshipId]
      if (after) { params.push(after); query += ` AND msg.created_at > $${params.length}` }
      query += ` ORDER BY msg.created_at ASC LIMIT 500`
      result = await pool.query(query, params)
    } catch (_) {
      let query = `
        SELECT msg.*, u.display_name, u.avatar_url
        FROM messages msg
        JOIN users u ON u.id = msg.sender_user_id
        WHERE msg.relationship_id = $1
      `
      const params = [relationshipId]
      if (after) { params.push(after); query += ` AND msg.created_at > $${params.length}` }
      query += ` ORDER BY msg.created_at ASC LIMIT 500`
      result = await pool.query(query, params)
    }

    const unread = await pool.query(
      `SELECT COUNT(*) FROM messages WHERE relationship_id=$1 AND sender_user_id!=$2 AND is_read=FALSE`,
      [relationshipId, userId]
    )
    return res.json({ messages: result.rows, unread: parseInt(unread.rows[0].count) })
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching messages', error: err.message })
  }
}

/* POST /api/messages */
const sendMessage = async (req, res) => {
  const { userId, relationshipId } = req.user
  if (!relationshipId) return res.status(400).json({ message: 'No relationship found' })

  const { content, mediaUrl, mediaType, replyToId } = req.body
  if (!content?.trim() && !mediaUrl) return res.status(400).json({ message: 'Content or media required' })

  try {
    let ins
    try {
      ins = await pool.query(
        `INSERT INTO messages (relationship_id, sender_user_id, content, media_url, media_type, reply_to_id)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [relationshipId, userId, content?.trim() || '', mediaUrl || null, mediaType || null, replyToId || null]
      )
    } catch (_) {
      /* Fall back if new columns not yet added */
      try {
        ins = await pool.query(
          `INSERT INTO messages (relationship_id, sender_user_id, content, media_url, media_type)
           VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [relationshipId, userId, content?.trim() || '', mediaUrl || null, mediaType || null]
        )
      } catch (__) {
        ins = await pool.query(
          `INSERT INTO messages (relationship_id, sender_user_id, content) VALUES ($1,$2,$3) RETURNING *`,
          [relationshipId, userId, content?.trim() || '']
        )
      }
    }
    const userRow = await pool.query(`SELECT display_name, avatar_url FROM users WHERE id=$1`, [userId])
    return res.status(201).json({ message: { ...ins.rows[0], ...userRow.rows[0] } })
  } catch (err) {
    return res.status(500).json({ message: 'Error sending message', error: err.message })
  }
}

/* PUT /api/messages/:id */
const editMessage = async (req, res) => {
  const { userId } = req.user
  const { id } = req.params
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ message: 'Content required' })
  try {
    const result = await pool.query(
      `UPDATE messages SET content=$1, is_edited=TRUE WHERE id=$2 AND sender_user_id=$3 RETURNING *`,
      [content.trim(), id, userId]
    )
    if (!result.rows.length) return res.status(403).json({ message: 'Not allowed' })
    return res.json({ message: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ message: 'Error editing message', error: err.message })
  }
}

/* DELETE /api/messages/:id */
const deleteMessage = async (req, res) => {
  const { userId } = req.user
  const { id } = req.params
  try {
    const result = await pool.query(
      `DELETE FROM messages WHERE id=$1 AND sender_user_id=$2 RETURNING id`,
      [id, userId]
    )
    if (!result.rows.length) return res.status(403).json({ message: 'Not allowed' })
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting message', error: err.message })
  }
}

/* PATCH /api/messages/read */
const markRead = async (req, res) => {
  const { userId, relationshipId } = req.user
  try {
    await pool.query(
      `UPDATE messages SET is_read=TRUE WHERE relationship_id=$1 AND sender_user_id!=$2 AND is_read=FALSE`,
      [relationshipId, userId]
    )
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ message: 'Error marking read', error: err.message })
  }
}

/* POST /api/messages/upload */
const uploadMessageMedia = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' })
  try {
    const mime = req.file.mimetype
    let resourceType = 'image'
    let mediaType = 'image'
    if (mime.startsWith('video/')) { resourceType = 'video'; mediaType = 'video' }
    else if (mime.startsWith('audio/')) { resourceType = 'video'; mediaType = 'audio' }
    else if (!mime.startsWith('image/')) { resourceType = 'raw'; mediaType = 'file' }

    const result = await uploadToCloudinary(req.file.buffer, resourceType, 'memento/messages')
    return res.json({
      url: result.secure_url,
      mediaType,
      originalName: req.file.originalname,
      size: req.file.size,
    })
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message })
  }
}

module.exports = { getMessages, sendMessage, editMessage, deleteMessage, markRead, uploadMessageMedia }
