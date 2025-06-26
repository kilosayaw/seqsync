// server/config/index.js
require('dotenv').config(); // Loads .env variables from the server's root directory
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// Use environment variables from your .env file (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT)
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false, // Adjust SSL for production if needed
});

pool.on('connect', () => {
  console.log('✅ Successfully connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1); // Exit the process if the DB connection is critically failing
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exporting the pool itself in case direct client checkout is needed (like for transactions)
};