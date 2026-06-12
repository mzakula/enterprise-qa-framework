// Database helpers are intentionally simple to keep integration validation lightweight.
// The connection parameters are env-driven so test execution can support multiple environments.
// Local development can use .env, while CI should set real secrets through the runner environment.
require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

if (!process.env.DB_PASSWORD) {
  logger.warn('DB_PASSWORD is not set – database connections will fail unless configured via .env or environment variables');
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'automation',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
});

async function connectDB() {
  const client = await pool.connect();
  client.release();
}

async function closeDB() {
  try {
    await pool.end();
  } catch (err) {
    // Log errors during close without masking test failures.
    logger.error('Error closing DB pool', { error: err });
  }
}

async function executeQuery(query, params = []) {
  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = {
  connectDB,
  executeQuery,
  // CHANGED: Exported `closeDB` so tests can explicitly close the connection
  closeDB
};