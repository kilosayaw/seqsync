// server/routes/notationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/index'); // Use the centralized db config

// POST /api/notations - Create a single notation
router.post('/', async (req, res) => {
  try {
    const {
      time,
      timecode,
      timecode_ms,
      joint,
      rotation,
      vector,
      vector_x,
      vector_y,
      vector_z,
      ground_point,
      ground,
      intent,
      energy,
      sequence_id, // Allow associating with a sequence directly if provided
    } = req.body;

    const vx = vector_x ?? (vector?.[0] ?? 0);
    const vy = vector_y ?? (vector?.[1] ?? 0);
    const vz = vector_z ?? (vector?.[2] ?? 0);
    const timeVal = timecode ?? time;
    const groundVal = ground_point ?? ground;

    // Adjust validation as needed, some fields might be optional for a single notation
    if (!timeVal || !joint) { // Example: only time and joint are strictly required for a bare notation
      return res.status(400).json({ message: 'Timecode/time and joint are required for a notation.' });
    }

    const insertQuery = `
      INSERT INTO notations (
        timecode, timecode_ms, joint, rotation,
        vector_x, vector_y, vector_z,
        ground_point, intent, energy, sequence_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      timeVal,
      typeof timecode_ms === 'number' ? timecode_ms : null,
      joint,
      rotation || null, // Allow optional fields
      vx,
      vy,
      vz,
      groundVal || null,
      intent || null,
      energy || null,
      sequence_id || null // Can be null if it's an unattached notation
    ];

    const result = await db.query(insertQuery, values);
    console.log('✅ Notation inserted via /api/notations:', result.rows[0]);
    res.status(201).json({ message: 'Notation saved successfully', data: result.rows[0] });

  } catch (error) {
    console.error('❌ Error inserting notation via /api/notations:', error);
    res.status(500).json({ message: 'Failed to insert notation', error: error.message });
  }
});

// GET /api/notations - Fetch all notations (or with filters later)
router.get('/', async (req, res) => {
  try {
    // TODO: Add pagination and filtering capabilities later
    const result = await db.query('SELECT * FROM notations ORDER BY created_at DESC LIMIT 100');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching notations via /api/notations:', error);
    res.status(500).json({ message: 'Failed to fetch notations', error: error.message });
  }
});

module.exports = router;