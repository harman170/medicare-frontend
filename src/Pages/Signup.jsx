// Imports React library and useState hook for state management
import React, { useState } from 'react';
// Imports Axios instance with custom configuration from a local file
import axios from '../axiosConfig';


const [signupForm, setSignupForm] = useState({
  email: '',
  password: '',
  userType: 'needy', // Default selected type
});

const handleSignup = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/users/signup', signupForm);
    const data = response.data;

    if (data.status) {
      alert(`Signup successful! Confirmation email sent.`);
      setCurrentView('login');
    } else {
      alert(data.msg || "Signup failed.");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred during signup.");
  }
};

const SignUpPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6 py-12">
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl w-fit mx-auto mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join MediShare</h2>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              value={signupForm.userType}
              onChange={(e) => setSignupForm({ ...signupForm, userType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="needy">Needy</option>
              <option value="donor">Donor</option>
            </select>
          </div>

          <button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Create Account
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
);
