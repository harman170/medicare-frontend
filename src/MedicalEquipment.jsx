import React, { useState } from 'react';
import {
  Heart, ChevronDown, Plus, Check, Gift, Users, MapPin,
  Phone, Mail, Package, Edit, RefreshCw, Trash2, User,
  Building, Clock, CheckCircle, X, Search
} from 'lucide-react';

import axios from 'axios';

const MedicalDonationPlatform = () => {
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDonationsList, setShowDonationsList] = useState(false);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    city: ''
  });

  const [customCity, setCustomCity] = useState('');
  const [showCustomCity, setShowCustomCity] = useState(false);

  const equipmentTypes = {
    'Personal Care Equipment': ['Adult Diapers', 'Spectacles', 'Hearing Aids', 'Thermometers', 'Walking Aids', 'Compression Garments', 'Wheelchairs', 'Stethoscopes', 'Blood pressure monitors', 'Nebulizers', 'Infusion pumps'],
    'Emergency Equipment': ['Medical Alert Devices', 'Defibrillators', 'Emergency Kits', 'Stretchers', 'Oxygen Masks']
  };

  const commonCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Other'];

  const conditionOptions = [
    { value: 'new', label: 'Brand New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Needs Repair' }
  ];

  const situationOptions = [
    { value: 'working', label: 'Working' },
    { value: 'not-working', label: 'Not Working' },
    { value: 'partial', label: 'Partially Working' }
  ];

  const updateEquipment = (category, item, field, value) => {
    const key = `${category}-${item}`;
    setSelectedEquipment(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        category,
        item,
        [field]: value
      }
    }));
  };

  const removeEquipment = (category, item) => {
    const key = `${category}-${item}`;
    setSelectedEquipment(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Fetch specific donation by email
  const fetchSpecificDonation = async () => {
    if (!searchEmail.trim()) {
      alert('Please enter an email address to fetch');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/donations');
      const foundDonation = res.data.find(donation =>
        donation.email.toLowerCase() === searchEmail.toLowerCase().trim()
      );

      if (!foundDonation) {
        alert('No donation found for this email address');
        return;
      }

      loadDonation(foundDonation);
    } catch (err) {
      console.error('Error fetching donation:', err);
      alert('Failed to fetch donation. Please check your connection and try again.');
    }
  };

  const loadDonation = (donation) => {
    // Fill donor info
    setDonorInfo({
      name: donation.name || '',
      email: donation.email || '',
      phone: donation.phone || '',
      location: donation.location || '',
      city: donation.city || '',
    });

    // Fill equipment
    const equipmentMap = {};
    if (donation.equipment && Array.isArray(donation.equipment)) {
      donation.equipment.forEach(item => {
        const key = `${item.category}-${item.item}`;
        equipmentMap[key] = {
          category: item.category,
          item: item.item,
          quantity: item.quantity || 1,
          status: item.status || '',
          situation: item.situation || ''
        };
      });
    }
    setSelectedEquipment(equipmentMap);

    // Handle custom city
    const isCustomCity = donation.city && !commonCities.slice(0, -1).includes(donation.city);
    setShowCustomCity(isCustomCity);
    setCustomCity(isCustomCity ? donation.city : '');

    setShowDonationsList(false);
    alert('Donation loaded successfully');
  };

  // Search donations by email
  const searchByEmail = async () => {
    if (!searchEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/donations');
      const filtered = res.data.filter(donation =>
        donation.email.toLowerCase().includes(searchEmail.toLowerCase())
      );

      if (filtered.length === 0) {
        alert('No donations found for this email');
        return;
      }

      if (filtered.length === 1) {
        loadDonation(filtered[0]);
      } else {
        setAvailableDonations(filtered);
        setShowDonationsList(true);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to search donations');
    }
  };

  const updateAllEquipment = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/donations');

      if (data.length === 0) {
        alert('No donations to update');
        return;
      }

      const donationToUpdate = data.find(d => d.email === donorInfo.email);
      if (!donationToUpdate) {
        alert('No donation found for current email');
        return;
      }

      const cleanedEquipment = Object.values(selectedEquipment).map(item => ({
        category: item.category,
        item: item.item,
        quantity: item.quantity,
        status: item.status || '',
        situation: item.situation || ''
      }));

      const updatedDonation = {
        name: donorInfo.name,
        email: donorInfo.email,
        phone: donorInfo.phone,
        city: showCustomCity ? customCity : donorInfo.city,
        location: donorInfo.location,
        equipment: cleanedEquipment
      };

      console.log("✅ Final data to update:", updatedDonation);

      await axios.put(`http://localhost:5000/api/donations/${donationToUpdate._id}`, updatedDonation);
      alert('Updated donation successfully (check database)');
    } catch (error) {
      console.error('❌ Update failed:', error);
      alert('Failed to update donation');
    }
  };

  const submitDonation = async () => {
    const finalCity = showCustomCity ? customCity : donorInfo.city;
    const donationData = {
      ...donorInfo,
      city: finalCity,
      equipment: Object.values(selectedEquipment)
    };

    if (!donationData.name || !donationData.email || donationData.equipment.length === 0) {
      alert('Please fill in all required fields and select at least one item.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/donations', donationData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedEquipment({});
        setDonorInfo({ name: '', email: '', phone: '', location: '', city: '' });
        setCustomCity('');
        setShowCustomCity(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const totalQuantity = Object.values(selectedEquipment).reduce(
    (sum, item) => sum + (item.quantity || 0), 0
  );

  // Success Page
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="bg-white shadow-2xl rounded-3xl p-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-teal-600 text-white rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Thank you!</h2>
          <p className="text-gray-600 mb-4">Your donation has been received. We'll contact you soon!</p>
          <p className="text-teal-700 font-medium">Your help means the world to someone. 🙏</p>
        </div>
      </div>
    );
  }

  // Donations List Modal
  if (showDonationsList) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Select Donation to Load</h2>
            <button
              onClick={() => setShowDonationsList(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {availableDonations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No donations found</p>
            ) : (
              <div className="space-y-4">
                {availableDonations.map((donation, index) => (
                  <div
                    key={donation._id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors cursor-pointer"
                    onClick={() => loadDonation(donation)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{donation.name}</h3>
                        <p className="text-sm text-gray-600">{donation.email}</p>
                        <p className="text-sm text-gray-500">{donation.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-teal-600">
                          {donation.equipment?.length || 0} items
                        </p>
                        <p className="text-xs text-gray-500">
                          {donation.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediShare Donation</h1>
                <p className="text-sm text-gray-500">Support healthcare by donating equipment</p>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center space-x-4">
              {/* Selected Items Counter */}
              {totalQuantity > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-teal-600">{totalQuantity}</div>
                    <div className="text-xs text-teal-800">Items Selected</div>
                  </div>
                </div>
              )}

              {/* Email Search Section */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter email to fetch donation"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-64"
                    onKeyPress={(e) => e.key === 'Enter' && fetchSpecificDonation()}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <button
                  onClick={fetchSpecificDonation}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Fetch</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={updateAllEquipment}
                  className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Equipment Selection - Takes 2/3 width */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Medical Equipment Selection</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Choose the medical equipment you'd like to donate</p>
              </div>

              <div className="p-6 space-y-8">
                {Object.entries(equipmentTypes).map(([category, items]) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map(item => {
                        const key = `${category}-${item}`;
                        const isSelected = selectedEquipment[key];

                        return (
                          <div
                            key={item}
                            className={`border-2 rounded-xl p-4 transition-all ${
                              isSelected
                                ? 'border-teal-300 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Item Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium text-gray-900">{item}</span>
                              </div>

                              <div className="flex space-x-2">
                                {isSelected && (
                                  <button
                                    onClick={() => removeEquipment(category, item)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => !isSelected && updateEquipment(category, item, 'quantity', 1)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isSelected
                                      ? 'bg-teal-200 text-teal-700'
                                      : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                                  }`}
                                  disabled={isSelected}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Item Details (when selected) */}
                            {isSelected && (
                              <div className="space-y-3 pt-3 border-t border-teal-200">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={isSelected.quantity || 0}
                                    onChange={(e) =>
                                      updateEquipment(category, item, 'quantity', Math.max(0, parseInt(e.target.value) || 0))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                  <select
                                    value={isSelected.status || ''}
                                    onChange={(e) => updateEquipment(category, item, 'status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                  >
                                    <option value="">Select condition</option>
                                    {conditionOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Status</label>
                                  <select
                                    value={isSelected.situation || ''}
                                    onChange={(e) => updateEquipment(category, item, 'situation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                  >
                                    <option value="">Select status</option>
                                    {situationOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Donor Information - Takes 1/3 width */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border sticky top-24">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-teal-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Donor Information</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Please provide your contact details</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={donorInfo.phone}
                      onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <select
                      value={showCustomCity ? 'Other' : donorInfo.city}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setShowCustomCity(true);
                          setDonorInfo({ ...donorInfo, city: '' });
                        } else {
                          setShowCustomCity(false);
                          setDonorInfo({ ...donorInfo, city: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select your city</option>
                      {commonCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {showCustomCity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom City</label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter your city name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea
                      rows="3"
                      value={donorInfo.location}
                      onChange={(e) => setDonorInfo({ ...donorInfo, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={submitDonation}
                    disabled={!donorInfo.name || !donorInfo.email || Object.keys(selectedEquipment).length === 0}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2 transition-all"
                  >
                    <Gift className="w-5 h-5" />
                    <span>Submit Donation</span>
                  </button>

                  {/* Validation Message */}
                  {(!donorInfo.name || !donorInfo.email || Object.keys(selectedEquipment).length === 0) && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please fill required fields and select at least one item
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalDonationPlatform;