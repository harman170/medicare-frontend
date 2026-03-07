//npm run dev
//node app.js



// import React, { useState, useEffect, createContext, useContext } from 'react';
// import axios from 'axios';
// import {
//   Heart, Shield, Users, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft
// } from 'lucide-react';

// // API Configuration
// const API_BASE_URL = 'http://localhost:5000/api';
// const AUTH_TOKEN_KEY = 'medishare_auth_token';
// const REFRESH_TOKEN_KEY = 'medishare_refresh_token';
// const USER_DATA_KEY = 'medishare_user_data';

// const AuthContext = createContext();

// // Enhanced Auth Utils with better token management
// const authUtils = {
//   setTokens: (accessToken, refreshToken) => {
//     localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
//     localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
//     console.log('🔐 Tokens stored:', {
//       accessExpiry: authUtils.getTokenExpiry(accessToken),
//       refreshExpiry: authUtils.getTokenExpiry(refreshToken)
//     });
//   },

//   getAccessToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
//   getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

//   removeTokens: () => {
//     localStorage.removeItem(AUTH_TOKEN_KEY);
//     localStorage.removeItem(REFRESH_TOKEN_KEY);
//     localStorage.removeItem(USER_DATA_KEY);
//     console.log('🗑️ All tokens cleared from storage');
//   },

//   setUserData: (userData) => {
//     localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
//   },

//   getUserData: () => {
//     const userData = localStorage.getItem(USER_DATA_KEY);
//     return userData ? JSON.parse(userData) : null;
//   },

//   // Check if access token is valid and not expired
//   isAccessTokenValid: () => {
//     const token = authUtils.getAccessToken();
//     if (!token) return false;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;
//       const bufferTime = 300; // 5 minute buffer before expiry (for auto-refresh)
//       const isValid = payload.exp > (currentTime + bufferTime);

//       return isValid;
//     } catch (error) {
//       console.error('Token validation error:', error);
//       return false;
//     }
//   },

//   // Check if refresh token exists and is valid
//   isRefreshTokenValid: () => {
//     const refreshToken = authUtils.getRefreshToken();
//     if (!refreshToken) return false;

//     try {
//       const payload = JSON.parse(atob(refreshToken.split('.')[1]));
//       const currentTime = Date.now() / 1000;
//       const isValid = payload.exp > currentTime;

//       console.log('🔍 Refresh token check:', {
//         expires: new Date(payload.exp * 1000).toLocaleString(),
//         current: new Date().toLocaleString(),
//         isValid
//       });

//       return isValid;
//     } catch (error) {
//       console.error('Refresh token validation error:', error);
//       return false;
//     }
//   },

//   // Get time until token expires (in seconds)
//   getTokenTimeRemaining: () => {
//     const token = authUtils.getAccessToken();
//     if (!token) return 0;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;
//       return Math.max(0, payload.exp - currentTime);
//     } catch (error) {
//       return 0;
//     }
//   },

//   // Get time until refresh token expires (in seconds)
//   getRefreshTokenTimeRemaining: () => {
//     const token = authUtils.getRefreshToken();
//     if (!token) return 0;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;
//       return Math.max(0, payload.exp - currentTime);
//     } catch (error) {
//       return 0;
//     }
//   },

//   // Get token expiry time for logging
//   getTokenExpiry: (token) => {
//     if (!token) return null;
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return new Date(payload.exp * 1000).toLocaleString();
//     } catch (error) {
//       return null;
//     }
//   },

//   decodeToken: (token = null) => {
//     const tokenToUse = token || authUtils.getAccessToken();
//     if (!tokenToUse) return null;

//     try {
//       return JSON.parse(atob(tokenToUse.split('.')[1]));
//     } catch (error) {
//       console.error('Token decode error:', error);
//       return null;
//     }
//   }
// };

// // Enhanced API instance with automatic token refresh
// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Track if we're currently refreshing to prevent multiple simultaneous requests
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error);
//     } else {
//       resolve(token);
//     }
//   });

//   failedQueue = [];
// };

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = authUtils.getAccessToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Enhanced response interceptor with automatic token refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log('🚨 401 Unauthorized - attempting token refresh');

//       if (isRefreshing) {
//         // If we're already refreshing, queue this request
//         console.log('⏳ Token refresh in progress, queueing request');
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);o
//         }).catch(err => {
//           return Promise.reject(err);
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refreshToken = authUtils.getRefreshToken();

//       if (refreshToken && authUtils.isRefreshTokenValid()) {
//         console.log('🔄 Attempting automatic token refresh...');
//         try {
//           const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
//             refreshToken
//           });

//           const { accessToken, refreshToken: newRefreshToken } = response.data;

//           // Update tokens
//           authUtils.setTokens(accessToken, newRefreshToken || refreshToken);

//           // Update user data if provided
//           if (response.data.user) {
//             authUtils.setUserData(response.data.user);
//           }

//           console.log('✅ Token refresh successful');

//           // Process queued requests
//           processQueue(null, accessToken);

//           // Retry original request
//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//           return api(originalRequest);
//         } catch (refreshError) {
//           console.log('❌ Token refresh failed - logging out user');
//           // Refresh failed, logout user
//           processQueue(refreshError, null);
//           authUtils.removeTokens();

//           // Trigger logout in auth context
//           window.dispatchEvent(new CustomEvent('auth:forceLogout', {
//             detail: { reason: 'Token refresh failed' }
//           }));

//           return Promise.reject(refreshError);
//         } finally {
//           isRefreshing = false;
//         }
//       } else {
//         console.log('❌ No valid refresh token - logging out user');
//         // No valid refresh token, logout user
//         isRefreshing = false;
//         authUtils.removeTokens();

//         // Trigger logout in auth context
//         window.dispatchEvent(new CustomEvent('auth:forceLogout', {
//           detail: { reason: 'No valid refresh token' }
//         }));
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // Enhanced Auth API
// const authAPI = {
//   login: async (email, password) => {
//     try {
//       const response = await api.post('/users/login', { email, password });
//       const data = response.data;

//       if (data.status && data.token && data.refreshToken) {
//         authUtils.setTokens(data.token, data.refreshToken);
//         authUtils.setUserData({
//           id: data.user.id,
//           email: data.user.email,
//           userType: data.user.userType,
//           status: data.user.status
//         });
//       }

//       return data;
//     } catch (error) {
//       console.error('Login error:', error);
//       throw new Error(error.response?.data?.msg || 'Login failed. Please try again.');
//     }
//   },

//   signup: async (email, password, userType) => {
//     try {
//       const response = await api.post('/users/signup', {
//         email,
//         password,
//         userType,
//         status: "unblock",
//         dos: new Date()
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Signup error:', error);
//       throw new Error(error.response?.data?.msg || 'Signup failed. Please try again.');
//     }
//   },

