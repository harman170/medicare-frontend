import React, { useState,useEffect } from 'react';
import { Upload, User, Phone, Mail, Calendar, MapPin, FileText, Send, Edit3, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';



const NeedyProfileForm = ({ user }) => {  // Accept user prop
  const [formData, setFormData] = useState({
    emailId: '',
    contactNumber: '',
    name: '',
    dob: '',
    gender: '',
    address: '',
    frontAdharUrl: '',
    backAdharUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [text, setText] = useState('');

const getUserEmailFromStorage = () => {
  const userData = localStorage.getItem('medishare_user_data');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.email || '';
    } catch {
      return '';
    }
  }
  return '';
};

 useEffect(() => {
  const email = getUserEmailFromStorage();
  if (email) {
    setFormData(prev => ({ ...prev, emailId: email }));
  }
}, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'needy_profile');
    data.append('cloud_name', 'dk10afadd');
    data.append('quality', 'auto:good'); // Improve image quality
  data.append('effect', 'improve'); // Auto-improve image
  data.append('flags', 'lossy'); // Better compression


    const response = await fetch('https://api.cloudinary.com/v1_1/dk10afadd/image/upload', {
      method: 'POST',
      body: data
    });

    const json = await response.json();
    if (json.secure_url) {
      return json.secure_url;
    } else {
      throw new Error('Upload failed');
    }
  };


  const extractTextFromImage = async (imageUrl) => {
  try {
    const res = await axios.get('https://api.ocr.space/parse/imageurl', {
      params: {
        apikey: 'K81193902588957',
        url: imageUrl,
        isOverlayRequired: false,
        language: 'eng', // Explicitly set language
        scale: true, // Enable scaling
        isTable: true, // Better for structured documents
        OCREngine: 2 // Use the more advanced engine
      }
    });

       const text = res.data.ParsedResults?.[0]?.ParsedText || '';
    console.log("✅ Full OCR Extracted Text:\n", text);
    if (!text || text.trim() === "") {
      alert("No text found in image. Please use a clearer Aadhaar image.");
    }
    return text || '';
  } catch (error) {
    console.error('OCR API Error:', error);
    alert('OCR failed. Please try again later.');
    return '';
  }
};



  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    console.log("Uploading file...", file);

    try {
      const imageUrl = await uploadToCloudinary(file);
      console.log("Uploaded to Cloudinary:", imageUrl);

      const text = await extractTextFromImage(imageUrl);
      console.log("Extracted text:", text);
if (fieldName === 'frontAdharUrl') {
  // Extract Gender
  const genderMatch = text.match(/(Male|Female|Other)/i);
  const gender = genderMatch ? genderMatch[0] : '';

  // Extract DOB
 const dobMatch = text.match(/(?:DOB|Date of Birth)[^\d]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
const fallbackDob = text.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/)?.[0] || '';
const dob = dobMatch ? dobMatch[1] : fallbackDob;

  // Extract Name — assumption: last line with capital letters not matching keywords
  const lines = text.split(/\n|[\r\t]+/).map(line => line.trim()).filter(Boolean);
  const probableName = lines.find(line =>
    /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(line) || /^[A-Z\s]+$/.test(line)
  ) || '';

  setFormData((prev) => ({
    ...prev,
    frontAdharUrl: imageUrl,
    name: probableName.trim(),
    dob,
    gender
  }));
}  else if (fieldName === 'backAdharUrl') {
  // Enhanced address extraction for Aadhaar cards
  const addressMatch = text.match(
    /(?:Address|Addr)[\s:]*([\s\S]*?)(?=\n*(?:VID:|Unique Identification|Government|INDIA|Aadhaar|आधार|[\d]{4}\s*\d{4}\s*\d{4}|$))/i
  );

  const address = addressMatch
    ? addressMatch[1]
        // Clean up the extracted address
        .replace(/(?:,|\.)\s+/g, ', ')  // Standardize separators
        .replace(/\s+/g, ' ')           // Collapse multiple spaces
        .replace(/\b\d{4,}\b/g, '')     // Remove long number sequences
        .replace(/[^a-zA-Z0-9\s,\-\.]/g, '') // Keep only valid chars
        .replace(/\b(TUTT|gov|in)\b/gi, '') // Remove common non-address terms
        .trim()
        .replace(/^[,\s.]+|[,\s.]+$/g, '') // Trim edge commas/spaces
    : 'Address not found';

  setFormData(prev => ({
    ...prev,
    backAdharUrl: imageUrl,
    address: address || 'Address extraction failed' // Fallback
  }));
}
    } catch (err) {
      console.error("Error during upload or OCR:", err);
      alert('OCR or upload failed.');
    } finally {
      setLoading(false);
    }
    const extractedText = await extractTextFromImage(imageUrl);
     setText(extractedText);  // 👈 Sets for visual debug


     console.log("Raw OCR Text:", text);
if (text) {
  console.log("Attempting to extract:");
  console.log("Name pattern match:", text.match(/(?:Name|नाम|NAME)\s*[:]?\s*([A-Za-z\s.]+)/im));
  console.log("DOB pattern match:", text.match(/(?:DOB|Date of Birth|जन्म तिथि|Year of Birth)\s*[:]?\s*(\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})/im));
  console.log("Gender pattern match:", text.match(/\b(Male|Female|Transgender|MALE|FEMALE|पुरुष|महिला)\b/im));
}
  };

  const handleFetch = async () => {
    if (!formData.emailId) {
      setErrors((prev) => ({ ...prev, emailId: 'Email is required to fetch' }));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/needy/get/${formData.emailId}`);
      const data = await res.json();
      if (res.ok) {
        setFormData(data);
        setIsModifying(true);
      } else {
        alert(data.message || 'Profile not found');
      }
    } catch (err) {
      alert('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async () => {
    if (!formData.emailId) {
      setErrors((prev) => ({ ...prev, emailId: 'Email is required to update' }));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/needy/update/${formData.emailId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Profile updated successfully');
        setIsModifying(false);
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      alert('Update request failed');
    } finally {
      setLoading(false);
    }
  };

 const handleSubmit = async () => {
  const requiredFields = ['emailId', 'contactNumber', 'frontAdharUrl', 'backAdharUrl'];
  const newErrors = {};
  requiredFields.forEach((f) => {
    if (!formData[f]) newErrors[f] = `${f} is required`;
  });
  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  setLoading(true);
  try {
    const res = await fetch('http://localhost:5000/api/needy/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Profile submitted successfully!');
    } else {
      alert(`❌ Submission failed: ${data.message}`);
    }
  } catch (err) {
    alert('❌ Error submitting profile. Please try again later.');
    console.error('Submission error:', err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Needy Profile Registration</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Contact Details Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" /> Contact Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId} readOnly
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              {errors.emailId && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.emailId}</span>
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your contact number"
                />
              </div>
              {errors.contactNumber && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.contactNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fetch Profile Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleFetch}
              disabled={loading}
              className="bg-gray-100 text-gray-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Edit3 className="w-5 h-5" />
              <span>Fetch Profile</span>
            </button>
          </div>
        </div>

        {/* Aadhaar Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Aadhaar Front Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Aadhaar Front</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'frontAdharUrl')}
                  className="hidden"
                  id="frontUpload"
                />
                <label
                  htmlFor="frontUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload front image</span>
                </label>

                {formData.frontAdharUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.frontAdharUrl}
                      alt="Aadhaar Front"
                      className="rounded-lg border border-gray-200 w-full h-32 object-cover shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">✓ Front image uploaded successfully</p>
                  </div>
                )}
              </div>
              {errors.frontAdharUrl && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.frontAdharUrl}</span>
                </p>
              )}
            </div>
          </div>

          {/* Aadhaar Back Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Aadhaar Back</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'backAdharUrl')}
                  className="hidden"
                  id="backUpload"
                />
                <label
                  htmlFor="backUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload back image</span>
                </label>

                {formData.backAdharUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.backAdharUrl}
                      alt="Aadhaar Back"
                      className="rounded-lg border border-gray-200 w-full h-32 object-cover shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">✓ Back image uploaded successfully</p>
                  </div>
                )}
              </div>
              {errors.backAdharUrl && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.backAdharUrl}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Extracted Information Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Extracted Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  name="name"
                  readOnly={!isModifying}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${!isModifying ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                  placeholder="Name will appear here"
                />
              </div>
            </div>

            {/* DOB Field */}
<div className="space-y-2">
  <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
  <div className="relative">
    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
    <input
      type="text"
      name="dob"
      value={formData.dob || ''}
      readOnly={!isModifying}
      onChange={handleInputChange}
      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
        !isModifying ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      }`}
      placeholder="DOB will appear here"
    />
  </div>
</div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Gender</label>
              <select
                value={formData.gender}
                name="gender"
                disabled={!isModifying}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${!isModifying ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.address}
                  name="address"
                  readOnly={!isModifying}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg resize-none ${!isModifying ? 'bg-gray-50' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                  placeholder="Address will appear here"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-12 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Profile</span>
              </>
            )}
          </button>

          {isModifying && (
            <button
              onClick={handleModify}
              disabled={loading}
              className="bg-purple-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Update Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeedyProfileForm;