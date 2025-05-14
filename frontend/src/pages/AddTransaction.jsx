import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddTransaction = () => {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: '', // Added field for date
  });

  // Predefined categories
  const categories = [
    { id: 1, name: 'Rent' },
    { id: 2, name: 'Utilities' },
    { id: 3, name: 'Entertainment' },
    { id: 4, name: 'Transportation' },
    { id: 5, name: 'Food' },
    { id: 6, name: 'Health' },
    { id: 7, name: 'Education' },
    { id: 8, name: 'Charity' },
    { id: 9, name: 'Groceries' },
    { id: 10, name: 'Miscellaneous' }
];  // Make sure this line ends with a semicolon

  useEffect(() => {
    // Automatically set user_id from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setFormData((prev) => ({
        ...prev,
        user_id: userId, // Automatically set user_id from localStorage
      }));
    }
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all required fields are filled
    if (!formData.user_id || !formData.category_id || !formData.amount || !formData.date) {
      alert('Please provide all fields: user_id, category_id, amount, and date');
      return;
    }

    try {
      // Submit the transaction with all required fields, and assume "completed" for status
      const response = await axios.post('http://localhost:5002/transactions/add', {
        ...formData,
        status: 'completed', // Default status for all transactions
      });
      alert('Transaction added successfully');
      // Optionally reset form
      setFormData({
        category_id: '',
        amount: '',
        date: '',
      });
    } catch (error) {
      alert('Error during transaction submission: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        {/* The user_id is automatically filled, but hidden */}
        <input
          type="hidden"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
        />
        
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        {/* Date picker */}
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;
