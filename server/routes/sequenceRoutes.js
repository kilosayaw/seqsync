// server/routes/sequenceRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/index');

// POST /api/sequences - Create a new sequence with its notations
router.post('/', async (req, res) => {
  const { name, description, bpm, time_signature, notations /*, userId (later) */ } = req.body;

  if (!notations || !Array.isArray(notations) || notations.length === 0) {
    return res.status(400).json({ message: 'A non-empty notations array is required.' });
  }

  const client = await db.pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query('BEGIN');

    const sequenceQuery = `
      INSERT INTO sequences (name, description, bpm, time_signature /*, user_id */)
      VALUES ($1, $2, $3, $4 /*, $5 */)
      RETURNING id, name, bpm, time_signature, created_at;
    `;
    const sequenceValues = [
      name || 'Untitled Sequence',
      description || null,
      bpm || 120,
      time_signature || '4/4',
      /* userId || null */
    ];
    const sequenceResult = await client.query(sequenceQuery, sequenceValues);
    const newSequence = sequenceResult.rows[0];
    const sequenceId = newSequence.id;

    const insertedNotations = [];
    // Using Promise.all for concurrent insertion of notations
    const notationPromises = notations.map(note => {
      const notationQuery = `
        INSERT INTO notations (sequence_id, timecode, joint, rotation, vector_x, vector_y, vector_z, ground_point, intent, energy)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const noteValues = [
        sequenceId,
        note.time || note.timecode || `step_${notations.indexOf(note)}`, // Fallback time
        note.joint,
        note.rotation || null,
        note.vector ? (note.vector[0] ?? 0) : (note.vector_x ?? 0),
        note.vector ? (note.vector[1] ?? 0) : (note.vector_y ?? 0),
        note.vector ? (note.vector[2] ?? 0) : (note.vector_z ?? 0),
        note.ground || note.ground_point || null,
        note.intent || null,
        note.energy || null
      ];
      return client.query(notationQuery, noteValues);
    });

    const results = await Promise.all(notationPromises);
    results.forEach(result => insertedNotations.push(result.rows[0]));

    await client.query('COMMIT');
    console.log(`✅ Sequence '${newSequence.name}' (ID: ${sequenceId}) and ${insertedNotations.length} notations created.`);
    res.status(201).json({
      message: 'Sequence created successfully',
      sequence: newSequence,
      notations: insertedNotations,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating sequence:', error);
    res.status(500).json({ message: 'Error creating sequence', error: error.message });
  } finally {
    client.release();
  }
});

// GET /api/sequences - Get all sequences (metadata only for list view)
router.get('/', async (req, res) => {
    try {
        // For a list view, you might not want to fetch all notations for all sequences
        const result = await db.query('SELECT id, name, bpm, time_signature, description, created_at, updated_at FROM sequences ORDER BY updated_at DESC LIMIT 100');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching sequences:', error);
        res.status(500).json({ message: 'Error fetching sequences', error: error.message });
    }
});

// GET /api/sequences/:id - Get a single sequence with all its notations
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid sequence ID.' });
    }
    try {
        const sequenceResult = await db.query('SELECT * FROM sequences WHERE id = $1', [id]);
        if (sequenceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Sequence not found' });
        }
        // Fetch associated notations, ordered by their creation or an explicit order column if you add one
        const notationsResult = await db.query('SELECT * FROM notations WHERE sequence_id = $1 ORDER BY id ASC', [id]); // Or timecode, or a step_index

        res.status(200).json({
            sequence: sequenceResult.rows[0],
            notations: notationsResult.rows
        });
    } catch (error) {
        console.error(`❌ Error fetching sequence ${id}:`, error);
        res.status(500).json({ message: 'Error fetching sequence details', error: error.message });
    }
});

// TODO LATER: Add PUT /api/sequences/:id (Update sequence metadata and/or its notations)
// TODO LATER: Add DELETE /api/sequences/:id (Delete a sequence and its notations - consider cascade options)

module.exports = router;