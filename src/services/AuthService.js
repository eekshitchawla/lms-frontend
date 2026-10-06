import axios from "axios";
import { jwtDecode } from "jwt-decode";

const authApi = axios.create({
  baseURL:
    process.env.REACT_APP_ADMIN_API_URL || "http://localhost:8082/api/v1",
});

const AuthService = {
  // Register new user
  register: async (fullName, email, phoneNumber, password) => {
    try {
      const res = await authApi.post("/auth/register", {
        fullName,
        email,
        phoneNumber,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      }
      throw new Error("No token returned");
    } catch (err) {
      throw err.response?.data?.message || err.message || "Registration failed";
    }
  },

  // Login with email and password
  login: async (email, password) => {
    try {
      const res = await authApi.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      }
      throw new Error("No token returned");
    } catch (err) {
      throw err.response?.data?.message || err.message || "Login failed";
    }
  },

  // Request OTP via email for passwordless login
  requestOTP: async (email) => {
    try {
      const res = await authApi.post("/auth/request-otp", { email });
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || err.message || "OTP request failed";
    }
  },

  // Send OTP via phone for passwordless login
  sendPhoneOTP: async (phoneNumber) => {
    try {
      const res = await authApi.post("/auth/send-otp", { phoneNumber });
      return res.data;
    } catch (err) {
      throw (
        err.response?.data?.message ||
        err.message ||
        "Failed to send OTP to phone"
      );
    }
  },

  // Verify OTP and get token
  verifyOTP: async (emailOrPhone, otp) => {
    try {
      // Detect if input is phone number (10 digits) or email
      const isPhoneNumber = /^\d{10}$/.test(emailOrPhone);

      const payload = isPhoneNumber
        ? { phone_number: emailOrPhone, otp }
        : { email: emailOrPhone, otp };

      const res = await authApi.post("/auth/verify-otp", payload);
      console.log("OTP Verify Response:", res.data);

      // Handle different backend response structures
      const token = res.data.token || res.data.authToken;
      const user = res.data.user || res.data.userData;

      if (token) {
        localStorage.setItem("authToken", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        return { token, user };
      }
      throw new Error("No token returned from backend");
    } catch (err) {
      console.error("OTP Verify Error:", err);
      throw (
        err.response?.data?.message || err.message || "OTP verification failed"
      );
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("authToken");
  },

  // Get current user
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Get user role
  getUserRole: () => {
    const token = AuthService.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role || null;
    } catch (err) {
      console.error("Failed to decode token:", err);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = AuthService.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (err) {
      return false;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  // Refresh token (if backend supports)
  refreshToken: async () => {
    try {
      const res = await authApi.post("/auth/refresh");
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        return res.data.token;
      }
      throw new Error("No token returned");
    } catch (err) {
      AuthService.logout();
      throw err;
    }
  },
};

export default AuthService;
