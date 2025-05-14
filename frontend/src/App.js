import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import axios from 'axios';
import Signup from './pages/SignUp';
import AddTransaction from './pages/AddTransaction'; 
const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios
        .get('http://localhost:5002/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data.user);
        })
        .catch((error) => {
          console.error('Error verifying token:', error);
        });
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
         <Route path="/signup" element={<Signup />} /> {/* ← This is new */}
        <Route
          path="/home"
          element={user ? <Home user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/home" />} /> 
        <Route path="/add-transaction" element={<AddTransaction />} /> 
      </Routes>
    </div>
  );
};

export default App;
