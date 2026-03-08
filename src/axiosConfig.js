// src/axiosConfig.js - Updated for production backend - Build: 2024-03-08-18:06

import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log('=== AXIOS CONFIG ===');
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final baseURL:', baseURL);
console.log('===================');

const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true, // if using cookies for auth
});

export default instance;