const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

// Configure base path from environment or use '/frontend' as default
const BASE_PATH = process.env.BASE_PATH || '';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'wizfi-secret',
  resave: false,
  saveUninitialized: true,
}));

// Health check at root path for Kubernetes probes
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    details: 'Frontend service healthy'
  });
});

// Root redirect - now using BASE_PATH
app.get('/', (req, res) => {
  res.redirect(`${BASE_PATH}/login`);
});

// Show login page
app.get(`${BASE_PATH}/login`, (req, res) => {
  res.render('login', { error: null });
});

// Submit login form
app.post(`${BASE_PATH}/login`, async (req, res) => {
  const { username, password } = req.body;

  try {
    const loginRes = await axios.post(`${process.env.AUTH_SERVICE_URL}/login`, {
      username,
      password,
    });

    req.session.token = loginRes.data.token;
    req.session.user = loginRes.data.user;
    res.redirect(`${BASE_PATH}/dashboard`);
  } catch (err) {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Protected dashboard
app.get(`${BASE_PATH}/dashboard`, async (req, res) => {
  if (!req.session.token) return res.redirect(`${BASE_PATH}/login`);

  try {
    const dashRes = await axios.get(`${process.env.ADMIN_SERVICE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${req.session.token}`
      }
    });

    res.render('dashboard', {
      user: req.session.user,
      data: dashRes.data
    });
  } catch (err) {
    res.status(500).send('Failed to load dashboard');
  }
});

// Additional health check at prefixed path for backward compatibility
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({
    status: 'UP',
    details: 'Frontend service healthy'
  });
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
  console.log(`Using base path: '${BASE_PATH}'`);
});