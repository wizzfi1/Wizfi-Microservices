const express = require('express');
const dotenv = require('dotenv');
const authMiddleware = require('./auth-middleware');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.post('/charge', authMiddleware, (req, res) => {
  res.json({ status: 'success', amount: 49, user: req.user.username });
});

app.get('/health', (req, res) => res.send('Payments service is healthy'));

app.listen(PORT, () => {
  console.log(`Payments service running on port ${PORT}`);
});
