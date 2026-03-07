// Imports React library and useState hook for state management
import React, { useState } from 'react';
// Imports Axios instance with custom configuration from a local file
import axios from '../axiosConfig';
// Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('');
  const [message, setMessage] = useState('');

  // Declares async function to handle login submission
  const handleLogin = async () => {
    try {
      const response = await axios.post('/login', {
        email,
        password
      });

      if (response.data.status === true) {
        setUsertype(response.data.usertype);
        setMessage(`✅ Login successful. You are a ${response.data.usertype}.`);
      } else {
        setMessage("❌ Login failed: " + response.data.msg);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Try again later.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('/forgot-password', {
        email
      });

      if (response.data.status === true) {
        setMessage(`🔒 Your password is: ${response.data.password}`);
      } else {
        setMessage("❌ Failed to get password: " + response.data.msg);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login to MediShare</h2>

        <label className="block mb-1 text-gray-700">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block mb-1 text-gray-700">Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <button
          onClick={handleForgotPassword}
          className="mt-3 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
        >
          Forgot Password?
        </button>

        {usertype && (
          <p className="mt-4 text-center text-green-600 font-medium">
            You are a {usertype}.
          </p>
        )}

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};