//   forgotPassword: async (email) => {
//     try {
//       const response = await api.post('/users/forgot-password', { email });
//       return response.data;
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       throw new Error(error.response?.data?.msg || 'Failed to send reset email.');
//     }
//   },

//   resetPassword: async (token, newPassword) => {
//     try {
//       const response = await api.post('/users/reset-password', { token, newPassword });
//       return response.data;
//     } catch (error) {
//       console.error('Reset password error:', error);
//       throw new Error(error.response?.data?.msg || 'Failed to reset password.');
//     }
//   },

//   refreshToken: async () => {
//     try {
//       const refreshToken = authUtils.getRefreshToken();
//       const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
//         refreshToken
//       });

//       const data = response.data;
//       if (data.status && data.token) {
//         const newRefreshToken = data.refreshToken || refreshToken;
//         authUtils.setTokens(data.token, newRefreshToken);

//         if (data.user) {
//           authUtils.setUserData(data.user);
//         }
//       }
//       return data;
//     } catch (error) {
//       console.error('Refresh token error:', error);
//       authUtils.removeTokens();
//       throw error;
//     }
//   },

//   logout: async () => {
//     try {
//       await api.post('/users/logout');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       authUtils.removeTokens();
//     }
//   }
// };

// // Enhanced Auth Provider with automatic token refresh
// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [tokenStatus, setTokenStatus] = useState('checking');
//   const [debugInfo, setDebugInfo] = useState({});
//   const [logoutReason, setLogoutReason] = useState('');

//   // Auto-refresh timer
//   useEffect(() => {
//     let refreshTimer;
//     let debugTimer;

//     const setupAutoRefresh = () => {
//       if (authUtils.isAccessTokenValid()) {
//         const timeRemaining = authUtils.getTokenTimeRemaining();
//         const refreshTime = Math.max(10000, (timeRemaining - 300) * 1000); // Refresh 5 minutes before expiry, minimum 10s

//         console.log(`⏰ Auto-refresh scheduled in ${Math.round(refreshTime/1000)} seconds`);
//         setTokenStatus('Active');

//         refreshTimer = setTimeout(async () => {
//           try {
//             console.log('🔄 Executing scheduled token refresh...');
//             await authAPI.refreshToken();
//             console.log('✅ Scheduled token refresh successful');
//             setTokenStatus('Active');
//             setupAutoRefresh(); // Set up next refresh
//           } catch (error) {
//             console.error('❌ Scheduled token refresh failed:', error);
//             setTokenStatus('Expired');
//             logout();
//           }
//         }, refreshTime);
//       }
//     };

//     // Update debug info every 5 seconds instead of every minute
//     const updateDebugInfo = () => {
//       const accessTimeRemaining = authUtils.getTokenTimeRemaining();
//       const refreshTimeRemaining = authUtils.getRefreshTokenTimeRemaining();
//       const hasValidAccess = authUtils.isAccessTokenValid();
//       const hasValidRefresh = authUtils.isRefreshTokenValid();

//       setDebugInfo({
//         hasAccessToken: !!authUtils.getAccessToken(),
//         hasRefreshToken: !!authUtils.getRefreshToken(),
//         accessTokenValid: hasValidAccess,
//         refreshTokenValid: hasValidRefresh,
//         accessTimeRemaining: Math.round(accessTimeRemaining),
//         refreshTimeRemaining: Math.round(refreshTimeRemaining),
//         willRefreshIn: hasValidAccess ? Math.max(0, Math.round(accessTimeRemaining - 300)) : 0
//       });
//     };
//     if (isAuthenticated) {
//       setupAutoRefresh();
//       updateDebugInfo();
//       debugTimer = setInterval(updateDebugInfo, 5000); // Update every 5 seconds
//     }

//     return () => {
//       if (refreshTimer) {
//         clearTimeout(refreshTimer);
//       }
//       if (debugTimer) {
//         clearInterval(debugTimer);
//       }
//     };
//   }, [isAuthenticated]);

//   // Listen for forced logout events
//   useEffect(() => {
//     const handleForceLogout = (event) => {
//       console.log('🚨 Force logout triggered:', event.detail.reason);
//       setLogoutReason(event.detail.reason);
//       forceLogout();
//     };

//     window.addEventListener('auth:forceLogout', handleForceLogout);
//     return () => window.removeEventListener('auth:forceLogout', handleForceLogout);
//   }, []);

//   // Check for token expiry every 30 seconds
//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const checkTokenExpiry = () => {
//       const hasValidAccess = authUtils.isAccessTokenValid();
//       const hasValidRefresh = authUtils.isRefreshTokenValid();

//       console.log('⏰ Token expiry check:', { hasValidAccess, hasValidRefresh });

//       // If both tokens are invalid, force logout
//       if (!hasValidAccess && !hasValidRefresh) {
//         console.log('🚨 Both tokens expired - forcing logout');
//         setLogoutReason('Both access and refresh tokens have expired');
//         forceLogout();
//       }
//     };

//     // Check immediately and then every 30 seconds
//     checkTokenExpiry();
//     const interval = setInterval(checkTokenExpiry, 30000);

