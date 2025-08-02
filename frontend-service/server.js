const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.set('view engine', 'ejs');

app.get('/frontend', (req, res) => {
  res.send(`<h1>Welcome to Wizfi Microservices UI</h1>`);
});

app.get('/frontend/dashboard', async (req, res) => {
  try {
    const jwt = req.headers.authorization;

    const adminRes = await axios.get('https://wizfiservices.duckdns.org/admin/dashboard', {
      headers: { Authorization: jwt }
    });

    res.json(adminRes.data);
  } catch (err) {
    res.status(500).send('Failed to load dashboard');
  }
});

app.get('/frontend/health', (req, res) => res.send('Frontend is healthy'));

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
