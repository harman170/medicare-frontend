import React, { useState } from 'react';
import {
  User, Mail, Calendar, MapPin, Phone, GraduationCap,
  Briefcase, Upload, Search, Save, Edit, Heart,
  AlertCircle, CheckCircle, Image, Home
} from 'lucide-react';
import axios from 'axios';


const DonorForm = () => {
  const [form, setForm] = useState({
    emailid: '', name: '', age: '', gender: '',
    curaddress: '', curcity: '', contact: '',
    qualification: '', occupation: ''
  });

  const [adhaarpic, setAdhaarPic] = useState(null);
  const [profilepic, setProfilePic] = useState(null);
  const [previewA, setPreviewA] = useState('');
  const [previewP, setPreviewP] = useState('');
  const [recordExists, setRecordExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (file, type) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'aadhaar') {
          setAdhaarPic(file);
          setPreviewA(e.target.result);
        } else {
          setProfilePic(file);
          setPreviewP(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetch = async () => {
    if (!form.emailid) return alert("Please enter an email ID first.");
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/donors/fetch/${form.emailid}`);
      if (res.data.status) {
        const data = res.data.donor;
        const { medicines, ...rest } = data;
console.log("Fetched data:", data);
        setForm(rest);
      setPreviewA(data.adhaarpic);
setPreviewP(data.profilepic);

        setRecordExists(true);
        alert("Record Found");
      } else {
        setRecordExists(false);
        alert("Record Not Found");
      }
    } catch (err) {
      alert("Fetch Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOrUpdate = async (action) => {
    const requiredFields = ['emailid', 'name', 'age', 'gender', 'contact'];
    const missingFields = requiredFields.filter(field => !form[field]);
    if (missingFields.length > 0) {
      alert(`Missing fields: ${missingFields.join(', ')}`);
      return;
    }

    if ((!adhaarpic && !previewA) || (!profilepic && !previewP))  {
      alert("Please upload both Aadhaar and Profile pictures.");
      return;
    }

    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));
    if (adhaarpic) fd.append("adhaarpic", adhaarpic);
if (profilepic) fd.append("profilepic", profilepic);


    setIsLoading(true);
    try {
      const url = action === 'save' ? 'save' : 'update';
      const res = await axios.post(`http://localhost:5000/api/donors/${url}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.msg);
    } catch (err) {
      alert("Update Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text' },
    { key: 'age', label: 'Age', icon: Calendar, type: 'number' },
    { key: 'gender', label: 'Gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other'], value: form.gender },
    { key: 'curaddress', label: 'Current Address', icon: Home, type: 'textarea' },
    { key: 'curcity', label: 'Current City', icon: MapPin, type: 'text' },
    { key: 'contact', label: 'Contact Number', icon: Phone, type: 'tel' },
    { key: 'qualification', label: 'Qualification', icon: GraduationCap, type: 'text' },
    { key: 'occupation', label: 'Occupation', icon: Briefcase, type: 'text' }
  ];

  return (
  //  Container div with padding and max-width
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header with heart icon and title */}
      <div className="mb-6 flex gap-4 items-center">
  <Heart className="h-8 w-8 text-red-500" />
  <h1 className="text-3xl font-bold">Donor Registration</h1>
</div>
{/* Email input with fetch button */}
     <div className="mb-6 flex gap-4">
        <Mail className="h-5 w-5 text-gray-500 mt-2" />
        <input name="emailid" value={form.emailid} onChange={handleChange} placeholder="Enter Email ID" className="flex-1 p-2 border rounded" />
        <button onClick={handleFetch} className="bg-blue-500 text-white px-4 py-2 rounded flex gap-1 items-center">
          <Search className="h-4 w-4" /> Fetch
        </button>
      </div>
{/*Dynamic Form Fields:Renders label with icon for each field */}
      <div className="grid md:grid-cols-2 gap-6">
        {formFields.map(({ key, label, icon: Icon, type, options }) => (
          <div key={key}>
            <label className="flex items-center gap-2 font-semibold text-sm mb-1">
              <Icon className="h-4 w-4" /> {label}
            </label>
            {/* Conditionally renders select input */}
            {type === 'select' ? (
              <select name={key} value={form[key]} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Select</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>

          // Conditionally renders textarea
          ) : type === 'textarea' ? (
              <textarea name={key} value={form[key]} onChange={handleChange} className="w-full p-2 border rounded" rows="3" />
            ) : (
              // Default case renders regular input
              <input type={type} name={key} value={form[key]} onChange={handleChange} className="w-full p-2 border rounded" />
            )}
          </div>
        ))}
      </div>
{/* File upload inputs with preview capability */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {[
          { label: 'Aadhaar Picture', file: adhaarpic, preview: previewA, type: 'aadhaar' },
          { label: 'Profile Picture', file: profilepic, preview: previewP, type: 'profile' }
        ].map(({ label, preview, type }) => (
          <div key={type}>
            <label className="block mb-1 font-semibold text-sm flex gap-1 items-center"><Image className="h-4 w-4" />{label}</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], type)} />
            {preview && <img src={preview} alt={`${type}-preview`} className="mt-2 h-32 object-cover rounded" />}
          </div>
        ))}
      </div>
{/* Save and Update buttons with appropriate disabled states */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => handleSaveOrUpdate('save')}
          disabled={isLoading || recordExists}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          <Save className="h-4 w-4 inline mr-1" /> Save
        </button>
        <button
          onClick={() => handleSaveOrUpdate('update')}
          disabled={isLoading || !recordExists}
          className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
        >
          <Edit className="h-4 w-4 inline mr-1" /> Update
        </button>
      </div>
    </div>
  );
};

export default DonorForm;
