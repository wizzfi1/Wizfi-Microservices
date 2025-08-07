const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fs = require('fs');
const authMiddleware = require('./auth-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Load JWT secret
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && fs.existsSync('/run/secrets/jwt_secret')) {
  jwtSecret = fs.readFileSync('/run/secrets/jwt_secret', 'utf8').trim();
}
if (!jwtSecret) {
  console.error('JWT_SECRET is not set');
  process.exit(1);
}

app.use(express.json());

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userRes = await axios.get(`${process.env.USER_SERVICE_URL}/users/${username}`);
    const user = userRes.data;

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err.message || err.response?.data || err);
    return res.status(401).json({ error: 'User not found', details: err.message });
  }
});

app.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return res.status(200).json({ valid: true, decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}`,
    userId: req.user.userId
  });
});

app.get('/health', (req, res) => res.send('Auth service is healthy'));

app.get('/', (req, res) => {
  res.send('Welcome to the Auth Service');
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
