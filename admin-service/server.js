const express = require('express');
const dotenv = require('dotenv');
const authMiddleware = require('./auth-middleware');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

app.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    service: 'admin-service',
    user: req.user.username,
    metrics: {
      users: 1280,
      activeSessions: 213,
      revenue: '$9,540'
    }
  });
});

app.get('/health', (req, res) => res.send('Admin service is healthy'));

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});
