// server.js

const express = require('express');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { setupDatabase } = require('./setup'); // Import setup.js to initialize the database

// Initialize the Express app
const app = express();
const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

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

// Add a new user (with hashed password)
app.post('/users/add', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields: username, email, and password' });
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create user: ' + err.message });
      }
      res.status(201).json({ message: 'User created successfully', userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to hash password: ' + err.message });
  }
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

    // Return user info without password
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  });
});

// Add a transaction
app.post('/transactions/add', (req, res) => {
  const { user_id, category_id, amount, status } = req.body;

  if (!user_id || !category_id || !amount || !status) {
    return res.status(400).json({ error: 'Please provide all fields: user_id, category_id, amount, and status' });
  }

  const sql = 'INSERT INTO transactions (user_id, category_id, amount, status) VALUES (?, ?, ?, ?)';
  db.run(sql, [user_id, category_id, amount, status], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add transaction: ' + err.message });
    }
    res.status(201).json({ message: 'Transaction added successfully', transactionId: this.lastID });
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
