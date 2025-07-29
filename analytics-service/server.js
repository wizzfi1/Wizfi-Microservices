const express = require('express');
const dotenv = require('dotenv');
const authMiddleware = require('./auth-middleware');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.post('/track', authMiddleware, (req, res) => {
  const { event, data } = req.body;
  console.log(`[Analytics] ${event} by ${req.user.username}`, data);
  res.json({ status: 'logged' });
});

app.get('/health', (req, res) => res.send('Analytics service is healthy'));

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});