//     return () => clearInterval(interval);
//   }, [isAuthenticated]);
//   // Check auth status on mount
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = () => {
//     const hasValidAccess = authUtils.isAccessTokenValid();
//     const hasValidRefresh = authUtils.isRefreshTokenValid();
//     const userData = authUtils.getUserData();

//     console.log('🔍 Auth status check:', {
//       hasValidAccess,
//       hasValidRefresh,
//       userData,
//       tokenTimeRemaining: authUtils.getTokenTimeRemaining()
//     });

//     if (hasValidAccess && userData) {
//       console.log('✅ User authenticated with valid access token');
//       setIsAuthenticated(true);
//       setUser(userData);
//       setTokenStatus('Active');
//     } else if (hasValidRefresh && userData) {
//       console.log('🔄 Access token expired, attempting refresh...');
//       setTokenStatus('Refreshing');
//       // Try to refresh token
//       authAPI.refreshToken()
//         .then(() => {
//           console.log('✅ Token refresh successful during auth check');
//           setIsAuthenticated(true);
//           setUser(userData);
//           setTokenStatus('Active');
//         })
//         .catch(() => {
//           console.log('❌ Token refresh failed during auth check');
//           setIsAuthenticated(false);
//           setUser(null);
//           setTokenStatus('Expired');
//         });
//     } else {
//       console.log('❌ No valid tokens found');
//       setIsAuthenticated(false);
//       setUser(null);
//       setTokenStatus('None');
//     }

//     setLoading(false);
//   };

//   const login = async (email, password) => {
//     try {
//       const data = await authAPI.login(email, password);
//       if (data.status) {
//         console.log('✅ Login successful');
//         setTokenStatus('Active');
//         checkAuthStatus();
//         return data;
//       }
//       throw new Error(data.msg);
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = async () => {
//     console.log('👋 User logging out...');
//     await authAPI.logout();
//     setUser(null);
//     setIsAuthenticated(false);
//     setTokenStatus('None');
//     setDebugInfo({});
//     setLogoutReason('');
//   };

//   const forceLogout = () => {
//     console.log('🚨 Force logout - clearing all auth state');
//     authUtils.removeTokens();
//     setUser(null);
//     setIsAuthenticated(false);
//     setTokenStatus('None');
//     setDebugInfo({});
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     loading,
//     tokenStatus,
//     debugInfo,
//     logoutReason,
//     login,
//     logout,
//     forceLogout,
//     checkAuthStatus
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // useAuth hook
// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // Protected Route Component
// const ProtectedRoute = ({ children, fallback }) => {
//   const { isAuthenticated, loading, logoutReason } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return fallback || (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
//         <div className="text-center">
//           {logoutReason && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <h3 className="text-red-800 font-semibold mb-2">Session Expired</h3>
//               <p className="text-red-600 text-sm">{logoutReason}</p>
//             </div>
//           )}
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
//           <p className="text-gray-600 mb-6">Please login to access this page.</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return children;
// };

// // HomePage Component
// const HomePage = ({ setCurrentView }) => {
//   const features = [
//     {
//       icon: Shield,
//       title: 'Secure & Compliant',
//       desc: 'HIPAA-compliant platform ensuring patient data privacy and security.',
//       colorClass: 'bg-blue-100 text-blue-600'
//     },
//     {
//       icon: Users,
//       title: 'Global Network',
//       desc: 'Connect with healthcare professionals from around the world.',
//       colorClass: 'bg-green-100 text-green-600'
//     },
//     {
//       icon: Heart,
//       title: 'Better Outcomes',
//       desc: 'Collaborative care leading to improved patient outcomes.',
//       colorClass: 'bg-purple-100 text-purple-600'
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
//       <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
//                 <Heart className="h-8 w-8 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
//                 MediShare
//               </h1>
//             </div>
//             <div className="flex space-x-4">
//               <button
//                 onClick={() => setCurrentView('login')}
//                 className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setCurrentView('signup')}
//                 className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <section className="py-20 px-6">
//         <div className="max-w-6xl mx-auto text-center">
//           <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
//             Share Medical Knowledge,
//             <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent block">
//               Save Lives Together
//             </span>
//           </h2>
//           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
//             Connect with healthcare professionals worldwide, share expertise, and collaborate on patient care through our secure medical platform.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button
//               onClick={() => setCurrentView('signup')}
//               className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
//             >
//               <span>Get Started</span>
//               <ArrowRight className="h-5 w-5" />
//             </button>
//             <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors">
//               Learn More
//             </button>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 px-6 bg-white/50">
//         <div className="max-w-6xl mx-auto">
//           <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
//             Why Choose MediShare?
//           </h3>
//           <div className="grid md:grid-cols-3 gap-8">
//             {features.map((item, idx) => (
//               <div key={idx} className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
//                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${item.colorClass}`}>
//                   <item.icon className="h-8 w-8" />
//                 </div>
//                 <h4 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h4>
//                 <p className="text-gray-600">{item.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// // LoginPage Component
// const LoginPage = ({ setCurrentView }) => {
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { login, logoutReason } = useAuth();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!loginEmail || !loginPassword) {
//       alert('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = await login(loginEmail, loginPassword);
//       if (data.status) {
//         alert(`Login successful! Welcome ${data.user?.userType || 'user'}!`);
//         setCurrentView('dashboard'); // Navigate to dashboard after login
//         // Navigate to dashboard or protected area
//       } else {
//         alert(data.msg || 'Login failed');
//       }
//     } catch (error) {
//       alert(error.message || 'Login failed. Try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <div className="text-center mb-8">
//             <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl w-fit mx-auto mb-4">
//               <Heart className="h-8 w-8 text-white" />
//             </div>
//             {logoutReason && (
//               <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-yellow-800 text-sm font-medium">Session Expired</p>
//                 <p className="text-yellow-600 text-xs mt-1">{logoutReason}</p>
//               </div>
//             )}
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
//             <p className="text-gray-600">Sign in to your MediShare account</p>
//           </div>

//           <form className="space-y-6" onSubmit={handleLogin}>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={loginEmail}
//                   onChange={(e) => setLoginEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={loginPassword}
//                   onChange={(e) => setLoginPassword(e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             <div className="text-right">
//               <button
//                 type="button"
//                 onClick={() => setCurrentView('forgot-password')}
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Forgot your password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Signing In...' : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-8 text-center">
//             <p className="text-gray-600">
//               Don't have an account?{" "}
//               <button
//                 onClick={() => setCurrentView("signup")}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Sign up here
//               </button>
//             </p>
//           </div>

//           <button
//             onClick={() => setCurrentView("home")}
//             className="mt-4 w-full text-gray-500 hover:text-gray-700 font-medium"
//           >
//             ← Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // SignUpPage Component
// const SignUpPage = ({ setCurrentView }) => {
//   const [signupEmail, setSignupEmail] = useState('');
//   const [signupPassword, setSignupPassword] = useState('');
//   const [signupUsertype, setSignupUsertype] = useState('needy');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (!signupEmail || !signupPassword) {
//       alert('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = await authAPI.signup(signupEmail, signupPassword, signupUsertype);
//       if (data.status) {
//         alert("Signup successful! Confirmation email sent.");
//         setCurrentView("login");
//       } else {
//         alert(data.msg);
//       }
//     } catch (error) {
//       alert(error.message || "Signup failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6 py-12">
//       <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
//         <div className="text-center mb-8">
//           <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl w-fit mx-auto mb-4">
//             <Heart className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
//           <p className="text-gray-600">Join MediShare and start your journey</p>
//         </div>

//         <form className="space-y-6" onSubmit={handleSignup}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="email"
//                 value={signupEmail}
//                 onChange={(e) => setSignupEmail(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="you@example.com"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={signupPassword}
//                 onChange={(e) => setSignupPassword(e.target.value)}
//                 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="Create a password"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
//             <select
//               value={signupUsertype}
//               onChange={(e) => setSignupUsertype(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="needy">Needy</option>
//               <option value="donor">Donor</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? 'Creating Account...' : 'Create Account'}
//           </button>
//         </form>

//         <div className="mt-8 text-center">
//           <p className="text-gray-600">
//             Already have an account?{' '}
//             <button
//               onClick={() => setCurrentView('login')}
//               className="text-blue-600 hover:text-blue-800 font-medium"
//             >
//               Sign in here
//             </button>
//           </p>
//         </div>

//         <button
//           onClick={() => setCurrentView('home')}
//           className="mt-4 w-full text-gray-500 hover:text-gray-700 font-medium"
//         >
//           ← Back to Home
//         </button>
//       </div>
//     </div>
//   );
// };

// // ForgotPasswordPage Component
// const ForgotPasswordPage = ({ setCurrentView }) => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     if (!email) {
//       alert('Please enter your email address');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = await authAPI.forgotPassword(email);
//       if (data.status) {
//         setMessage('Password reset link has been sent to your email address. Please check your inbox.');
//       } else {
//         setMessage(data.msg || 'Failed to send reset email. Please try again.');
//       }
//     } catch (error) {
//       setMessage(error.message || 'An error occurred. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <div className="text-center mb-8">
//             <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl w-fit mx-auto mb-4">
//               <Heart className="h-8 w-8 text-white" />
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
//             <p className="text-gray-600">Enter your email to receive a password reset link</p>
//           </div>

//           {message && (
//             <div className={`mb-6 p-4 rounded-lg ${message.includes('sent') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
//               {message}
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleForgotPassword}>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                   placeholder="Enter your email address"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Sending...' : 'Send Reset Link'}
//             </button>
//           </form>

//           <div className="mt-8 text-center">
//             <p className="text-gray-600">
//               Remember your password?{" "}
//               <button
//                 onClick={() => setCurrentView("login")}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Sign in here
//               </button>
//             </p>
//           </div>

//           <button
//             onClick={() => setCurrentView("home")}
//             className="mt-4 w-full text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center space-x-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             <span>Back to Home</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ResetPasswordPage Component
// const ResetPasswordPage = ({ setCurrentView }) => {
//   const [token, setToken] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     if (!token || !newPassword || !confirmPassword) {
//       alert('Please fill in all fields');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     if (newPassword.length < 6) {
//       alert('Password must be at least 6 characters long');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = await authAPI.resetPassword(token, newPassword);
//       if (data.status) {
//         setMessage('Password has been reset successfully! You can now login with your new password.');
//         setTimeout(() => {
//           setCurrentView('login');
//         }, 3000);
//       } else {
//         setMessage(data.msg || 'Failed to reset password. Please try again.');
//       }
//     } catch (error) {
//       setMessage(error.message || 'An error occurred. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-6">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <div className="text-center mb-8">
//             <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl w-fit mx-auto mb-4">
//               <Heart className="h-8 w-8 text-white" />
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
//             <p className="text-gray-600">Enter your reset token and new password</p>
//           </div>

//           {message && (
//             <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
//               {message}
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleResetPassword}>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Reset Token
//               </label>
//               <input
//                 type="text"
//                 value={token}
//                 onChange={(e) => setToken(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                 placeholder="Enter the token from your email"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 New Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                   placeholder="Enter your new password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm New Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type={showConfirmPassword ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
//                   placeholder="Confirm your new password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                 >
//                   {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Resetting...' : 'Reset Password'}
//             </button>
//           </form>

