const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;
const HOST = process.env.HOST || '0.0.0.0';

// Configure base path from environment or use '/frontend' as default
const BASE_PATH = process.env.BASE_PATH || '/frontend';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'wizfi-secret',
  resave: false,
  saveUninitialized: true,
}));

// Unified health check
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({
    status: 'UP',
    details: 'Frontend service healthy'
  });
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect(`${BASE_PATH}/login`);
});

// Login page
app.get(`${BASE_PATH}/login`, (req, res) => {
  res.render('login', { error: null });
});

// Login submit
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

// Dashboard
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

app.listen(PORT, HOST, () => {
  console.log(`Frontend running on http://${HOST}:${PORT}${BASE_PATH}`);
});
