import React, { useState, useEffect } from 'react';
import { User, Search, Heart, Stethoscope, LogOut, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import

const NeedyDashboard = () => {
  const [needyEmail, setNeedyEmail] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  // Get email from localStorage when component loads
  useEffect(() => {
    const email = localStorage.getItem('userEmail') || '';
    setNeedyEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    window.location.href = '/MediShare';
  };

  const handleCardClick = (cardType) => {
    console.log(`Clicked on ${cardType}`);
    navigate(`/needy/${cardType}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Needy Dashboard</h1>
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
            <Mail className="w-4 h-4 text-gray-600" />
            <div className="text-right">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-medium text-gray-800">{needyEmail || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {needyEmail ? needyEmail.split('@')[0] : 'User'}! 🌟
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Let's find the support you need
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Find the support you need. Browse available donations, connect with generous donors, and access essential medicines and equipment for your well-being.
          </p>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <p className="text-green-800 text-sm">
              <strong>How it works:</strong> Use the cards below to search for available items, view your profile, or find medical support that matches your needs.
            </p>
          </div>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div
            onClick={() => handleCardClick('')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Profile</h3>
              <p className="text-xs text-gray-500 mt-1">needy.id: {needyEmail.split('@')[0]}</p>
            </div>
          </div>

          {/* Need List & Donors Card */}
          <div
            onClick={() => handleCardClick('FindDonors')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Need List & Donors</h3>
              <p className="text-xs text-gray-500 mt-1">Browse available donations</p>
            </div>
          </div>

          {/* Get Medical Helped Card */}
          <div
            onClick={() => handleCardClick('Needed-Equipment')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <Stethoscope className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Get Medical Help</h3>
              <p className="text-xs text-gray-500 mt-1">Access medical support</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NeedyDashboard;