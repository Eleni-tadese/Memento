const pool = require('../db/pool');

// GET /api/public/preview
// No auth. Returns up to 12 random shared images for the landing page mosaic.
// Only exposes { id, media_url, thumbnail_url } — no user/memory/relationship data.
const getPreview = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT me.id, me.media_url, me.thumbnail_url
       FROM media me
       JOIN memories m ON m.id = me.memory_id
       WHERE me.media_type = 'image'
         AND m.visibility = 'shared'
         AND m.is_archived = false
       ORDER BY RANDOM()
       LIMIT 12`
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    // Never break the landing page — return an empty array on failure.
    return res.status(200).json([]);
  }
};

module.exports = { getPreview };