//           <div className="mt-8 text-center">
//             <p className="text-gray-600">
//               Remember your password?{" "}
//               <button
//                 onClick={() => setCurrentView("login")}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Sign in here
//               </button>
//             </p>
//           </div>

//           <button
//             onClick={() => setCurrentView("home")}
//             className="mt-4 w-full text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center space-x-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             <span>Back to Home</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Dashboard Component (example of protected content)
// const Dashboard = ({ setCurrentView }) => {
//   const { user, logout, tokenStatus, debugInfo } = useAuth();
//   const [apiData, setApiData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleLogout = async () => {
//     await logout();
//     setCurrentView('home');
//   };

//   // Simulate API call to demonstrate automatic token refresh
//   const fetchProtectedData = async () => {
//     setLoading(true);
//     try {
//       // This will automatically refresh token if needed
//       const response = await api.get('/users/profile');
//       setApiData(response.data);
//       console.log('✅ Protected API call successful');
//     } catch (error) {
//       console.error('❌ Protected API call failed:', error);
//       alert('Failed to fetch data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
//       <header className="bg-white shadow-lg">
//         <div className="max-w-6xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl">
//                 <Heart className="h-8 w-8 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
//                 MediShare Dashboard
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm">
//                 <span className="text-gray-500">Token Status: </span>
//                 <span className={`font-medium ${
//                   tokenStatus === 'Active' ? 'text-green-600' :
//                   tokenStatus === 'Refreshing' ? 'text-yellow-600' :
//                   tokenStatus === 'Expired' ? 'text-red-600' : 'text-gray-600'
//                 }`}>
//                   {tokenStatus}
//                 </span>
//               </div>
//               <span className="text-gray-600">Welcome, {user?.email}</span>
//               <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-6 py-8">
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="bg-blue-50 p-6 rounded-xl">
//               <h3 className="text-lg font-semibold text-blue-900 mb-2">User Information</h3>
//               <p className="text-blue-700">Email: {user?.email}</p>
//               <p className="text-blue-700">Type: {user?.userType}</p>
//               <p className="text-blue-700">Status: {user?.status}</p>
//               <p className="text-blue-700">Token: {tokenStatus}</p>
//             </div>
//             <div className="bg-green-50 p-6 rounded-xl">
//               <h3 className="text-lg font-semibold text-green-900 mb-2">Quick Actions</h3>
//               <div className="space-y-2">
//                 <button
//                   onClick={fetchProtectedData}
//                   disabled={loading}
//                   className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 >
//                   {loading ? 'Loading...' : 'Test API Call'}
//                 </button>
//                 <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
//                   View Profile
//                 </button>
//                 <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
//                   Settings
//                 </button>
//               </div>
//             </div>
//           </div>

//           {apiData && (
//             <div className="mt-6 bg-gray-50 p-4 rounded-lg">
//               <h4 className="font-semibold text-gray-900 mb-2">API Response:</h4>
//               <pre className="text-sm text-gray-700 overflow-auto">
//                 {JSON.stringify(apiData, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// // Main App Component
// function MediShare() {
//   const [currentView, setCurrentView] = useState('home');
//   const { debugInfo, isAuthenticated, logoutReason } = useAuth();

//   // Auto-redirect to login when logged out with reason
//   useEffect(() => {
//     if (!isAuthenticated && logoutReason && currentView !== 'login') {
//       console.log('🔄 Auto-redirecting to login due to:', logoutReason);
//       setCurrentView('login');
//     }
//   }, [isAuthenticated, logoutReason, currentView]);

//   useEffect(() => {
//     // Debug token on initial load
//     console.log('Initial token check:', authUtils.decodeToken());
//   }, []);

//   return (
//     <AuthProvider>
//         {currentView === 'home' && <HomePage setCurrentView={setCurrentView} />}
//         {currentView === 'login' && <LoginPage setCurrentView={setCurrentView} />}
//         {currentView === 'signup' && <SignUpPage setCurrentView={setCurrentView} />}
//         {currentView === 'forgot-password' && <ForgotPasswordPage setCurrentView={setCurrentView} />}
//         {currentView === 'reset-password' && <ResetPasswordPage setCurrentView={setCurrentView} />}
//         {currentView === 'dashboard' && (
//           <ProtectedRoute>
//             <Dashboard setCurrentView={setCurrentView} />
//           </ProtectedRoute>
//         )}

