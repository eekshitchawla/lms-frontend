import axios from "axios";
import AuthService from "./AuthService";
import toast from "react-hot-toast";

const projectApiUrl =
  process.env.REACT_APP_PROJECT_API_URL || "http://localhost:8080/api/v1";
const catalogApiUrl =
  process.env.REACT_APP_CATALOG_API_URL || "http://localhost:8081/api/v1";
const adminApiUrl =
  process.env.REACT_APP_ADMIN_API_URL || "http://localhost:8082/api/v1";

export const api = axios.create({
  baseURL: projectApiUrl,
});

export const catalogApi = axios.create({
  baseURL: catalogApiUrl,
});

export const adminApi = axios.create({
  baseURL: adminApiUrl,
});

// Add request interceptor for both APIs
const setupInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Add response interceptor for token refresh
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If token expired and we haven't already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await AuthService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          AuthService.logout();
          window.location.href = "/login";
          toast.error("Session expired. Please login again.");
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      if (error.response?.status === 403) {
        toast.error(
          "Access denied. You don't have permission for this action.",
        );
      }

      return Promise.reject(error);
    },
  );
};

// Setup interceptors
setupInterceptor(api);
setupInterceptor(catalogApi);
setupInterceptor(adminApi);

export default api;
