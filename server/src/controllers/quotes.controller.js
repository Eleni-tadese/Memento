const pool = require('../db/pool')

/* Couple quotes are stored on the relationship itself (a JSONB column) so they
   are strictly scoped to one couple and shared between both partners. This is
   the security fix for quotes leaking across accounts on a shared browser. */

const isMissingColumn = (err) =>
  err && err.message && err.message.toLowerCase().includes('column') && err.message.includes('quotes')

const sanitize = (quotes) =>
  (Array.isArray(quotes) ? quotes : [])
    .filter((q) => q && typeof q.text === 'string' && q.text.trim())
    .map((q) => ({
      text: String(q.text).trim().slice(0, 2000),
      author: String(q.author || '').trim().slice(0, 200),
    }))

/* ── GET /api/quotes ── all saved quotes for the logged-in couple */
const getQuotes = async (req, res) => {
  try {
    const { relationshipId } = req.user
    if (!relationshipId) return res.json({ quotes: [] })

    const { rows } = await pool.query('SELECT quotes FROM relationships WHERE id = $1', [relationshipId])
    const quotes = rows[0]?.quotes
    res.json({ quotes: Array.isArray(quotes) ? quotes : [] })
  } catch (err) {
    console.error('getQuotes ERROR:', err.message)
    if (isMissingColumn(err)) {
      return res.status(503).json({ error: 'The quotes column does not exist yet. Please run the SQL setup in your Neon console.', needsSetup: true })
    }
    res.status(500).json({ error: err.message || 'Failed to load quotes' })
  }
}

/* ── PUT /api/quotes ── replace the couple's quotes with the given array */
const saveQuotes = async (req, res) => {
  try {
    const { relationshipId } = req.user
    if (!relationshipId) {
      return res.status(400).json({ error: 'You need to be in a relationship space to save quotes.' })
    }

    const clean = sanitize(req.body.quotes)
    const { rows } = await pool.query(
      'UPDATE relationships SET quotes = $1 WHERE id = $2 RETURNING quotes',
      [JSON.stringify(clean), relationshipId]
    )
    res.json({ quotes: Array.isArray(rows[0]?.quotes) ? rows[0].quotes : clean })
  } catch (err) {
    console.error('saveQuotes ERROR:', err.message)
    if (isMissingColumn(err)) {
      return res.status(503).json({ error: 'The quotes column does not exist yet. Please run the SQL setup in your Neon console.', needsSetup: true })
    }
    res.status(500).json({ error: err.message || 'Failed to save quotes' })
  }
}

module.exports = { getQuotes, saveQuotes }
