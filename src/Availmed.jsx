import React, { useState, useEffect } from 'react';
import {
  Heart, User, Pill, Building, Calendar, Package, Hash,
  FileText, CheckCircle, AlertCircle, Send, RotateCcw, Edit3,
  Info, Shield, Clock
} from 'lucide-react';

const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const AvailMedForm = () => {
  const [formData, setFormData] = useState({
    emailId: '',
    medicine: '',
    company: '',
    expiryDate: '',
    packing: '',
    qty: '',
    otherInfo: '',
    _id: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState('');
  const [isLoadingUserMeds, setIsLoadingUserMeds] = useState(false);
  const [userMeds, setUserMeds] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');

  // Fetch user medicines when email changes
  useEffect(() => {
    const fetchUserMedicines = async () => {
      if (!formData.emailId || !validateEmail(formData.emailId)) {
        setUserMeds([]);
        return;
      }

      setIsLoadingUserMeds(true);
      try {
        // First, try to get medicines for this email
        const response = await fetch(`http://localhost:5000/api/donors/availmed/${formData.emailId}`);

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched medicines:", data);

          if (data.medicines && Array.isArray(data.medicines) && data.medicines.length > 0) {
            setUserMeds(data.medicines);
            console.log("User medicines set:", data.medicines);
          } else {
            setUserMeds([]);
            console.log("No medicines found for this email");
          }
        } else if (response.status === 404) {
          // Donor not found - this is normal for new users
          setUserMeds([]);
          console.log("No donor found for this email (new user)");
        } else {
          throw new Error(`Failed to fetch medicines: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching user medicines:", error);
        setUserMeds([]);
        // Don't show error message for 404 as it's expected for new users
        if (!error.message.includes('404')) {
          setSubmitMessage('Error fetching existing medicines. Please try again.');
        }
      } finally {
        setIsLoadingUserMeds(false);
      }
    };

    // Add debouncing to avoid too many API calls
    const timeoutId = setTimeout(fetchUserMedicines, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.emailId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emailId || !validateEmail(formData.emailId)) {
      newErrors.emailId = 'Please enter a valid email address';
    }
    if (!formData.medicine.trim()) {
      newErrors.medicine = 'Medicine name is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }
    if (!formData.packing) {
      newErrors.packing = 'Please select packing type';
    }
    if (!formData.qty || isNaN(formData.qty) || parseInt(formData.qty) <= 0) {
      newErrors.qty = 'Please enter a valid quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMedicineSelect = (e) => {
    const selectedId = e.target.value;
    setSelectedMedicineId(selectedId);

    if (selectedId) {
      const selectedMedicine = userMeds.find(med => med._id === selectedId);
      if (selectedMedicine) {
        setFormData({
          ...selectedMedicine,
          emailId: formData.emailId // Keep the current email
        });
        setSubmitMessage('');
        setErrors({});
        console.log("Selected medicine:", selectedMedicine);
      }
    } else {
      // Reset form but keep email
      setFormData({
        emailId: formData.emailId,
        medicine: '',
        company: '',
        expiryDate: '',
        packing: '',
        qty: '',
        otherInfo: '',
        _id: ''
      });
      setSelectedMedicineId('');
    }
  };

  const handleSubmit = async (isUpdate = false) => {
    // Validate form
    if (!validateForm()) return;

    // For updates, check if we have an ID
    if (isUpdate && !formData._id) {
      setSubmitMessage('Please select a medicine to update');
      setSubmitType('');
      return;
    }

    setIsSubmitting(true);
    setSubmitType(isUpdate ? 'update' : 'submit');
    setSubmitMessage('');

    try {
      let url, method, requestBody;

      if (isUpdate) {
        // Update existing medicine
        url = `http://localhost:5000/api/donors/availmed/${formData._id}`;
        method = 'PUT';
        requestBody = {
          medicine: formData.medicine,
          company: formData.company,
          expiryDate: formData.expiryDate,
          packing: formData.packing,
          qty: formData.qty,
          otherInfo: formData.otherInfo
        };
      } else {
        // Create new medicine
        url = `http://localhost:5000/api/donors/availmed`;
        method = 'POST';
        requestBody = {
          emailid: formData.emailId,
          medicine: formData.medicine,
          company: formData.company,
          expiryDate: formData.expiryDate,
          packing: formData.packing,
          qty: formData.qty,
          otherInfo: formData.otherInfo
        };
      }

      console.log(`Making ${method} request to:`, url);
      console.log('Request body:', requestBody);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        const successMessage = isUpdate
          ? 'Medicine updated successfully!'
          : 'Medicine added successfully!';

        setSubmitMessage(successMessage);

        // Refresh the medicines list
        if (formData.emailId && validateEmail(formData.emailId)) {
          setTimeout(async () => {
            try {
              const refreshResponse = await fetch(`http://localhost:5000/api/donors/availmed/${formData.emailId}`);
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.medicines && Array.isArray(refreshData.medicines)) {
                  setUserMeds(refreshData.medicines);
                }
              }
            } catch (error) {
              console.error("Error refreshing medicines list:", error);
            }
          }, 1000);
        }

        // Clear form after successful new submission (but not update)
        if (!isUpdate) {
          setTimeout(() => {
            resetForm();
          }, 2000);
        }

      } else {
        setSubmitMessage(`Error: ${data.message || data.error || "Failed to process request"}`);
      }

    } catch (error) {
      console.error('Network error:', error);
      setSubmitMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
      setSubmitType('');
    }
  };

  const resetForm = () => {
    setFormData({
      emailId: '',
      medicine: '',
      company: '',
      expiryDate: '',
      packing: '',
      qty: '',
      otherInfo: '',
      _id: ''
    });
    setErrors({});
    setSubmitMessage('');
    setSelectedMedicineId('');
    setUserMeds([]);
  };

  const packingOptions = [
    'tablets', 'capsules', 'syrup', 'injection', 'drops',
    'cream', 'powder', 'ointment', 'inhaler', 'patch', 'other'
  ];

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
              <Heart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Medicine Sharing Platform</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Share your unused medicines with those in need. Help make healthcare more accessible
            by donating medicines that are still safe and effective.
          </p>
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Medicine Details</h2>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-3 border-2 rounded-lg w-full transition-all duration-200 ${
                      errors.emailId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-2 focus:outline-none`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.emailId && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.emailId}
                  </p>
                )}
              </div>
            </div>

            {/* Medicine Selection Dropdown - Show when email is valid and medicines exist */}
            {validateEmail(formData.emailId) && userMeds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 className="text-amber-600 w-5 h-5" />
                  <h3 className="font-semibold text-amber-900">Edit Existing Medicine</h3>
                  {isLoadingUserMeds && (
                    <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">
                    Select a Medicine to Edit ({userMeds.length} found):
                  </label>
                  <select
                    value={selectedMedicineId}
                    onChange={handleMedicineSelect}
                    className="border-2 border-amber-300 rounded-lg p-3 w-full focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select medicine to edit or add new one</option>
                    {userMeds.map(med => (
                      <option key={med._id} value={med._id}>
                        {med.medicine} ({med.company}) — Exp: {med.expiryDate} — Qty: {med.qty}
                      </option>
                    ))}
                  </select>
                  <p className="text-amber-600 text-xs mt-1">
                    Select a medicine from your existing entries to edit its details, or leave blank to add a new one
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator when checking for medicines */}
            {validateEmail(formData.emailId) && isLoadingUserMeds && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-gray-600 animate-spin" />
                  <span className="text-gray-700">Checking for existing medicines...</span>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Medicine Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="medicine"
                    value={formData.medicine}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-3 border-2 rounded-lg w-full transition-all duration-200 ${
                      errors.medicine
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-2 focus:outline-none`}
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                {errors.medicine && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.medicine}
                  </p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-3 border-2 rounded-lg w-full transition-all duration-200 ${
                      errors.company
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-2 focus:outline-none`}
                    placeholder="e.g., GSK"
                  />
                </div>
                {errors.company && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.company}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className={`pl-10 pr-4 py-3 border-2 rounded-lg w-full transition-all duration-200 ${
                      errors.expiryDate
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-2 focus:outline-none`}
                  />
                </div>
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.expiryDate}
                  </p>
                )}
              </div>

              {/* Packing */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Packing Type *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="packing"
                    value={formData.packing}
                    onChange={handleInputChange}
                    className={`pl-10 pr-4 py-3 border-2 rounded-lg w-full transition-all duration-200 ${
                      errors.packing
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-2 focus:outline-none`}
                  >
                    <option value="">Select packing type</option>
                    {packingOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.packing && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.packing}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleInputChange}
                    min="1"
                    className={`pl-10 pr-4 py-3 border-2 rounded-lg w-full transition-all duration-200 ${
                      errors.qty
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    } focus:ring-2 focus:outline-none`}
                    placeholder="e.g., 20"
                  />
                </div>
                {errors.qty && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.qty}
                  </p>
                )}
              </div>
            </div>

            {/* Other Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Information
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="otherInfo"
                  value={formData.otherInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="Additional notes, storage conditions, dosage information, etc."
                />
              </div>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`p-4 rounded-lg flex items-start gap-2 ${
                submitMessage.includes('error') || submitMessage.includes('Error') || submitMessage.includes('Please select')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{submitMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting && submitType === 'submit' ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="text-sm sm:text-base">
                  {isSubmitting && submitType === 'submit' ? 'Submitting...' : 'Make Available to Public'}
                </span>
              </button>

              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting && submitType === 'update' ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <Edit3 className="w-5 h-5" />
                )}
                <span className="text-sm sm:text-base">
                  {isSubmitting && submitType === 'update' ? 'Updating...' : 'Update Information'}
                </span>
              </button>

              <button
                onClick={resetForm}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm sm:text-base">Reset Form</span>
              </button>
            </div>
          </div>
        </div>

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