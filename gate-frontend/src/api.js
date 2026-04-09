import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ must match backend port
});

export default API;
