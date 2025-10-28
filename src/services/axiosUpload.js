import axios from "axios";

const axiosUpload = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Replace with your API base URL
  timeout: 60000, // 60 seconds timeout for uploads
});

// Add a request interceptor
axiosUpload.interceptors.request.use(
  (config) => {
    // Add authorization token to headers if available
    config.headers["Content-Type"] = "multipart/form-data";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosUpload.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);

export default axiosUpload;
