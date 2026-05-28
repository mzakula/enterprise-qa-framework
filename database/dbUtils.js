const { Client } = require('pg');

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'automation',
  password: 'admin',
  port: 5432,
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