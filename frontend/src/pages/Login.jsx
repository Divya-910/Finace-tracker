import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate(); // Hook to redirect after successful login

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/users/login', formData);
      alert('Login successful');

      // Save the token to localStorage
      localStorage.setItem('authToken', response.data.token);

      // Set user info
      setUser(response.data.user);
     localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userId', response.data.user.id); 
      // Redirect to the home page or dashboard
      navigate('/home');  // Change '/home' to the desired route
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>

      </form>
    </div>
  );
};

export default Login;
