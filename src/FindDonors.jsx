import React, { useState } from 'react';
import { Search, MapPin, Pill, Phone, Mail, User, Eye, Calendar, Heart, AlertCircle, CheckCircle, Clock, Package, Building, ExternalLink,Hash } from 'lucide-react';
import axios from './axiosConfig';

const FindDonors = () => {
  const [city, setCity] = useState('');
  const [medicine, setMedicine] = useState('');
  const [donors, setDonors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchedMedicine, setSearchedMedicine] = useState(''); // Store the searched medicine

  const commonCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Surat', 'Bhopal', 'Patna'
  ];

  const commonMedicines = [
    'Paracetamol', 'Aspirin', 'Ibuprofen', 'Amoxicillin', 'Azithromycin',
    'Cetrizine', 'Omeprazole', 'Dolo', 'Crocin', 'Combiflam',
    'Digene', 'Betadine', 'Volini', 'Vicks', 'Strepsils',
    'Cough Syrup', 'Vitamin C', 'Insulin', 'Blood Pressure Medicine', 'Other'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!city.trim() || !medicine.trim()) {
      setError('Please enter both city and medicine name');
      setLoading(false);
      return;
    }

    try {
      console.log('=== SEARCH DEBUG ===');
      console.log('Searching for:', { city, medicine });
      console.log('Search URL:', `/api/donors/search?city=${encodeURIComponent(city)}&medicine=${encodeURIComponent(medicine)}`);

      const response = await axios.get(`/api/donors/search?city=${encodeURIComponent(city)}&medicine=${encodeURIComponent(medicine)}`);
      const data = response.data;

      console.log('Backend response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));

      if (data.message && !Array.isArray(data)) {
        throw new Error(data.message || 'Failed to search donors');
      }

      // Filter donors to only include matching medicines
      const filteredDonors = data?.map(donor => ({
        ...donor,
        medicines: donor.medicines?.filter(med =>
          med.medicine.toLowerCase().includes(medicine.toLowerCase())
        ) || []
      })).filter(donor => donor.medicines.length > 0) || [];

      console.log('Filtered donors:', filteredDonors);

      setDonors(filteredDonors);
      setSearchedMedicine(medicine); // Store the searched medicine

      if (filteredDonors.length === 0) {
        setError(`No donors found with "${medicine}" in "${city}". Try searching in nearby cities or check the medicine name.`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (donor) => {
    // Filter the donor's medicines to only show the searched medicine
    const filteredDonor = {
      ...donor,
      medicines: donor.medicines?.filter(med =>
        med.medicine.toLowerCase().includes(searchedMedicine.toLowerCase())
      ) || []
    };
    setSelectedDonor(filteredDonor);
    setShowDetails(true);
  };

  // const handleContactDonor = (donor) => {
  //   const message = `Hello ${donor.name}, I need ${searchedMedicine} and found your contact through our medicine donation platform. Could you please help?`;
  //   window.open(`tel:${donor.contact}`, '_blank');
  //   // Or for WhatsApp: window.open(`https://wa.me/${donor.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  // };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90; // Expiring within 3 months
  };

  // Detailed view for selected donor
  if (showDetails && selectedDonor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Donor Details</h1>
                  <p className="text-gray-600">Donor information for "{searchedMedicine}"</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                ← Back to Search
              </button>
            </div>
          </div>

          {/* Donor Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Aadhaar Image */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aadhaar Verification</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <img
                    src={selectedDonor?.adhaarpic || selectedDonor?.frontAdharUrl}
                    alt="Aadhaar Document"
                    className="w-full h-48 object-contain bg-white rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5BYWRoYWFyIERvY3VtZW50PC90ZXh0Pjwvc3ZnPg==';
                      e.target.alt = 'Aadhaar image placeholder';
                    }}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDonor.name}</h2>
                    <p className="text-gray-600">Verified Donor</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 font-medium">{selectedDonor.contact}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{selectedDonor.emailid}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{selectedDonor.curcity}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{selectedDonor.medicines?.length || 0} matching medicine(s)</span>
                    </div>
                  </div>

                  {/* <div className="flex flex-col space-y-3"> */}
                    {/* <button
                      onClick={() => handleContactDonor(selectedDonor)}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Contact Donor</span>
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${selectedDonor.contact.replace(/\D/g, '')}?text=Hello, I need ${searchedMedicine} and found your contact through our medicine donation platform.`, '_blank')}
                      className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </button>
                     <div className="bg-blue-50 rounded-lg p-4 mt-4">
                       <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
                       <div className="space-y-2 text-sm">
                         <div className="flex items-center justify-between">
                           <span className="text-blue-700">Phone:</span>
                           <button
                             onClick={() => window.open(`tel:${selectedDonor.contact}`, '_blank')}
                             className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                           >
                             Call {selectedDonor.contact}
                           </button>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-blue-700">WhatsApp:</span>
                           <button
                             onClick={() => window.open(`https://wa.me/${selectedDonor.contact.replace(/\D/g, '')}?text=Hello, I need ${searchedMedicine} and found your contact through our medicine donation platform.`, '_blank')}
                             className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                           >
                             Message
                           </button>
                         </div>
                       </div>
                     </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Available Medicines - Only Matching Medicine */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Available "{searchedMedicine}" Medicine</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDonor.medicines?.map((med, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-xl">{med.medicine}</h4>
                    {isExpiringSoon(med.expiryDate) && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                        Expiring Soon
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                      <Building className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="text-gray-500">Company:</span>
                        <span className="font-semibold ml-2">{med.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                      <Package className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="text-gray-500">Packing:</span>
                        <span className="font-semibold ml-2 capitalize">{med.packing}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-semibold ml-2">{med.qty}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                      <Calendar className="w-5 h-5 text-red-600" />
                      <div>
                        <span className="text-gray-500">Expires:</span>
                        <span className="font-semibold ml-2">{formatDate(med.expiryDate)}</span>
                      </div>
                    </div>
                    {med.otherInfo && (
                      <div className="bg-blue-50 rounded-lg p-3 mt-3">
                        <div className="text-blue-800 font-medium mb-1">Additional Info:</div>
                        <div className="text-blue-700 text-sm">{med.otherInfo}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedDonor.medicines?.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No matching medicines found for this donor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main search interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Medicine Donors</h1>
              <p className="text-gray-600">Search for donors in your city who have the medicine you need</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select City</option>
                    {commonCities.map((cityOption) => (
                      <option key={cityOption} value={cityOption}>
                        {cityOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Medicine</label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={medicine}
                    onChange={(e) => setMedicine(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select Medicine</option>
                    {commonMedicines.map((medicineOption) => (
                      <option key={medicineOption} value={medicineOption}>
                        {medicineOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search Donors</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {donors.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Found {donors.length} donor(s) with "{searchedMedicine}" in "{city}"
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor) => (
                <div key={donor._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  {/* Aadhaar Image Preview */}
                  <div className="mb-4">
                    <img
                      src={donor?.adhaarpic || donor?.frontAdharUrl}
                      alt="Aadhaar Document"
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMzAwIDEwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5BYWRoYWFyIERvY3VtZW50PC90ZXh0Pjwvc3ZnPg==';
                        e.target.alt = 'Aadhaar image placeholder';
                      }}
                    />
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                      <p className="text-sm text-gray-600">Verified Donor</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{donor.curcity}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{donor.medicines?.length || 0} matching medicine(s)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Verified Donor</span>
                    </div>
                  </div>

                  {/* Quick Medicine Preview - Only Matching Medicine */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4 border border-green-200">
                    <div className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                      <Pill className="w-4 h-4 mr-2" />
                      Available "{searchedMedicine}":
                    </div>
                    {donor.medicines?.slice(0, 2).map((med, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 mb-2 border border-green-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{med.medicine}</span>
                          {isExpiringSoon(med.expiryDate) && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div><strong>Company:</strong> {med.company}</div>
                          <div><strong>Qty:</strong> {med.qty}</div>
                          <div><strong>Type:</strong> {med.packing}</div>
                          <div><strong>Expires:</strong> {formatDate(med.expiryDate)}</div>
                        </div>
                      </div>
                    ))}
                    {donor.medicines?.length > 2 && (
                      <div className="text-xs text-green-700 mt-2 text-center font-medium">
                        +{donor.medicines.length - 2} more matching medicine(s)
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => handleViewDetails(donor)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full Details & Contact</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {donors.length === 0 && !error && city && medicine && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Donors Found</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We couldn't find any donors with <strong>"{medicine}"</strong> in <strong>"{city}"</strong>.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Try these suggestions:</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• Check the spelling of the medicine name</li>
                  <li>• Try searching in nearby cities</li>
                  <li>• Use generic names (e.g., "Paracetamol" instead of brand names)</li>
                  <li>• Search for similar medicines with the same active ingredient</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setCity('');
                  setMedicine('');
                  setError('');
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Try New Search
              </button>
            </div>
          </div>
        )}

        {/* Initial State - No search performed */}
        {!city && !medicine && !loading && donors.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="max-w-lg mx-auto">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <Heart className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Find Medicine Donors</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Connect with verified donors in your city who have the medicines you need.
                Our platform helps make healthcare more accessible for everyone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-50 rounded-lg p-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900 mb-1">Verified Donors</h4>
                  <p className="text-green-700">All donors are verified with Aadhaar</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900 mb-1">Quality Medicines</h4>
                  <p className="text-blue-700">Unexpired and properly stored</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900 mb-1">Free Service</h4>
                  <p className="text-purple-700">Helping community members</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDonors;