const pool = require('../db/pool');
const cloudinary = require('../config/cloudinary');

const getVideoThumbnailUrl = (result) => {
  if (result.eager?.[0]?.secure_url) {
    return result.eager[0].secure_url;
  }
  return cloudinary.url(result.public_id, {
    resource_type: 'video',
    format: 'jpg',
    secure: true,
    transformation: [{ width: 400, crop: 'scale', start_offset: '0' }],
  });
};

const resolveVideoThumbnail = (publicId, thumbnailUrl, mediaUrl) => {
  if (
    thumbnailUrl &&
    thumbnailUrl !== mediaUrl &&
    !thumbnailUrl.includes('.mp4') &&
    !thumbnailUrl.includes('.webm') &&
    !thumbnailUrl.includes('.mov')
  ) {
    return thumbnailUrl;
  }
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    secure: true,
    transformation: [{ width: 400, crop: 'scale', start_offset: '0' }],
  });
};

// Helper to handle Cloudinary buffer uploads via streams
const uploadToCloudinary = (fileBuffer, folder, resourceType, eagerOptions = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
    };
    if (eagerOptions) {
      uploadOptions.eager = eagerOptions;
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    stream.end(fileBuffer);
  });
};

// POST /api/memories
const createMemory = async (req, res) => {
  const { title, body, memory_date, location, visibility = 'shared', tags } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required." });
  }

  const relationshipId = req.user.relationshipId;
  const userId = req.user.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert memory
    const memoryRes = await client.query(
      `INSERT INTO memories 
        (relationship_id, created_by_user_id, title, body, memory_date, location, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [relationshipId, userId, title, body, memory_date || null, location || null, visibility]
    );
    const memory = memoryRes.rows[0];
    const memoryId = memory.id;

    // Handle tags
    let processedTags = [];
    if (tags) {
      let tagsArray = [];
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = [];
      }

      if (Array.isArray(tagsArray)) {
        for (const tagName of tagsArray) {
          if (!tagName || typeof tagName !== 'string') continue;
          const cleanTagName = tagName.trim().toLowerCase();
          if (!cleanTagName) continue;

          // Insert tag
          const tagInsertRes = await client.query(
            `INSERT INTO tags (relationship_id, created_by_user_id, name)
             VALUES ($1, $2, $3)
             ON CONFLICT (relationship_id, name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id, name, color`,
            [relationshipId, userId, cleanTagName]
          );
          const tag = tagInsertRes.rows[0];

          // Link memory and tag
          await client.query(
            `INSERT INTO memory_tags (memory_id, tag_id, assigned_by_user_id)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [memoryId, tag.id, userId]
          );
          processedTags.push(tag);
        }
      }
    }

    // Handle file uploads
    const processedMedia = [];
    if (req.files) {
      // 1. Process images
      if (req.files.images) {
        let order = 0;
        for (const file of req.files.images) {
          const result = await uploadToCloudinary(
            file.buffer,
            `memento/${relationshipId}/images`,
            'image'
          );
          const mediaInsertRes = await client.query(
            `INSERT INTO media (memory_id, uploaded_by_user_id, public_id, media_url, thumbnail_url, media_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [memoryId, userId, result.public_id, result.secure_url, result.secure_url, 'image', order++]
          );
          processedMedia.push(mediaInsertRes.rows[0]);
        }
      }

      // 2. Process videos
      if (req.files.videos) {
        let order = 0;
        for (const file of req.files.videos) {
          const result = await uploadToCloudinary(
            file.buffer,
            `memento/${relationshipId}/videos`,
            'video',
            [{ width: 400, crop: 'scale', format: 'jpg' }]
          );
          const thumbnailUrl = getVideoThumbnailUrl(result);
          const mediaInsertRes = await client.query(
            `INSERT INTO media (memory_id, uploaded_by_user_id, public_id, media_url, thumbnail_url, media_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [memoryId, userId, result.public_id, result.secure_url, thumbnailUrl, 'video', order++]
          );
          processedMedia.push(mediaInsertRes.rows[0]);
        }
      }

      // 3. Process audio
      if (req.files.audio) {
        let order = 0;
        for (const file of req.files.audio) {
          const result = await uploadToCloudinary(
            file.buffer,
            `memento/${relationshipId}/audio`,
            'video'
          );
          const mediaInsertRes = await client.query(
            `INSERT INTO media (memory_id, uploaded_by_user_id, public_id, media_url, thumbnail_url, media_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [memoryId, userId, result.public_id, result.secure_url, null, 'audio', order++]
          );
          processedMedia.push(mediaInsertRes.rows[0]);
        }
      }
    }

    await client.query('COMMIT');
    client.release();

    return res.status(201).json({
      memory,
      media: processedMedia,
      tags: processedTags
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    return res.status(500).json({
      message: "An error occurred while creating memory",
      error: err.message
    });
  }
};

// GET /api/memories
const getMemories = async (req, res) => {
  const relationshipId = req.user.relationshipId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const type = req.query.type || '';

  const offset = (page - 1) * limit;

  try {
    let queryValues = [relationshipId];
    let queryIndex = 2;

    let whereClause = `WHERE m.relationship_id = $1 AND m.is_archived = false`;

    if (search) {
      whereClause += ` AND (m.title ILIKE $${queryIndex} OR m.body ILIKE $${queryIndex})`;
      queryValues.push(`%${search}%`);
      queryIndex++;
    }

    if (type) {
      whereClause += ` AND EXISTS (SELECT 1 FROM media med WHERE med.memory_id = m.id AND med.media_type = $${queryIndex})`;
      queryValues.push(type);
      queryIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM memories m ${whereClause}`;
    const countRes = await pool.query(countQuery, queryValues);
    const total = parseInt(countRes.rows[0].count);

    // Get memories
    const memoriesQuery = `
      SELECT m.*, u.display_name as created_by_name,
      (SELECT CASE med.media_type
         WHEN 'image' THEN med.media_url
         WHEN 'video' THEN med.thumbnail_url
       END
       FROM media med
       WHERE med.memory_id = m.id AND med.media_type IN ('image', 'video')
       ORDER BY CASE med.media_type WHEN 'image' THEN 0 WHEN 'video' THEN 1 END,
                med.sort_order ASC
       LIMIT 1) as cover_image,
      (SELECT med.media_type FROM media med
       WHERE med.memory_id = m.id AND med.media_type IN ('image', 'video')
       ORDER BY CASE med.media_type WHEN 'image' THEN 0 WHEN 'video' THEN 1 END,
                med.sort_order ASC
       LIMIT 1) as cover_type,
      (SELECT med.public_id FROM media med
       WHERE med.memory_id = m.id AND med.media_type = 'video'
       ORDER BY med.sort_order ASC
       LIMIT 1) as cover_video_public_id
      FROM memories m
      JOIN users u ON u.id = m.created_by_user_id
      ${whereClause}
      ORDER BY m.memory_date DESC NULLS LAST, m.created_at DESC
      LIMIT $${queryIndex} OFFSET $${queryIndex + 1}
    `;

    queryValues.push(limit, offset);
    const memoriesRes = await pool.query(memoriesQuery, queryValues);

    const memories = memoriesRes.rows.map((memory) => {
      if (memory.cover_type === 'video' && memory.cover_video_public_id) {
        return {
          ...memory,
          cover_image: resolveVideoThumbnail(
            memory.cover_video_public_id,
            memory.cover_image,
            null
          ),
        };
      }
      return memory;
    });

    return res.status(200).json({
      memories,
      total,
      page,
      limit
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred fetching memories",
      error: err.message
    });
  }
};

// GET /api/memories/:id
const getMemory = async (req, res) => {
  const { id } = req.params;
  const relationshipId = req.user.relationshipId;

  try {
    const memoryRes = await pool.query(
      `SELECT m.*, u.display_name AS created_by_name, u.avatar_url AS created_by_avatar
       FROM memories m
       JOIN users u ON u.id = m.created_by_user_id
       WHERE m.id = $1 AND m.relationship_id = $2 AND m.is_archived = false`,
      [id, relationshipId]
    );

    if (memoryRes.rows.length === 0) {
      return res.status(404).json({ message: "Memory not found" });
    }

    const memory = memoryRes.rows[0];

    // Media
    const mediaRes = await pool.query(
      `SELECT * FROM media WHERE memory_id = $1 ORDER BY sort_order`,
      [id]
    );

    // Tags
    const tagsRes = await pool.query(
      `SELECT t.* FROM tags t
       JOIN memory_tags mt ON mt.tag_id = t.id
       WHERE mt.memory_id = $1`,
      [id]
    );

    // Comments
    const commentsRes = await pool.query(
      `SELECT c.*, u.display_name, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.author_user_id
       WHERE c.memory_id = $1 ORDER BY c.created_at ASC`,
      [id]
    );

    // Reactions
    const reactionsRes = await pool.query(
      `SELECT r.*, u.display_name
       FROM reactions r
       JOIN users u ON u.id = r.user_id
       WHERE r.memory_id = $1`,
      [id]
    );

    const media = mediaRes.rows.map((item) => {
      if (item.media_type !== 'video') return item;
      return {
        ...item,
        thumbnail_url: resolveVideoThumbnail(item.public_id, item.thumbnail_url, item.media_url),
      };
    });

    return res.status(200).json({
      ...memory,
      media,
      tags: tagsRes.rows,
      comments: commentsRes.rows,
      reactions: reactionsRes.rows
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred fetching memory details",
      error: err.message
    });
  }
};

// PATCH /api/memories/:id
const updateMemory = async (req, res) => {
  const { id } = req.params;
  const relationshipId = req.user.relationshipId;
  const userId = req.user.userId;
  const { title, body, memory_date, location, visibility, tags } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required." });
  }

  const client = await pool.connect();
  try {
    const checkRes = await client.query(
      `SELECT id FROM memories WHERE id = $1 AND relationship_id = $2 AND is_archived = false`,
      [id, relationshipId]
    );
    if (checkRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "Memory not found" });
    }

    await client.query('BEGIN');

    // Update memory
    const updateRes = await client.query(
      `UPDATE memories 
       SET title = $1, body = $2, memory_date = $3, location = $4, visibility = $5, updated_at = NOW()
       WHERE id = $6 AND relationship_id = $7
       RETURNING *`,
      [title, body, memory_date || null, location || null, visibility || 'shared', id, relationshipId]
    );

    const memory = updateRes.rows[0];

    // Replace tags
    await client.query(`DELETE FROM memory_tags WHERE memory_id = $1`, [id]);

    let processedTags = [];
    if (tags) {
      let tagsArray = [];
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        tagsArray = [];
      }

      if (Array.isArray(tagsArray)) {
        for (const tagName of tagsArray) {
          if (!tagName || typeof tagName !== 'string') continue;
          const cleanTagName = tagName.trim().toLowerCase();
          if (!cleanTagName) continue;

          const tagInsertRes = await client.query(
            `INSERT INTO tags (relationship_id, created_by_user_id, name)
             VALUES ($1, $2, $3)
             ON CONFLICT (relationship_id, name) DO UPDATE SET name = EXCLUDED.name
             RETURNING id, name, color`,
            [relationshipId, userId, cleanTagName]
          );
          const tag = tagInsertRes.rows[0];

          await client.query(
            `INSERT INTO memory_tags (memory_id, tag_id, assigned_by_user_id)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [id, tag.id, userId]
          );
          processedTags.push(tag);
        }
      }
    }

    await client.query('COMMIT');
    client.release();

    return res.status(200).json({
      ...memory,
      tags: processedTags
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    return res.status(500).json({
      message: "An error occurred updating memory",
      error: err.message
    });
  }
};

// DELETE /api/memories/:id
const deleteMemory = async (req, res) => {
  const { id } = req.params;
  const relationshipId = req.user.relationshipId;
  const userId = req.user.userId;

  try {
    const memoryRes = await pool.query(
      `SELECT created_by_user_id FROM memories WHERE id = $1 AND relationship_id = $2 AND is_archived = false`,
      [id, relationshipId]
    );

    if (memoryRes.rows.length === 0) {
      return res.status(404).json({ message: "Memory not found or does not belong to relationship" });
    }

    const memory = memoryRes.rows[0];

    if (memory.created_by_user_id !== userId) {
      return res.status(403).json({ message: "Only the partner who created this memory can delete it" });
    }

    await pool.query(
      `UPDATE memories SET is_archived = true, updated_at = NOW()
       WHERE id = $1 AND relationship_id = $2`,
      [id, relationshipId]
    );

    return res.status(200).json({ message: "Memory deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred deleting memory",
      error: err.message
    });
  }
};

// DELETE /api/media/:mediaId
const deleteMedia = async (req, res) => {
  const { mediaId } = req.params;
  const relationshipId = req.user.relationshipId;
  const userId = req.user.userId;

  try {
    const mediaRes = await pool.query(
      `SELECT m.*, mem.relationship_id 
       FROM media m
       JOIN memories mem ON mem.id = m.memory_id
       WHERE m.id = $1`,
      [mediaId]
    );

    if (mediaRes.rows.length === 0) {
      return res.status(404).json({ message: "Media not found" });
    }

    const media = mediaRes.rows[0];

    if (media.relationship_id !== relationshipId) {
      return res.status(403).json({ message: "Unauthorized to delete this media" });
    }

    if (media.uploaded_by_user_id !== userId) {
      return res.status(403).json({ message: "Only the partner who uploaded this file can delete it" });
    }

    const resourceType = media.media_type === 'image' ? 'image' : 'video';
    await cloudinary.uploader.destroy(media.public_id, { resource_type: resourceType });

    await pool.query(`DELETE FROM media WHERE id = $1`, [mediaId]);

    return res.status(200).json({ message: "Media deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred deleting media",
      error: err.message
    });
  }
};

// POST /api/memories/:id/comments
const addComment = async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  const userId = req.user.userId;
  const relationshipId = req.user.relationshipId;

  if (!body || !body.trim()) {
    return res.status(400).json({ message: "Comment body is required" });
  }

  try {
    const memCheck = await pool.query(
      `SELECT id FROM memories WHERE id = $1 AND relationship_id = $2 AND is_archived = false`,
      [id, relationshipId]
    );

    if (memCheck.rows.length === 0) {
      return res.status(404).json({ message: "Memory not found" });
    }

    const commentInsert = await pool.query(
      `INSERT INTO comments (memory_id, author_user_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, body.trim()]
    );
    const newComment = commentInsert.rows[0];

    const userRes = await pool.query(
      `SELECT display_name, avatar_url FROM users WHERE id = $1`,
      [userId]
    );
    const user = userRes.rows[0];

    return res.status(201).json({
      ...newComment,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred adding comment",
      error: err.message
    });
  }
};

// POST /api/memories/:id/media
const addMediaToMemory = async (req, res) => {
  const { id } = req.params;
  const relationshipId = req.user.relationshipId;
  const userId = req.user.userId;

  try {
    const checkRes = await pool.query(
      `SELECT id FROM memories WHERE id = $1 AND relationship_id = $2 AND is_archived = false`,
      [id, relationshipId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: "Memory not found" });
    }

    const maxOrderRes = await pool.query(
      `SELECT COALESCE(MAX(sort_order), -1) as max_order FROM media WHERE memory_id = $1`,
      [id]
    );
    let order = maxOrderRes.rows[0].max_order + 1;

    const processedMedia = [];
    if (req.files) {
      // Process images
      if (req.files.images) {
        for (const file of req.files.images) {
          const result = await uploadToCloudinary(
            file.buffer,
            `memento/${relationshipId}/images`,
            'image'
          );
          const mediaInsertRes = await pool.query(
            `INSERT INTO media (memory_id, uploaded_by_user_id, public_id, media_url, thumbnail_url, media_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, userId, result.public_id, result.secure_url, result.secure_url, 'image', order++]
          );
          processedMedia.push(mediaInsertRes.rows[0]);
        }
      }

      // Process videos
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const result = await uploadToCloudinary(
            file.buffer,
            `memento/${relationshipId}/videos`,
            'video',
            [{ width: 400, crop: 'scale', format: 'jpg' }]
          );
          const thumbnailUrl = getVideoThumbnailUrl(result);
          const mediaInsertRes = await pool.query(
            `INSERT INTO media (memory_id, uploaded_by_user_id, public_id, media_url, thumbnail_url, media_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, userId, result.public_id, result.secure_url, thumbnailUrl, 'video', order++]
          );
          processedMedia.push(mediaInsertRes.rows[0]);
        }
      }

      // Process audio
      if (req.files.audio) {
        for (const file of req.files.audio) {
          const result = await uploadToCloudinary(
            file.buffer,
            `memento/${relationshipId}/audio`,
            'video'
          );
          const mediaInsertRes = await pool.query(
            `INSERT INTO media (memory_id, uploaded_by_user_id, public_id, media_url, thumbnail_url, media_type, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, userId, result.public_id, result.secure_url, null, 'audio', order++]
          );
          processedMedia.push(mediaInsertRes.rows[0]);
        }
      }
    }

    return res.status(200).json({ media: processedMedia });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred adding media to memory",
      error: err.message
    });
  }
};

// GET /api/memories/photos — all image URLs for the relationship
const getAllPhotos = async (req, res) => {
  const { relationshipId } = req.user;
  try {
    const result = await pool.query(
      `SELECT med.media_url AS url, med.thumbnail_url, m.title AS memory_title, m.id AS memory_id
       FROM media med
       JOIN memories m ON med.memory_id = m.id
       WHERE m.relationship_id = $1
         AND m.is_archived = false
         AND med.media_type = 'image'
       ORDER BY m.memory_date DESC NULLS LAST, med.sort_order ASC`,
      [relationshipId]
    );
    return res.status(200).json({ photos: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching photos', error: err.message });
  }
};

module.exports = {
  createMemory,
  getMemories,
  getMemory,
  updateMemory,
  deleteMemory,
  deleteMedia,
  addComment,
  addMediaToMemory,
  getAllPhotos,
};
