import React, { useState } from 'react';
import {
  Heart, Search, MapPin, Phone, Mail, Package, User,
  CheckCircle, AlertCircle, Send, RefreshCw, Calendar, PauseCircle,XCircle
} from 'lucide-react';
import axios from 'axios';

const handleSearch = async () => {
  setLoading(true);
  setHasSearched(true);

  try {
    const response = await axios.get('http://localhost:5000/api/donations/search-equipment', {
      params: {
        city: selectedCity,
        equipment: selectedEquipment
      }
    });

    let filtered = response.data;

    // Filter by city
    if (selectedCity && selectedCity !== 'All Cities') {
      filtered = filtered.filter(donor => donor.city === selectedCity);
    }

    // Filter by equipment
    if (selectedEquipment && selectedEquipment !== 'All Equipment') {
      filtered = filtered.filter(donor =>
        donor.equipment.some(item => item.item === selectedEquipment)
      );
    }

    setSearchResults(filtered);
  } catch (err) {
    console.error('Search failed:', err);
    setSearchResults([]);
  }

  setLoading(false);
};



const NeedySearch = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const cities = ['All Cities', 'Nagpur', 'Mumbai', 'Delhi', 'Indore', 'Pune', 'Bangalore','Chennai','Kolkata','Hyderabad','Ahmedabad','Jaipur','Lucknow','Kanpur'];

  const equipmentItems = [
    'All Equipment',
    'Wheelchairs',
    'Walking Aids',
    'Thermometers',
    'Blood pressure monitors',
    'Adult Diapers',
    'Hearing Aids',
    'Spectacles',
    'Compression Garments',
    'Stethoscopes',
    'Nebulizers',
    'Infusion pumps',
    'Medical Alert Devices',
    'Defibrillators',
    'Emergency Kits',
    'Stretchers',
    'Oxygen Masks'
  ];

  const handleSearch = async () => {
  setLoading(true);
  setHasSearched(true);

  try {
    const response = await axios.get('http://localhost:5000/api/donations/search-equipment', {
      params: {
        city: selectedCity,
        equipment: selectedEquipment
      }
    });

    // ✅ Ensure correct extraction from backend response
    let filtered = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];

    // ✅ Filter by city
    if (selectedCity && selectedCity !== 'All Cities') {
      filtered = filtered.filter(donor => donor.city === selectedCity);
    }

    // ✅ Filter by equipment
    if (selectedEquipment && selectedEquipment !== 'All Equipment') {
      filtered = filtered.filter(donor =>
        donor.equipment?.some(item => item.item === selectedEquipment)
      );
    }

    setSearchResults(filtered);
  } catch (err) {
    console.error('Search failed:', err);
    setSearchResults([]);
  }

  setLoading(false);
};

const getSituationIcon = (situation) => {
  if (situation === 'working') {
    return <CheckCircle className="text-green-500 w-4 h-4" />;
  } else if (situation === 'partially-working') {
    return <MinusCircle className="text-yellow-500 w-4 h-4" />;
  } else {
    return <XCircle className="text-red-500 w-4 h-4" />;
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MediConnect</h1>
              <p className="text-gray-600">Find medical equipment donors in your area</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Search for Medical Equipment</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a city</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Equipment
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose equipment</option>
                {equipmentItems.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{loading ? 'Searching...' : 'Search Donors'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching for donors...</p>
          </div>
        )}

        {!loading && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No donors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later</p>
          </div>
        )}

        {!loading && searchResults.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Found {searchResults.length} donor{searchResults.length !== 1 ? 's' : ''}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((donor) => (
                <div key={donor._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Donor Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <User className="w-5 h-5 text-gray-500 mr-2" />
                          {donor.name}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {donor.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Listed {new Date(donor.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {donor.equipment.reduce((sum, item) => sum + item.quantity, 0)}
                        </div>
                        <div className="text-xs text-gray-500">Total Items</div>
                      </div>
                    </div>

                    {/* Equipment List */}
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-900 mb-3">Available Equipment:</h5>
                      <div className="space-y-3">
                        {donor.equipment
                          .filter(item => !selectedEquipment || selectedEquipment === 'All Equipment' || item.item === selectedEquipment)
                          .map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium text-gray-900">{item.item}</span>
                                <div className="text-xs text-gray-500">{item.category}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-600">Qty: {item.quantity}</div>
                                <div className="flex items-center space-x-1 mt-1">
                                  {getSituationIcon(item.situation)}
                                 <span
  className={`text-xs ${
    item.situation === 'working'
      ? 'text-green-500'
      : item.situation === 'partially-working'
      ? 'text-yellow-500'
      : 'text-red-500'
  }`}
>
  {item.situation === 'working'
    ? 'Working'
    : item.situation === 'partially-working'
    ? 'Partially Working'
    : 'Not Working'}
</span>


                                </div>
                              </div>
                            </div>
                            {/* <div className="flex justify-start"> */}
                              {/* {getStatusBadge(item.status)} */}
                            {/* </div> */}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Options */}
                    <div className="border-t pt-4 text-center">
                      <div className="flex items-center justify-center text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">{donor.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        {!hasSearched && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <Heart className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to MediConnect</h3>
            <p className="text-gray-600 mb-4">
              Find generous donors who are willing to share medical equipment with those in need.
              Use the search form above to find donors in your area.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Search className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Search</h4>
                <p className="text-sm text-gray-600">Find donors by city and equipment type</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Phone className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Connect</h4>
                <p className="text-sm text-gray-600">Contact donors directly via email or phone</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Heart className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Help</h4>
                <p className="text-sm text-gray-600">Get the medical equipment you need</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NeedySearch;