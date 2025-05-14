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

// Create transactions table without the status column
const createTransactionsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category_id INTEGER,
      amount REAL NOT NULL,
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

// Function to migrate data safely (remove the status column)
const migrateTransactionsTable = () => {
  // First, create a new transactions table without the 'status' column
  const createNewTableSql = `
    CREATE TABLE IF NOT EXISTS transactions_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category_id INTEGER,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `;
  
  db.run(createNewTableSql, (err) => {
    if (err) {
      console.error('Error creating new transactions table:', err.message);
      return;
    }

    // Copy data from old table to new table (excluding the status column)
    const copyDataSql = `
      INSERT INTO transactions_new (id, user_id, category_id, amount, date)
      SELECT id, user_id, category_id, amount, date
      FROM transactions;
    `;
    
    db.run(copyDataSql, (err) => {
      if (err) {
        console.error('Error copying data to new table:', err.message);
        return;
      }

      // Drop the old transactions table
      const dropOldTableSql = 'DROP TABLE IF EXISTS transactions';
      db.run(dropOldTableSql, (err) => {
        if (err) {
          console.error('Error dropping old transactions table:', err.message);
          return;
        }

        // Rename the new table to the original table name
        const renameTableSql = 'ALTER TABLE transactions_new RENAME TO transactions';
        db.run(renameTableSql, (err) => {
          if (err) {
            console.error('Error renaming new table:', err.message);
          } else {
            console.log('Transactions table successfully migrated.');
          }
        });
      });
    });
  });
};

// Initialize all tables
const setupDatabase = () => {
  createUsersTable();
  createCategoriesTable();

  // Check if the transactions table exists
  db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="transactions"', (err, table) => {
    if (err) {
      console.error('Error checking table existence:', err.message);
    } else {
      if (table) {
        // If the table exists, migrate it (remove the 'status' column)
        migrateTransactionsTable();
      } else {
        // If the table doesn't exist, create it
        createTransactionsTable();
      }
    }
  });
};

// Export the function
module.exports = { setupDatabase };
