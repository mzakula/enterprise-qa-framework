// Database helpers are intentionally simple to keep integration validation lightweight.
// The connection parameters are env-driven so test execution can support multiple environments.
// Local development can use .env, while CI should set real secrets through the runner environment.
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'automation'
});

async function connectDB() {
  await client.connect();
}

async function executeQuery(query) {
  const result = await client.query(query);
  return result.rows;
}

module.exports = {
  connectDB,
  executeQuery
};