const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'wizfi_user',
  host: 'postgresql.wizfi.svc.cluster.local', // Internal DNS
  database: 'wizfi_db',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Ensure table exists
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT
      );
    `);
    // Insert default users if empty
    const res = await client.query('SELECT * FROM users LIMIT 1');
    if (res.rows.length === 0) {
      await client.query(
        'INSERT INTO users (username, password, name) VALUES ($1, $2, $3)',
        ['admin', 'admin123', 'Admin User']
      );
      await client.query(
        'INSERT INTO users (username, password, name) VALUES ($1, $2, $3)',
        ['wizfi', 'wizfi123', 'Wizfi Wisdom']
      );
    }
  } finally {
    client.release();
  }
};

initDb().catch(console.error);

// Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, name FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user by username
app.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'user-service' });
});

app.get('/', (req, res) => {
  res.send('Welcome to the User Service!');
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});