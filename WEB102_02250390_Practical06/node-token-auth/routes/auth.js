const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// In-memory user store (no database needed for this demo)
const users = [];

// ─── POST /auth/register ────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // BONUS: accept 'name' field

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  // Hash the password before storing it (never store plain text!)
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    name: name || null, // BONUS: store the name (null if not provided)
    email,
    password: hashedPassword,
  };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully!' });
});

// ─── POST /auth/login ────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Compare the provided password with the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Create a JWT token — only safe, non-sensitive info goes in the payload
  const token = jwt.sign(
    { id: user.id, email: user.email }, // payload (never include password here!)
    process.env.JWT_SECRET,             // secret key from .env
    { expiresIn: '1d' }                 // token expires in 1 day
  );

  res.json({ message: 'Login successful!', token });
});

// ─── GET /auth/users  (BONUS homework route) ─────────────────────────────────
// No token needed — but we NEVER expose the hashed password
router.get('/users', (req, res) => {
  const safeUsers = users.map(({ id, name, email }) => ({ id, name, email }));
  res.json(safeUsers);
});

module.exports = router;