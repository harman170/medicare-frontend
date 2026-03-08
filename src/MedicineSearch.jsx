import React, { useState, useEffect } from 'react';
import { Search, MapPin, Pill, Building, Filter, X, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';
import axios from 'axios';

const MedicineSearchPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [cities, setCities] = useState([
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Surat', 'Bhopal', 'Patna'
  ]);
  const [medicines, setMedicines] = useState([
    'Paracetamol', 'Aspirin', 'Ibuprofen', 'Amoxicillin',
    'Cough Syrup', 'Vitamin C', 'Insulin', 'Blood Pressure Medicine',
    'Azithromycin', 'Cetrizine', 'Omeprazole', 'Dolo', 'Crocin',
    'Combiflam', 'Digene', 'Betadine', 'Volini', 'Vicks', 'Strepsils'
  ]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Get logged-in user's email from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  // Try to fetch additional cities from backend (but keep static ones)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        console.log('Fetching cities from backend...');
        const response = await axios.get('http://localhost:5000/api/donors/cities');
        console.log('Cities API response:', response.data);

        if (response.data.cities && response.data.cities.length > 0) {
          // Combine static cities with backend cities
          const backendCities = response.data.cities;
          const allCities = [...new Set([...cities, ...backendCities])].sort();
          setCities(allCities);
          console.log('Combined cities:', allCities);
        }
      } catch (error) {
        console.error('Error fetching cities from backend:', error);
        console.log('Using static cities:', cities);
      }
    };
    fetchCities();
  }, []);

  // Try to fetch additional medicines from backend (but keep static ones)
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        console.log('Fetching medicines from backend...');
        const response = await axios.get('http://localhost:5000/api/donors/medicines');
        console.log('Medicines API response:', response.data);

        if (response.data.medicines && response.data.medicines.length > 0) {
          // Combine static medicines with backend medicines
          const backendMedicines = response.data.medicines;
          const allMedicines = [...new Set([...medicines, ...backendMedicines])].sort();
          setMedicines(allMedicines);
          console.log('Combined medicines:', allMedicines);
        }
      } catch (error) {
        console.error('Error fetching medicines from backend:', error);
        console.log('Using static medicines:', medicines);
      }
    };
    fetchMedicines();
  }, []);

  // Search for medicines
  const handleSearch = async () => {
    if (!selectedCity || !selectedMedicine) {
      alert('Please select both city and medicine');
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);

    try {
      console.log('Searching for:', { city: selectedCity, medicine: selectedMedicine });
      const response = await axios.get(`http://localhost:5000/api/donors/search?city=${selectedCity}&medicine=${selectedMedicine}`);
      console.log('Search results:', response.data);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching medicines:', error);
      setSearchResults([]);
      alert('Failed to search medicines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSelectedCity('');
    setSelectedMedicine('');
    setSearchResults([]);
    setSearchPerformed(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check expiry status
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (diffDays <= 90) return { status: 'expiring', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center gap-3 flex-1">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full">
                <Search className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Medicine Search</h1>
            </div>
            {userEmail && (
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg ml-4">
                <Pill className="w-4 h-4 text-gray-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-medium text-gray-800">{userEmail}</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-600">Find available medicines in your city</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* City Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Select City *
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Medicine Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Pill className="inline w-4 h-4 mr-1" />
                Medicine Name *
              </label>
              <select
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine} value={medicine}>
                    {medicine}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedCity || !selectedMedicine}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clear Search */}
          {searchPerformed && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Search Results ({searchResults.length} found)
            </h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for medicines...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No medicines found matching your search criteria.</p>
                <p className="text-sm text-gray-500 mt-2">Try selecting a different city or medicine.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((donor, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <h3 className="font-semibold text-gray-800">{donor.name || 'Anonymous Donor'}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{donor.curcity || donor.city || 'N/A'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{donor.curaddress || donor.location || 'N/A'}</span>
                          </div>
                        </div>

                        {donor.medicines && donor.medicines.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {donor.medicines.map((medicine, medIndex) => (
                              <div key={medIndex} className="bg-gray-50 rounded p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium text-gray-800">{medicine.medicine}</span>
                                    <span className="text-gray-600 ml-2">({medicine.company})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {medicine.expiryDate && (() => {
                                      const expiry = getExpiryStatus(medicine.expiryDate);
                                      return (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${expiry.bg} ${expiry.color}`}>
                                          {expiry.status === 'expired' ? 'Expired' : expiry.status === 'expiring' ? 'Expiring Soon' : 'Good'}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Qty: {medicine.qty} | Packing: {medicine.packing}
                                </div>
                                {medicine.expiryDate && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Expires: {formatDate(medicine.expiryDate)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineSearchPage;
