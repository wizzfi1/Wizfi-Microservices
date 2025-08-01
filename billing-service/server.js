const express = require('express');
const dotenv = require('dotenv');
const authMiddleware = require('./auth-middleware');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/invoices', authMiddleware, (req, res) => {
  res.json([{ invoiceId: 'INV001', amount: 99, userId: req.user.userId }]);
});

app.get('/health', (req, res) => res.send('Billing service is healthy'));

app.get('/', (req, res) => {
  res.send('Welcome to the Billing Service!');
});

app.listen(PORT, () => {
  console.log(`Billing service running on port ${PORT}`);
});
