// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/index'); // Assuming this line IS active if db-test is to work

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Using basic cors for now
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is Running! (More than Ultra Minimal)');
});

// Let's make the /api/db-test route active for this test stage
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ message: 'DB connection OK', time: result.rows[0].now });
  } catch (error) {
    console.error('❌ DB test error:', error);
    res.status(500).json({ message: 'DB connection failed', error: error.message });
  }
});

// Your custom route files are NOT YET INCLUDED
const notationRoutes = require('./routes/notationRoutes');
const sequenceRoutes = require('./routes/sequenceRoutes');
app.use('/api/notations', notationRoutes);
// app.use('/api/sequences', sequenceRoutes);


// Global error handler (can be added back later)
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error Handler Caught:", err.stack || err);
//   res.status(err.status || 500).send({
//     message: err.message || 'Something went wrong!',
//   });
// });

app.listen(port, () => {
  console.log(`🚀 Server (from your working base) is running at http://localhost:${port}`);
});