//         {/* Debug Panel - Remove in production */}
//       {/* Enhanced Debug Panel - Remove in production */}
//       {debugInfo && Object.keys(debugInfo).length > 0 && (
//         <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm">
//           <h4 className="font-bold mb-2 text-yellow-400">🔧 Token Debug Info</h4>
//           <div className="space-y-1">
//             <div className="flex justify-between">
//               <span>Access Token:</span>
//               <span className={debugInfo.hasAccessToken ? 'text-green-400' : 'text-red-400'}>
//                 {debugInfo.hasAccessToken ? '✅ Present' : '❌ Missing'}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Refresh Token:</span>
//               <span className={debugInfo.hasRefreshToken ? 'text-green-400' : 'text-red-400'}>
//                 {debugInfo.hasRefreshToken ? '✅ Present' : '❌ Missing'}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Access Valid:</span>
//               <span className={debugInfo.accessTokenValid ? 'text-green-400' : 'text-red-400'}>
//                 {debugInfo.accessTokenValid ? '✅ Yes' : '❌ No'}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Refresh Valid:</span>
//               <span className={debugInfo.refreshTokenValid ? 'text-green-400' : 'text-red-400'}>
//                 {debugInfo.refreshTokenValid ? '✅ Yes' : '❌ No'}
//               </span>
//             </div>
//             <hr className="border-gray-600 my-2" />
//             <div className="text-blue-300">
//               <div>Access expires in: {Math.floor(debugInfo.accessTimeRemaining / 60)}m {debugInfo.accessTimeRemaining % 60}s</div>
//               <div>Refresh expires in: {Math.floor(debugInfo.refreshTimeRemaining / 3600)}h {Math.floor((debugInfo.refreshTimeRemaining % 3600) / 60)}m</div>
//               {debugInfo.willRefreshIn > 0 && (
//                 <div className="text-yellow-300">Auto-refresh in: {Math.floor(debugInfo.willRefreshIn / 60)}m {debugInfo.willRefreshIn % 60}s</div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </AuthProvider>
//   );
// }

// // Wrap the main component with AuthProvider
// function Apps() {
//   return (
//     <AuthProvider>
//       <MediShare />
//     </AuthProvider>
//   );
// }

// export default Apps;


