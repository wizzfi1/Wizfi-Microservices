const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'wizfi-secret',
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
  res.redirect('/frontend/login');  // Or serve a landing page
});
// Show login page
app.get('/frontend/login', (req, res) => {
  res.render('login', { error: null });
});

// Submit login form
app.post('/frontend/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const loginRes = await axios.post(`${process.env.AUTH_SERVICE_URL}/login`, {
      username,
      password,
    });

    req.session.token = loginRes.data.token;
    req.session.user = loginRes.data.user;
    res.redirect('/frontend/dashboard');
  } catch (err) {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Protected dashboard
app.get('/frontend/dashboard', async (req, res) => {
  if (!req.session.token) return res.redirect('/frontend/login');

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

// Health check should return JSON for Kubernetes
app.get('/frontend/health', (req, res) => {
  res.json({
    status: 'UP',
    details: 'Frontend service healthy'
  });
});
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
