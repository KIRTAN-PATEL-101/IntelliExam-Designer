const express = require('express');
const path = require('path');
const cors = require('cors');

const users = []; // Temporary in-memory user storage

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// HTML routes (for legacy support if needed)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'signup.html'));
});

// ✅ Signup API
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Signup request received:', email);

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    console.log('⚠️  Signup failed: User already exists ->', email);
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  // Save user to memory
  users.push({ email, password });
  console.log('✅ New user registered:', email);

  res.json({ success: true, message: 'Signup successful' });
});

// ✅ Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt:', email);

  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    console.log('✅ Login successful:', email);
    return res.json({ success: true, message: 'Login successful' });
  }

  console.log('❌ Login failed: Invalid credentials');
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Root route
app.get('/', (req, res) => {
  res.send('✅ Backend server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
