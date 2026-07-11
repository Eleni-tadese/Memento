const pool = require('../db/pool')

/* ── GET /api/letters ── list all saved conversations for the couple */
const getLetters = async (req, res) => {
  try {
    const { relationshipId } = req.user
    const { rows } = await pool.query(
      `SELECT l.*,
        COALESCE((SELECT COUNT(*)::int FROM letter_messages lm WHERE lm.letter_id = l.id), 0) AS message_count,
        (SELECT lm.text FROM letter_messages lm WHERE lm.letter_id = l.id ORDER BY lm.position LIMIT 1) AS preview,
        (SELECT lm.sender FROM letter_messages lm WHERE lm.letter_id = l.id ORDER BY lm.position LIMIT 1) AS preview_sender
       FROM letters l
       WHERE l.relationship_id = $1
       ORDER BY l.is_pinned DESC, l.letter_date DESC`,
      [relationshipId]
    )
    res.json(rows)
  } catch (err) {
    console.error('getLetters ERROR:', err.message)
    if (err.message && err.message.includes('relation') && err.message.includes('does not exist')) {
      return res.status(503).json({ error: 'The conversations table does not exist yet. Please run the SQL setup in your Neon console.' })
    }
    res.status(500).json({ error: err.message || 'Failed to fetch saved conversations' })
  }
}

/* ── GET /api/letters/:id ── single conversation with all messages */
const getLetter = async (req, res) => {
  try {
    const { relationshipId } = req.user
    const { id } = req.params

    const [letterRes, messagesRes] = await Promise.all([
      pool.query('SELECT * FROM letters WHERE id=$1 AND relationship_id=$2', [id, relationshipId]),
      pool.query('SELECT * FROM letter_messages WHERE letter_id=$1 ORDER BY position', [id]),
    ])

    if (!letterRes.rows.length) return res.status(404).json({ error: 'Conversation not found' })

    res.json({ ...letterRes.rows[0], messages: messagesRes.rows })
  } catch (err) {
    console.error('getLetter:', err.message)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
}

/* ── POST /api/letters ── create a new saved conversation */
const createLetter = async (req, res) => {
  try {
    const { relationshipId, userId } = req.user

    if (!relationshipId) {
      return res.status(400).json({ error: 'You need to be in a relationship space to save conversations. Please register or re-login.' })
    }

    const { title, letter_date, mood = 'romantic', label = null, messages = [] } = req.body

    if (!title || !letter_date) {
      return res.status(400).json({ error: 'Title and date are required' })
    }

    const { rows } = await pool.query(
      `INSERT INTO letters (relationship_id, created_by_user_id, title, letter_date, mood, label)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [relationshipId, userId, title, letter_date, mood, label]
    )
    const letter = rows[0]

    for (let i = 0; i < messages.length; i++) {
      const { sender, text, msg_time = '00:00' } = messages[i]
      await pool.query(
        `INSERT INTO letter_messages (letter_id, sender, text, msg_time, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [letter.id, sender, text.trim(), msg_time, i]
      )
    }

    res.status(201).json(letter)
  } catch (err) {
    console.error('createLetter ERROR:', err.message)
    if (err.message && (err.message.includes('relation') && err.message.includes('does not exist'))) {
      return res.status(503).json({ error: 'The conversations table does not exist yet. Please run the SQL setup in your Neon console.' })
    }
    res.status(500).json({ error: err.message || 'Failed to save conversation' })
  }
}

/* ── PUT /api/letters/:id ── update a conversation's details and messages */
const updateLetter = async (req, res) => {
  try {
    const { relationshipId } = req.user
    const { id } = req.params
    const { title, letter_date, mood, label, messages } = req.body

    const { rows } = await pool.query(
      `UPDATE letters
         SET title=$1, letter_date=$2, mood=$3, label=$4, updated_at=NOW()
       WHERE id=$5 AND relationship_id=$6
       RETURNING *`,
      [title, letter_date, mood, label || null, id, relationshipId]
    )

    if (!rows.length) return res.status(404).json({ error: 'Conversation not found' })

    if (Array.isArray(messages)) {
      await pool.query('DELETE FROM letter_messages WHERE letter_id=$1', [id])
      for (let i = 0; i < messages.length; i++) {
        const { sender, text, msg_time = '00:00' } = messages[i]
        await pool.query(
          `INSERT INTO letter_messages (letter_id, sender, text, msg_time, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, sender, text.trim(), msg_time, i]
        )
      }
    }

    res.json(rows[0])
  } catch (err) {
    console.error('updateLetter:', err.message)
    res.status(500).json({ error: 'Failed to update conversation' })
  }
}

/* ── DELETE /api/letters/:id ── delete a conversation */
const deleteLetter = async (req, res) => {
  try {
    const { relationshipId } = req.user
    const { id } = req.params
    await pool.query('DELETE FROM letters WHERE id=$1 AND relationship_id=$2', [id, relationshipId])
    res.json({ ok: true })
  } catch (err) {
    console.error('deleteLetter:', err.message)
    res.status(500).json({ error: 'Failed to delete conversation' })
  }
}

/* ── PATCH /api/letters/:id/pin ── pin / unpin (only one pinned at a time) */
const pinLetter = async (req, res) => {
  try {
    const { relationshipId } = req.user
    const { id } = req.params
    const pin = req.body.pin !== false

    if (pin) {
      await pool.query('UPDATE letters SET is_pinned=FALSE WHERE relationship_id=$1', [relationshipId])
    }

    const { rows } = await pool.query(
      'UPDATE letters SET is_pinned=$1, updated_at=NOW() WHERE id=$2 AND relationship_id=$3 RETURNING *',
      [pin, id, relationshipId]
    )

    res.json(rows[0] || { id, is_pinned: pin })
  } catch (err) {
    console.error('pinLetter:', err.message)
    res.status(500).json({ error: 'Failed to pin conversation' })
  }
}

module.exports = { getLetters, getLetter, createLetter, updateLetter, deleteLetter, pinLetter }
