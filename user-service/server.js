const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Fake in-memory user data
const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
  { id: 2, username: 'wizfi', password: 'wizfi123', name: 'Wizfi Wisdom' }
];


// Fetch all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Fetch user by username
app.get('/users/:username', (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (user) {
    return res.json(user);
  }
  res.status(404).json({ error: 'User not found' });
});

app.get('/health', (req, res) => res.send('User service is healthy'));

app.get('/', (req, res) => {
  res.send('Welcome to the User Service!');
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