import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import {
  Heart, Shield, Users, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, HandHeart,
  Menu, X, ChevronLeft, ChevronRight, Package, MapPin, Star, CheckCircle, FileText,
  Truck, Phone, User, LogOut, Settings, TrendingUp, Clock, Calendar, Activity,
  BookOpen, Zap, Database, MessageSquare, Video, UserCheck, Globe, Award,
  Stethoscope, Pill, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'medishare_auth_token';
const REFRESH_TOKEN_KEY = 'medishare_refresh_token';
const USER_DATA_KEY = 'medishare_user_data';

// Auth Context
const AuthContext = createContext();

// Enhanced Auth Utils with better token management
const authUtils = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('🔐 Tokens stored:', {
      accessExpiry: authUtils.getTokenExpiry(accessToken),
      refreshExpiry: authUtils.getTokenExpiry(refreshToken)
    });
  },

  getAccessToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  removeTokens: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    console.log('🗑️ All tokens cleared from storage');
  },

  setUserData: (userData) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  getUserData: () => {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  isAccessTokenValid: () => {
    const token = authUtils.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const bufferTime = 300;
      const isValid = payload.exp > (currentTime + bufferTime);
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  isRefreshTokenValid: () => {
    const refreshToken = authUtils.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      return isValid;
    } catch (error) {
      console.error('Refresh token validation error:', error);
      return false;
    }
  },

  getTokenTimeRemaining: () => {
    const token = authUtils.getAccessToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      return 0;
    }
  },

  getRefreshTokenTimeRemaining: () => {
    const token = authUtils.getRefreshToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      return 0;
    }
  },

  getTokenExpiry: (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000).toLocaleString();
    } catch (error) {
      return null;
    }
  },

  decodeToken: (token = null) => {
    const tokenToUse = token || authUtils.getAccessToken();
    if (!tokenToUse) return null;

    try {
      return JSON.parse(atob(tokenToUse.split('.')[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }
};

// Enhanced API instance with automatic token refresh
const api = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = authUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't run token refresh for auth endpoints - login/signup return 401 for wrong credentials
    const requestUrl = originalRequest?.url || originalRequest?.baseURL + (originalRequest?.url || '') || '';
    const authEndpoints = ['/users/login', '/users/signup', '/users/forgot-password', '/users/reset-password', '/users/refresh-token'];
    if (authEndpoints.some(path => requestUrl.includes(path))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🚨 401 Unauthorized - attempting token refresh');

      if (isRefreshing) {
        console.log('⏳ Token refresh in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authUtils.getRefreshToken();

      if (refreshToken && authUtils.isRefreshTokenValid()) {
        console.log('🔄 Attempting automatic token refresh...');
        try {
          const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          authUtils.setTokens(accessToken, newRefreshToken || refreshToken);

          if (response.data.user) {
            authUtils.setUserData(response.data.user);
          }

          console.log('✅ Token refresh successful');
          processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.log('❌ Token refresh failed - logging out user');
          processQueue(refreshError, null);
          authUtils.removeTokens();

          window.dispatchEvent(new CustomEvent('auth:forceLogout', {
            detail: { reason: 'Token refresh failed' }
          }));

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        console.log('❌ No valid refresh token - logging out user');
        isRefreshing = false;
        authUtils.removeTokens();

        window.dispatchEvent(new CustomEvent('auth:forceLogout', {
          detail: { reason: 'No valid refresh token' }
        }));
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced Auth API
const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const data = response.data;

      if (data.status && data.token && data.refreshToken) {
        authUtils.setTokens(data.token, data.refreshToken);
        authUtils.setUserData({
          id: data.user.id,
          email: data.user.email,
          userType: data.user.userType,
          status: data.user.status
        });
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.msg || 'Login failed. Please try again.');
    }
  },

  signup: async (email, password, userType) => {
    try {
      const response = await api.post('/users/signup', {
        email,
        password,
        userType,
        status: "unblock",
        dos: new Date()
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.msg || 'Signup failed. Please try again.');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error(error.response?.data?.msg || 'Failed to send reset email.');
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = authUtils.getRefreshToken();
      const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, {
        refreshToken
      });

      const data = response.data;
      if (data.status && data.token) {
        const newRefreshToken = data.refreshToken || refreshToken;
        authUtils.setTokens(data.token, newRefreshToken);

        if (data.user) {
          authUtils.setUserData(data.user);
        }
      }
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      authUtils.removeTokens();
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authUtils.removeTokens();
    }
  }
};

// Enhanced Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState('checking');
  const [debugInfo, setDebugInfo] = useState({});
  const [logoutReason, setLogoutReason] = useState('');

  useEffect(() => {
    let refreshTimer;
    let debugTimer;

    const setupAutoRefresh = () => {
      if (authUtils.isAccessTokenValid()) {
        const timeRemaining = authUtils.getTokenTimeRemaining();
        const refreshTime = Math.max(10000, (timeRemaining - 300) * 1000);

        console.log(`⏰ Auto-refresh scheduled in ${Math.round(refreshTime/1000)} seconds`);
        setTokenStatus('Active');

        refreshTimer = setTimeout(async () => {
          try {
            console.log('🔄 Executing scheduled token refresh...');
            await authAPI.refreshToken();
            console.log('✅ Scheduled token refresh successful');
            setTokenStatus('Active');
            setupAutoRefresh();
          } catch (error) {
            console.error('❌ Scheduled token refresh failed:', error);
            setTokenStatus('Expired');
            logout();
          }
        }, refreshTime);
      }
    };

    const updateDebugInfo = () => {
      const accessTimeRemaining = authUtils.getTokenTimeRemaining();
      const refreshTimeRemaining = authUtils.getRefreshTokenTimeRemaining();
      const hasValidAccess = authUtils.isAccessTokenValid();
      const hasValidRefresh = authUtils.isRefreshTokenValid();

      setDebugInfo({
        hasAccessToken: !!authUtils.getAccessToken(),
        hasRefreshToken: !!authUtils.getRefreshToken(),
        accessTokenValid: hasValidAccess,
        refreshTokenValid: hasValidRefresh,
        accessTimeRemaining: Math.round(accessTimeRemaining),
        refreshTimeRemaining: Math.round(refreshTimeRemaining),
        willRefreshIn: hasValidAccess ? Math.max(0, Math.round(accessTimeRemaining - 300)) : 0
      });
    };

    if (isAuthenticated) {
      setupAutoRefresh();
      updateDebugInfo();
      debugTimer = setInterval(updateDebugInfo, 5000);
    }

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      if (debugTimer) clearInterval(debugTimer);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleForceLogout = (event) => {
      console.log('🚨 Force logout triggered:', event.detail.reason);
      setLogoutReason(event.detail.reason);
      forceLogout();
    };

    window.addEventListener('auth:forceLogout', handleForceLogout);
    return () => window.removeEventListener('auth:forceLogout', handleForceLogout);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = () => {
      const hasValidAccess = authUtils.isAccessTokenValid();
      const hasValidRefresh = authUtils.isRefreshTokenValid();

      if (!hasValidAccess && !hasValidRefresh) {
        console.log('🚨 Both tokens expired - forcing logout');
        setLogoutReason('Both access and refresh tokens have expired');
        forceLogout();
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const hasValidAccess = authUtils.isAccessTokenValid();
    const hasValidRefresh = authUtils.isRefreshTokenValid();
    const userData = authUtils.getUserData();

    if (hasValidAccess && userData) {
      console.log('✅ User authenticated with valid access token');
      setIsAuthenticated(true);
      setUser(userData);
      setTokenStatus('Active');
    } else if (hasValidRefresh && userData) {
      console.log('🔄 Access token expired, attempting refresh...');
      setTokenStatus('Refreshing');
      authAPI.refreshToken()
        .then(() => {
          console.log('✅ Token refresh successful during auth check');
          setIsAuthenticated(true);
          setUser(userData);
          setTokenStatus('Active');
        })
        .catch(() => {
          console.log('❌ Token refresh failed during auth check');
          setIsAuthenticated(false);
          setUser(null);
          setTokenStatus('Expired');
        });
    } else {
      console.log('❌ No valid tokens found');
      setIsAuthenticated(false);
      setUser(null);
      setTokenStatus('None');
    }

    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.status) {
        console.log('✅ Login successful');
        setTokenStatus('Active');
        checkAuthStatus();
        return data;
      }
      throw new Error(data.msg);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    console.log('👋 User logging out...');
    await authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setTokenStatus('None');
    setDebugInfo({});
    setLogoutReason('');
  };

  const forceLogout = () => {
    console.log('🚨 Force logout - clearing all auth state');
    authUtils.removeTokens();
    setUser(null);
    setIsAuthenticated(false);
    setTokenStatus('None');
    setDebugInfo({});
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    tokenStatus,
    debugInfo,
    logoutReason,
    login,
    logout,
    forceLogout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Modal Component
const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, logoutReason } = useAuth();

  const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  setIsLoading(true);
  try {
    const data = await login(email, password);
    if (data.status) {
      alert(`Login successful! Welcome ${data.user?.userType || 'user'}!`);

      // Store user data in localStorage for dashboard components
      localStorage.setItem('userEmail', data.user?.email);
      localStorage.setItem('userType', data.user?.userType);

      // Role-based dashboard selection
      if (data.user?.userType === "needy") {
        // recipient dashboard
        window.location.href = "/needy/dashboard"; // Replace with your dashboard route logic
      } else if (data.user?.userType === "donor") {
        // donor dashboard
        window.location.href = "/donor/Donordash"; // Replace with your dashboard route logic
      } else {
        // fallback
        window.location.href = "/Pages/Medishare";
      }
      onClose();
      setEmail('');
      setPassword('');
    } else {
      alert(data.msg || 'Login failed');
    }
  } catch (error) {
    alert(error.message || 'Login failed. Try again.');
  } finally {
    setIsLoading(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your MediShare account</p>
        </div>

        {logoutReason && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium">Session Expired</p>
            <p className="text-yellow-600 text-xs mt-1">{logoutReason}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Signup Modal Component
const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('needy');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authAPI.signup(email, password, userType);
      if (data.status) {
        alert("Signup successful! Confirmation email sent.");
        onSwitchToLogin();
        setEmail('');
        setPassword('');
        setUserType('needy');
      } else {
        alert(data.msg);
      }
    } catch (error) {
      alert(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join MediShare</h2>
          <p className="text-gray-600">Create your account to start helping others</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="needy">Request medicines I need</option>
                <option value="donor">Donate unused medicines</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Forgot Password Modal Component
const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      if (data.status) {
        setMessage('Password reset link has been sent to your email address. Please check your inbox.');
      } else {
        setMessage(data.msg || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('sent')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleForgotPassword}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-800 font-medium flex items-center justify-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Debug Panel Component
const DebugPanel = ({ debugInfo }) => {
  if (!debugInfo || Object.keys(debugInfo).length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2 text-yellow-400">🔧 Token Debug Info</h4>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Access Token:</span>
          <span className={debugInfo.hasAccessToken ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasAccessToken ? '✅ Present' : '❌ Missing'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Refresh Token:</span>
          <span className={debugInfo.hasRefreshToken ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasRefreshToken ? '✅ Present' : '❌ Missing'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Access Valid:</span>
          <span className={debugInfo.accessTokenValid ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.accessTokenValid ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Refresh Valid:</span>
          <span className={debugInfo.refreshTokenValid ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.refreshTokenValid ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        <hr className="border-gray-600 my-2" />
        <div className="text-blue-300">
          <div>Access expires in: {Math.floor(debugInfo.accessTimeRemaining / 60)}m {debugInfo.accessTimeRemaining % 60}s</div>
          <div>Refresh expires in: {Math.floor(debugInfo.refreshTimeRemaining / 3600)}h {Math.floor((debugInfo.refreshTimeRemaining % 3600) / 60)}m</div>
          {debugInfo.willRefreshIn > 0 && (
            <div className="text-yellow-300">Auto-refresh in: {Math.floor(debugInfo.willRefreshIn / 60)}m {debugInfo.willRefreshIn % 60}s</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const MediShare = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const { isAuthenticated, user, logout, debugInfo, logoutReason } = useAuth();

  const slides = [
    {
      id: 1,
      title: "Donate Medicines, Save Lives",
      subtitle: "Connect donors with those in need",
      description: "Share unused, unexpired medicines and medical equipment with people who need them most.",
      image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/94cf8dcd-3a4d-50c8-aceb-09a87278b6ab/01a84265-e09c-5682-92ce-681c89a1afe2.jpg",
      bgColor: "from-green-600 to-blue-600"
    },
    {
      id: 2,
      title: "Medical Equipment Sharing",
      subtitle: "Give a second life to medical devices",
      description: "Donate gently used medical equipment to clinics and individuals in underserved communities.",
      image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/85862dd1-7727-59d3-955d-d4bfbff69ad5/47522958-e1de-564a-b829-64f86a961dc0.jpg",
      bgColor: "from-blue-600 to-green-600"
    },
    {
      id: 3,
      title: "Verified Donations Only",
      subtitle: "Quality-checked medicines and equipment",
      description: "All donations are verified for authenticity, expiry dates, and functionality before distribution.",
      image: "https://images.theconversation.com/files/424091/original/file-20210930-20-1owddsq.jpg?ixlib=rb-4.1.0&rect=0%2C0%2C2121%2C1412&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip",
      bgColor: "from-green-700 to-blue-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Lives Impacted", icon: Heart },
    { number: "25K+", label: "Successful Donations", icon: Package },
    { number: "200+", label: "Cities Covered", icon: MapPin },
    { number: "98%", label: "Satisfaction Rate", icon: Star }
  ];

  const faqs = [
    {
      question: "What types of medicines can I donate?",
      answer: "We accept all unexpired medicines in their original packaging. This includes prescription drugs, over-the-counter medications, vitamins, and supplements. Controlled substances and narcotics are not accepted for safety reasons."
    },
    {
      question: "How do I know the medicines are safe?",
      answer: "All donated medicines undergo a rigorous verification process by our team of pharmacists and volunteers. We check expiry dates, packaging integrity, and storage conditions. Only medicines that pass our quality checks are distributed."
    },
    {
      question: "Is there any cost to request medicines?",
      answer: "There is no cost for requesting medicines. However, we may ask for a nominal shipping contribution if you can afford it. No one is denied assistance due to inability to contribute."
    },
    {
      question: "How long does it take to receive requested medicines?",
      answer: "Once your request is verified, we aim to deliver medicines within 7-14 days. Emergency requests are prioritized. You'll receive tracking information once your package is dispatched."
    }
  ];

  const stories = [
    {
      name: "Rajesh Kumar",
      role: "Medicine Donor",
      image: "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "After my father's passing, we had unused cancer medication. MediShare helped us donate it to someone who couldn't afford it. Knowing it helped another family brought us comfort.",
      location: "New Delhi, India",
      roleColor: "text-green-600"
    },
    {
      name: "Sunita Patel",
      role: "Medicine Recipient",
      image: "https://images.pexels.com/photos/7643950/pexels-photo-7643950.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "As a widow with limited income, I struggled to afford my diabetes medication. MediShare connected me with donors. Now I can manage my condition without financial stress.",
      location: "Mumbai, India",
      roleColor: "text-blue-600"
    },
    {
      name: "Dr. Ananya Singh",
      role: "Rural Clinic Director",
      image: "https://images.pexels.com/photos/8376181/pexels-photo-8376181.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "Our rural clinic received a donated ultrasound machine through MediShare. It has transformed our diagnostic capabilities and helped us serve our community better.",
      location: "Bhopal, India",
      roleColor: "text-green-600"
    }
  ];

  const teamMembers = [
    {
      name: "Mr.Rajesh Bansal",
      designation: "Chief Executive Officer & Co-Founder",
      image: "https://user-gen-media-assets.s3.amazonaws.com/gemini_images/b0b724d0-f47b-408a-a2dd-e8b7c358812f.png",
      bio: "Board-certified supply chain manager with 15+ years of experience in healthcare management and medical technology innovation.",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        instagram: "#"
      }
    },
    {
      name: "Harmanjot Kaur",
      designation: "Technology Director & Co-Founder",
      image: "https://user-gen-media-assets.s3.amazonaws.com/gemini_images/94cc072a-ecd9-487f-8fe8-a786b6a0a888.png",
      bio: "Full-stack engineer and healthcare technology specialist with expertise in building secure, scalable medical platforms.",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        instagram: "#"
      }
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Auto-redirect to login when logged out with reason
  useEffect(() => {
    if (!isAuthenticated && logoutReason) {
      console.log('🔄 Auto-showing login modal due to:', logoutReason);
      setShowLoginModal(true);
    }
  }, [isAuthenticated, logoutReason]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setIsMenuOpen(false);
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
    setIsMenuOpen(false);
  };

  const closeAllModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setShowForgotPasswordModal(false);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  const switchToForgotPassword = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <HandHeart className="h-6 w-6 text-white fill-current" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MediShare</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Home</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-green-600 font-medium transition-colors">How It Works</a>
              <a href="#donate" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Donate</a>
              <a href="#request" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Request</a>
              <a href="#impact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Impact</a>
              <a href="#team" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Team</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
            </nav>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {user?.userType}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleLoginClick}
                  className="text-green-600 font-medium hover:text-green-700 transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                >
                  Login
                </button>
                <button
                  onClick={handleSignupClick}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <a href="#home" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">Home</a>
              <a href="#how-it-works" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">How It Works</a>
              <a href="#donate" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">Donate</a>
              <a href="#request" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">Request</a>
              <a href="#impact" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">Impact</a>
              <a href="#team" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">Team</a>
              <a href="#contact" className="block text-gray-700 font-medium py-2 hover:text-green-600 transition-colors">Contact</a>
              {isAuthenticated ? (
                <div className="pt-4 border-t space-y-3">
                  <div className="text-center text-gray-600 text-sm">
                    {user?.email} ({user?.userType})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-3">
                  <button
                    onClick={handleLoginClick}
                    className="w-full text-green-600 font-medium py-2 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 rounded-lg font-medium transition-colors shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Slideshow */}
      <section id="home" className="pt-16 relative overflow-hidden">
        <div className="relative h-96 lg:h-[600px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0' :
                index < currentSlide ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className={`h-full bg-gradient-to-r ${slide.bgColor} flex items-center relative`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt="Medicine donation"
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                  <div className="grid lg:grid-cols-2 gap-12 items-center text-white">
                    <div className="animate-fadeIn">
                      <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">{slide.title}</h1>
                      <h2 className="text-xl lg:text-2xl mb-4 opacity-90 font-medium">{slide.subtitle}</h2>
                      <p className="text-lg mb-8 opacity-80 max-w-lg leading-relaxed">{slide.description}</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {isAuthenticated ? (
                          <>
                            <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2">
                              <span>{user?.userType === 'donor' ? 'Donate Now' : 'Find Medicines'}</span>
                              <ArrowRight className="h-5 w-5" />
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
                              View Profile
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleSignupClick}
                              className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                            >
                              <span>Get Started</span>
                              <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleLoginClick}
                              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                            >
                              Login
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">How MediShare Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A simple process to donate medicines or request what you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <div className="text-2xl font-bold text-green-600">1</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">List Your Donation/Request</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Donors list unused medicines or equipment. Those in need can request specific items.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <div className="text-2xl font-bold text-blue-600">2</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Verification Process</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our team verifies all medicines for expiry dates and equipment for functionality.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <div className="text-2xl font-bold text-green-600">3</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Delivery & Pickup</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                We arrange pickup from donors and delivery to those in need through our network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section id="donate" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Donate Unused Medicines</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Your unused medicines can save lives. We ensure they reach people who need them most through a verified process.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Check Expiry Dates</h3>
                    <p className="text-gray-600">Only unexpired medicines in original packaging are accepted</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Schedule Pickup</h3>
                    <p className="text-gray-600">We'll arrange a convenient time to collect your donation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Get Receipt & Tracking</h3>
                    <p className="text-gray-600">Receive a donation receipt and track where your medicines help</p>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2">
                  <span>{user?.userType === 'donor' ? 'Start Donation' : 'Switch to Donor'}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSignupClick}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Join as Donor</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="relative">
              <img
                src="https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/c75bcfe9-cc2e-53e9-a366-0be68df6ca3c/033a9d4a-2da3-5883-8a27-a10e0dcbefe1.jpg"
                alt="Medicine donation"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Quality Verified</h4>
                    <p className="text-sm text-gray-600">All medicines are checked before distribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Section */}
      <section id="request" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7cfdab0f-da06-523c-9a42-1fb234bb6632/c5b7d861-017b-59d1-b034-acaef3f6d0b8.jpg"
                alt="Request medicine"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Request Medicines You Need</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                If you need medicines or medical equipment but can't afford them, we're here to help.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Submit Request</h3>
                    <p className="text-gray-600">Fill a simple form with your needs and prescription details</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Verification</h3>
                    <p className="text-gray-600">Our team verifies your request and prescription</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Receive Delivery</h3>
                    <p className="text-gray-600">Get your medicines delivered discreetly to your doorstep</p>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2">
                  <span>{user?.userType === 'needy' ? 'Request Medicines' : 'Switch to Needy'}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSignupClick}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Join to Request</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section id="impact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Stories of Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">How your donations are making a difference in people's lives</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center mb-6">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{story.name}</h4>
                    <p className={story.roleColor}>{story.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{story.quote}"
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{story.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about donating and requesting medicines</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Amazing Team */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Our Amazing Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the passionate individuals behind MediShare who are dedicated to making healthcare accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-green-600 font-semibold mb-4">{member.designation}</p>
                  <p className="text-gray-600 mb-6 leading-relaxed">{member.bio}</p>

                  <div className="flex space-x-4">
                    <a
                      href={member.social.facebook}
                      className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center hover:bg-sky-200 transition-colors"
                    >
                      <Twitter className="h-5 w-5 text-sky-600" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    </a>
                    <a
                      href={member.social.instagram}
                      className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section with Bathinda Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Our Location</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visit us at our headquarters in Bathinda, Punjab, or get in touch with our team
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">MediShare Headquarters</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">
                      MediShare Foundation<br />
                      Sector 14, Urban Estate<br />
                      Bathinda, Punjab 151001<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+91 164 223 4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">contact@medishare.org</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Office Hours</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109781.17190724927!2d74.8451!3d30.2118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391761ab8f8e2c51%3A0x4e1b9e1b8f8e2c51!2sBathinda%2C%20Punjab!5e0!3m2!1sen!2sin!4v1635789012345!5m2!1sen!2sin"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MediShare Location - Bathinda, Punjab"
                  className="w-full h-96"
                ></iframe>
              </div>
              <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">We're here!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join thousands of donors and recipients creating a community of healthcare sharing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl">
                  {user?.userType === 'donor' ? 'Start Donating' : 'Find Medicines'}
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200">
                  View Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignupClick}
                  className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Join MediShare
                </button>
                <button
                  onClick={handleLoginClick}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HandHeart className="h-7 w-7 text-white fill-current" />
                </div>
                <span className="text-3xl font-bold">MediShare</span>
              </div>
              <p className="text-gray-300 mb-8 max-w-md leading-relaxed text-lg">
                Connecting donors with unused medicines to people in need. Making healthcare accessible to all.
              </p>
              <div className="space-y-3">
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Verified Donations Only</span>
                </div>
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Registered Non-Profit Organization</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#donate" className="text-gray-300 hover:text-white transition-colors">Donate</a></li>
                <li><a href="#request" className="text-gray-300 hover:text-white transition-colors">Request</a></li>
                <li><a href="#impact" className="text-gray-300 hover:text-white transition-colors">Our Impact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-gray-300">
                  <Mail className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white mb-1">Email</div>
                    <div className="text-sm">contact@medishare.org</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-gray-300">
                  <Phone className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white mb-1">Helpline</div>
                    <div className="text-sm">+91 164 223 4567</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-gray-300">
                  <MapPin className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white mb-1">Headquarters</div>
                    <div className="text-sm">Bathinda, Punjab, India</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2025 MediShare. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Transparency Report</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeAllModals}
        onSwitchToSignup={switchToSignup}
        onSwitchToForgotPassword={switchToForgotPassword}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={closeAllModals}
        onSwitchToLogin={switchToLogin}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={closeAllModals}
        onSwitchToLogin={switchToLogin}
      />

      {/* Debug Panel - Remove in production */}
      <DebugPanel debugInfo={debugInfo} />
    </div>
  );
};

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <MediShare />
    </AuthProvider>
  );
}

export default App;