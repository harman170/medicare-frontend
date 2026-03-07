// src/axiosConfig.js

import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:5000", // your backend API
    withCredentials: true, // if using cookies for auth
});

export default instance;