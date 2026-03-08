// src/axiosConfig.js

import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true, // if using cookies for auth
});

export default instance;