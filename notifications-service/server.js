const express = require('express');
const dotenv = require('dotenv');
const authMiddleware = require('./auth-middleware');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.post('/send-email', authMiddleware, (req, res) => {
  res.json({ message: `Email sent to user ${req.user.username}` });
});

app.get('/health', (req, res) => res.send('Notifications service is healthy'));

app.get('/', (req, res) => {
  res.send('Welcome to the Notification Service!');
});

app.listen(PORT, () => {
  console.log(`Notifications service running on port ${PORT}`);
});
