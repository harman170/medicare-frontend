import React, { useState, useEffect } from 'react';
import { User, Pill, UserCheck, Wrench, LogOut } from 'lucide-react';

import { useNavigate } from "react-router-dom"; // Add this import

const DonorDashboard = () => {
  const [donorEmail, setDonorEmail] = useState('');
  const navigate = useNavigate();

  // Get email from localStorage when component loads
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setDonorEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    window.location.href = 'http://localhost:5173/';
  };

   const handleCardClick = (cardType) => {
    console.log(`Clicked on ${cardType}`);
    navigate(`/donor/${cardType.toLowerCase()}`);
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Donor Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{donorEmail}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Make a difference in someone's life by sharing what you have. Your donations can provide essential medicines and equipment to those who need them most.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800 text-sm">
              <strong>Getting Started:</strong> Click on any card below to explore donation options, manage your contributions, or update your profile information.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Profile Card */}
          <div
            onClick={() => handleCardClick('donorform')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Profile</h3>
              <p className="text-xs text-gray-500 mt-1">Add your personal details</p>
            </div>
          </div>

          {/* Available Medicines Card */}
          <div
            onClick={() => handleCardClick('availmed')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Pill className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Avail Medicines</h3>
               <p className="text-xs text-gray-500 mt-1">Add meidcines for donation</p>
            </div>
          </div>

          {/* Medicine Manager Card */}
          <div
            onClick={() => handleCardClick('FetchMed')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Medicine Manager</h3>
               <p className="text-xs text-gray-500 mt-1">Track your donated medicines</p>
            </div>
          </div>

          {/* Available Equipment Card */}
          <div
            onClick={() => handleCardClick('MedicalEquipment')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Available Equipment</h3>
               <p className="text-xs text-gray-500 mt-1">Explore medical equipment you can donate</p>
            </div>
          </div>

        </div>


      </div>
    </div>
  );
};

export default DonorDashboard;