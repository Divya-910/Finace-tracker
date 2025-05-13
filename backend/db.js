// db.js
const sqlite3 = require('sqlite3').verbose();

// Create and open the SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Export the db instance to be used elsewhere
module.exports = db;
