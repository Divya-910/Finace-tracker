// setup.js

const db = require('./db'); // Import the database connection

// Create users table
const createUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    }
  });
};

// Create categories table
const createCategoriesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      min_threshold REAL NOT NULL,
      max_threshold REAL NOT NULL
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating categories table:', err.message);
    }
  });
};

// Create transactions table
const createTransactionsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category_id INTEGER,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err.message);
    }
  });
};

// Initialize all tables
const setupDatabase = () => {
  createUsersTable();
  createCategoriesTable();
  createTransactionsTable();
};

// Export the function
module.exports = { setupDatabase };
