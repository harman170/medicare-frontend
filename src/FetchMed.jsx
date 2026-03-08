import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Calendar, Package, Building2, AlertTriangle, Filter, SortAsc, User, Clock, Shield, Eye, Mail } from 'lucide-react';

const MedicineListing = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [emailId, setEmailId] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get logged-in user's email from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setEmailId(email);
    }
  }, []);

  const handleFetch = async () => {
    if (!emailId) {
      alert('Please enter an email ID');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/donors/availmed/${emailId}`);
      const data = await res.json();
      if (res.ok) {
        setMedicines(data.medicines);
      } else {
        alert(data.message || 'Failed to fetch medicines.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching medicines');
    } finally {
      setIsLoading(false);
    }
  };


  const handleEdit = (med) => {
    navigate('/donor/availmed', { state: { formData: med } });
    console.log('Edit medicine:', med);
  };

 const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/donors/availmed/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMedicines((prev) => prev.filter((med) => med._id !== id));
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting medicine');
    }
  };


  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 ? 'critical' : diffDays <= 90 ? 'warning' : 'good';
  };

  const getStockStatus = (qty) => (qty <= 20 ? 'low' : qty <= 50 ? 'medium' : 'high');

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'low': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'high': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };


  // data processing filtering nad sorting
  const filteredAndSortedMedicines = useMemo(() => {
    let filtered = medicines.filter(medicine => {
      const matchesSearch = medicine.medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.company.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'expiring') return matchesSearch && getExpiryStatus(medicine.expiryDate) !== 'good';
      if (filterBy === 'low-stock') return matchesSearch && getStockStatus(medicine.qty) === 'low';

      return matchesSearch;
    });

   filtered.sort((a, b) => {
  switch (sortBy) {
    case 'name':
      return (a.medicine || '').localeCompare(b.medicine || '');
    case 'expiry':
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    case 'quantity':
      return b.qty - a.qty;
    case 'company':
      return (a.company || '').localeCompare(b.company || '');
    default:
      return 0;
  }
});


    return filtered;
  }, [medicines, searchTerm, sortBy, filterBy]);

  const stats = useMemo(() => {
    const total = medicines.length;
    const expiring = medicines.filter(m => getExpiryStatus(m.expiryDate) !== 'good').length;
    const lowStock = medicines.filter(m => getStockStatus(m.qty) === 'low').length;
    const totalQty = medicines.reduce((sum, m) => sum + Number(m.qty), 0);

    return { total, expiring, lowStock, totalQty };
  }, [medicines]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-blue-100">
          <div className="flex justify-between items-start mb-6">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
               Listed Medicines
              </h1>
              <p className="text-gray-600">Track and manage your medicine donations efficiently</p>
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

          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Donor Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                placeholder="Enter donor email to fetch medicines"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={isLoading}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Search size={18} />
              {isLoading ? 'Fetching...' : 'Fetch Medicines'}
            </button>
          </div>
        </div>

        {medicines.length > 0 && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Medicines</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalQty}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      placeholder="Search medicines or companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <select
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:border-teal-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="expiry">Sort by Expiry</option>
                    <option value="quantity">Sort by Quantity</option>
                    <option value="company">Sort by Company</option>
                  </select>

                  <select
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:border-teal-500"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <option value="all">All Medicines</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medicine Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAndSortedMedicines.map((medicine) => {
                const expiryStatus = getExpiryStatus(medicine.expiryDate);
                const stockStatus = getStockStatus(medicine.qty);
                const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);

                return (
                  <div key={medicine._id} className="bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{medicine.medicine}</h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {medicine.company}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(medicine._id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Packing:</span>
                          </div>
                          <p className="text-sm font-medium">{medicine.packing}</p>
                        </div>

                        {/* <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Batch No:</span>
                          </div>
                          <p className="text-sm font-medium">{medicine.batchNo || 'N/A'}</p>
                        </div> */}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${getStockColor(stockStatus)}`}>
                          <div className="text-sm font-medium">Quantity</div>
                          <div className="text-lg font-bold">{medicine.qty}</div>
                          <div className="text-xs capitalize">{stockStatus} stock</div>
                        </div>

                        <div className={`p-3 rounded-lg border ${getStatusColor(expiryStatus)}`}>
                          <div className="text-sm font-medium">Expiry</div>
                          <div className="text-sm font-bold">{formatDate(medicine.expiryDate)}</div>
                          <div className="text-xs">
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                          </div>
                        </div>
                      </div>

                      {expiryStatus === 'critical' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">Critical: Expires in {daysUntilExpiry} days</span>
                        </div>
                      )}

                      {stockStatus === 'low' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-700">Low stock: Only {medicine.qty} units left</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAndSortedMedicines.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No medicines found matching your criteria</p>
              </div>
            )}
          </>
        )}

        {medicines.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Enter an email address to fetch medicines</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading medicines...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineListing;