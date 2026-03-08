// src/axiosConfig.js - Updated for production backend - Build: 2024-03-08-18:45

import axios from "axios";

// Root of backend (Render or local)
const rootURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// This is what all API calls should use
export const API_BASE_URL = `${rootURL}/api`;

console.log('=== AXIOS CONFIG ===');
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final baseURL:', API_BASE_URL);
console.log('===================');

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default instance;