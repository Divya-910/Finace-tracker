import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [transactions, setTransactions] = useState([]);

  // Local category lookup
  const categories = [
    { id: 1,  name: 'Rent' },
    { id: 2,  name: 'Utilities' },
    { id: 3,  name: 'Entertainment' },
    { id: 4,  name: 'Transportation' },
    { id: 5,  name: 'Food' },
    { id: 6,  name: 'Health' },
    { id: 7,  name: 'Education' },
    { id: 8,  name: 'Charity' },
    { id: 9,  name: 'Groceries' },
    { id: 10, name: 'Miscellaneous' }
  ];

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return console.error('No userId in localStorage');

      try {
        const res = await axios.get(
          `http://localhost:5002/transactions/${userId}`
        );

        // Attach categoryName to each transaction
        const withNames = res.data.map((tx) => {
          const cat = categories.find(
            (c) => c.id === Number(tx.category_id)
          );
          return { ...tx, categoryName: cat ? cat.name : 'Unknown' };
        });

        setTransactions(withNames);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Your Transactions</h2>

      {/* ---- Add-Transaction button ---- */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/add-transaction">
          <button style={{ padding: '0.5rem 1rem' }}>
            ➕ Add Transaction
          </button>
        </Link>
      </div>

      {/* ---- Transaction table ---- */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount (₹)</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Category</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length ? (
            transactions.map((tx) => (
              <tr key={tx.id}>
                <td style={{ padding: '0.5rem' }}>{tx.amount}</td>
                <td style={{ padding: '0.5rem' }}>{tx.categoryName}</td>
                <td style={{ padding: '0.5rem' }}>{tx.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: '0.5rem' }}>
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
