import React, { useState, useEffect } from 'react';
import {
  Heart, User, Pill, Building, Calendar, Package, Hash,
  FileText, CheckCircle, AlertCircle, Send, RotateCcw, Edit3,
  Info, Shield, Clock, Mail, Search
} from 'lucide-react';

import axios from './axiosConfig';

const AvailMedForm = () => {
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    emailid: '',
    medicine: '',
    company: '',
    expiryDate: '',
    packing: '',
    qty: '',
    otherInfo: '',
    city: '',
    _id: ''
  });

  const [userMedicines, setUserMedicines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState('submit');
  const [isEditing, setIsEditing] = useState(false);

  const commonCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Other'];

  const commonMedicines = [
    'Paracetamol', 'Aspirin', 'Ibuprofen', 'Amoxicillin', 'Azithromycin',
    'Cetrizine', 'Omeprazole', 'Dolo', 'Crocin', 'Combiflam',
    'Digene', 'Betadine', 'Volini', 'Vicks', 'Strepsils',
    'Cough Syrup', 'Vitamin C', 'Insulin', 'Blood Pressure Medicine', 'Other'
  ];

  const commonCompanies = [
    'Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Lupin', 'Aurobindo Pharma',
    'Glenmark', 'Cadila Healthcare', 'Torrent Pharma', 'Alkem Laboratories',
    'Abbott', 'Pfizer', 'Johnson & Johnson', 'GlaxoSmithKline', 'Novartis',
    'Roche', 'Sanofi', 'Bayer', 'Merck', 'Takeda', 'Other'
  ];

  const medicineTypes = [
    'tablets', 'capsules', 'syrup', 'injection', 'drops',
    'cream', 'powder', 'ointment', 'inhaler', 'patch', 'other'
  ];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get logged-in user's email from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setFormData(prev => ({ ...prev, emailid: email }));
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchUserMedicines();
    }
  }, [userEmail]);

  const fetchUserMedicines = async () => {
    try {
      const response = await axios.get(`/api/donors/availmed/${userEmail}`);
      console.log('Fetched medicines response:', response.data);
      // Backend returns { medicines: [...] }, so extract the medicines array
      setUserMedicines(response.data.medicines || []);
    } catch (error) {
      console.error('Error fetching user medicines:', error);
      setUserMedicines([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data:', formData);
    console.log('User email:', userEmail);
    console.log('Form valid:', isFormValid);
    console.log('Is editing:', isEditing);
    console.log('Form ID:', formData._id);

    if (!userEmail) {
      console.log('ERROR: No user email found');
      setSubmitMessage('Please login to submit medicines.');
      setIsSubmitting(false);
      return;
    }

    try {
      let url, method, requestBody;

      if (isEditing && formData._id) {
        console.log('UPDATE MODE');
        url = `/api/donors/availmed/${formData._id}`;
        method = 'put';
        requestBody = {
          ...formData,
          emailid: userEmail,
          updatedAt: new Date()
        };
      } else {
        console.log('CREATE MODE');
        url = '/api/donors/availmed';
        method = 'post';
        requestBody = {
          ...formData,
          emailid: userEmail,
          createdAt: new Date()
        };
        // Remove _id field for new medicines
        delete requestBody._id;
      }

      console.log('Request details:', { method, url, requestBody });

      const response = await axios({
        method,
        url,
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Server response:', response.data);
      console.log('Response status:', response.status);

      if (response.data) {
        setSubmitMessage(`Medicine ${isEditing ? 'updated' : 'added'} successfully!`);
        setSubmitType(isEditing ? 'update' : 'submit');
        resetForm();
        fetchUserMedicines();
      }
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Full error:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data);
      console.error('Error config:', error.config);

      setSubmitMessage(`Error ${isEditing ? 'updating' : 'adding'} medicine. Please try again.`);
      setSubmitType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (medicine) => {
    console.log('=== EDIT MEDICINE DEBUG ===');
    console.log('Medicine to edit:', medicine);
    console.log('User email:', userEmail);

    const updatedFormData = {
      ...medicine,
      emailid: userEmail
    };

    console.log('Updated form data:', updatedFormData);

    setFormData(updatedFormData);
    setIsEditing(true);
    setSubmitMessage('');

    console.log('Edit mode activated');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      await axios.delete(`/api/donors/availmed/${id}`);
      setSubmitMessage('Medicine deleted successfully!');
      setSubmitType('delete');
      fetchUserMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      setSubmitMessage('Error deleting medicine. Please try again.');
      setSubmitType('error');
    }
  };

  const resetForm = () => {
    setFormData({
      emailid: userEmail,
      medicine: '',
      company: '',
      expiryDate: '',
      packing: '',
      qty: '',
      otherInfo: '',
      city: '',
      _id: ''
    });
    setIsEditing(false);
    setSubmitMessage('');
  };

  const isFormValid = formData.medicine && formData.company && formData.expiryDate &&
                   formData.packing && formData.qty && formData.city;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center gap-3 flex-1">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
                <Heart className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Medicine Sharing Platform</h1>
            </div>
            {userEmail && (
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg ml-4">
                <Mail className="w-4 h-4 text-gray-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-medium text-gray-800">{userEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Important Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Only donate medicines that are unopened and not expired</li>
                <li>• Ensure medicines have been stored properly according to instructions</li>
                <li>• Prescription medicines require proper verification</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-green-600 w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {isEditing ? 'Update Medicine' : 'Medicine Details'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="emailid"
                  value={formData.emailid}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your.email@example.com"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select City</option>
                  {commonCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medicine Name and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Pill className="inline w-4 h-4 mr-1" />
                  Medicine Name *
                </label>
                <select
                  name="medicine"
                  value={formData.medicine}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select Medicine</option>
                  {commonMedicines.map((medicine) => (
                    <option key={medicine} value={medicine}>
                      {medicine}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  Company *
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select Company</option>
                  {commonCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry Date and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={getTodayDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Packing Type *
                </label>
                <select
                  name="packing"
                  value={formData.packing}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select packing type</option>
                  {medicineTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Hash className="inline w-4 h-4 mr-1" />
                Quantity *
              </label>
              <input
                type="text"
                name="qty"
                value={formData.qty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., 10 tablets, 1 bottle"
                required
              />
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Additional Information
              </label>
              <textarea
                name="otherInfo"
                value={formData.otherInfo}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Any additional details about the medicine..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={fetchUserMedicines}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                <span className="text-sm sm:text-base">Fetch Medicines</span>
              </button>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">
                      {isEditing ? 'Updating...' : 'Submitting...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="text-sm sm:text-base">
                      {isEditing ? 'Update Medicine' : 'Submit Medicine'}
                    </span>
                  </>
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Cancel Edit</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm sm:text-base">Reset Form</span>
              </button>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                submitType === 'submit' && submitMessage.includes('successfully')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : submitType === 'update' && submitMessage.includes('successfully')
                  ? 'bg-blue-50 border border-blue-200 text-blue-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {submitMessage.includes('successfully') ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{submitMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* User Medicines List */}
        {userMedicines.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-blue-600 w-6 h-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Listed Medicines</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Medicine</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Company</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Expiry</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Quantity</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userMedicines.map((medicine, index) => (
                    <tr key={medicine._id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-800">{medicine.medicine}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{medicine.company}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          new Date(medicine.expiryDate) > new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{medicine.qty}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit medicine"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(medicine._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete medicine"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            By sharing your medicines, you're helping make healthcare more accessible to everyone.
            Thank you for your contribution to the community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailMedForm;
