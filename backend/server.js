// server.js
require('dotenv').config();


const express = require('express');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { setupDatabase } = require('./setup'); // Import setup.js to initialize the database
const cors = require('cors');
// Initialize the Express app
const app = express();
const PORT = 5002;
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// Middleware to parse JSON request bodies
app.use(express.json());
// Connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Call the setup function to initialize the database tables (from setup.js)
setupDatabase();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

// Add a new user (with hashed password)
app.post('/users/add', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields: username, email, and password' });
  }

  // ✅ Check if user already exists
  const checkSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.get(checkSql, [username, email], async (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // ✅ Hash password and insert user
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.run(insertSql, [username, email, hashedPassword], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user: ' + err.message });
        }
        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to hash password: ' + err.message });
    }
  });
});


// Login route to verify a user's password
app.post('/users/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide username and password' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching user: ' + err.message });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.SECRET_KEY,  // SECRET_KEY from .env file
      { expiresIn: '1h' }  // Optional: token expiration time
    );

    // Send the token in the response
    res.status(200).json({
      message: 'Login successful',
      token, // JWT token for the client
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  });
});

// Add a transaction
app.post('/transactions/add', (req, res) => {
  const { user_id, category_id, amount, date } = req.body;

  // Check if all required fields are provided
  if (!user_id || !category_id || !amount || !date) {
    return res.status(400).json({ error: 'Please provide all fields: user_id, category_id, amount, and date' });
  }

  // Insert transaction into the database
  const sql = `
    INSERT INTO transactions (user_id, category_id, amount, date)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [user_id, category_id, amount, date], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error saving transaction: ' + err.message });
    }
    res.status(200).json({ message: 'Transaction added successfully', transactionId: this.lastID });
  });
});


// Get all transactions for a user
app.get('/transactions/:user_id', (req, res) => {
  const { user_id } = req.params;

  const sql = 'SELECT * FROM transactions WHERE user_id = ?';
  db.all(sql, [user_id], (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch transactions: ' + err.message });
    }
    res.status(200).json(transactions);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/verify', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
  
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  // Verify the token using the secret key
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Token is valid, send the decoded data (e.g., user info) back to the client
    res.status(200).json({ message: 'Token is valid', user: decoded });
  });
});
