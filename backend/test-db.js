// SEGSYNC/backend/test-db.js
require('dotenv').config(); // To load your .env file
const { Pool } = require('pg');

console.log('Attempting direct DB connection test...');
console.log('DATABASE_URL from .env:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // This MUST be correct and include ?sslmode=require
  ssl: {
    rejectUnauthorized: true, // Production-like setting
  },
  // connectionTimeoutMillis: 5000, // Optional: Add a timeout
  // query_timeout: 5000,
  // statement_timeout: 5000
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('🔴🔴🔴 TEST SCRIPT - Connection Error:', err.message);
    console.error('Full error object:', err);
  } else {
    console.log('🟢🟢🟢 TEST SCRIPT - Connected Successfully! Server Time:', res.rows[0].now);
  }
  pool.end(); // Close the pool
});

pool.on('error', (err) => {
    console.error('🔴🔴🔴 TEST SCRIPT - Unexpected error on idle client in pool', err);
});