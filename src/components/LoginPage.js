import React, { useState } from "react";
import { Mail, Lock, Loader, Phone } from "lucide-react";
import AuthService from "../services/AuthService";
import { toast } from "react-hot-toast";

export default function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [authMode, setAuthMode] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (authMode === "email") {
      if (!email) {
        setError("Please enter your email");
        return;
      }
      setLoading(true);
      setError("");
      try {
        await AuthService.requestOTP(email);
        setShowOTP(true);
        toast.success("OTP sent to your email!");
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to send OTP");
        toast.error("Failed to send OTP");
      } finally {
        setLoading(false);
      }
    } else if (authMode === "phone") {
      if (!phoneNumber) {
        setError("Please enter your phone number");
        return;
      }
      if (!/^\d{10}$/.test(phoneNumber)) {
        setError("Phone number must be 10 digits");
        return;
      }
      setLoading(true);
      setError("");
      try {
        await AuthService.sendPhoneOTP(phoneNumber);
        setShowOTP(true);
        toast.success("OTP sent to your phone!");
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to send OTP to phone");
        toast.error("Failed to send OTP");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let result;
      if (authMode === "email") {
        result = await AuthService.verifyOTP(email, otp);
      } else if (authMode === "phone") {
        result = await AuthService.verifyOTP(phoneNumber, otp);
      }
      toast.success("Login successful!");
      onLoginSuccess?.(result.user);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to verify OTP");
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await AuthService.login(email, password);
      toast.success("Login successful!");
      onLoginSuccess?.(result.user);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to login");
      toast.error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">EduTrack</h1>
            <p className="text-slate-600">Professional Learning Management</p>
          </div>

          {!showOTP ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email/Phone Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("email");
                    setPhoneNumber("");
                    setPassword("");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    authMode === "email"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("phone");
                    setEmail("");
                    setPassword("");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    authMode === "phone"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Phone
                </button>
              </div>

              {/* Email or Phone Field */}
              {authMode === "email" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number (10 digits)
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="9876543210"
                      maxLength="10"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Indian phone numbers (10 digits)
                  </p>
                </div>
              )}

              {/* Password Field - only for email mode */}
              {authMode === "email" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              {authMode === "email" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : null}
                  Sign In
                </button>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-600">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* OTP Option */}
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={
                  loading || (authMode === "email" ? !email : !phoneNumber)
                }
                className="w-full border border-indigo-600 hover:bg-indigo-50 disabled:opacity-50 text-indigo-600 font-medium py-2 rounded-lg transition"
              >
                Request OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-slate-700">
                  We've sent a 6-digit OTP to{" "}
                  <strong>{authMode === "email" ? email : phoneNumber}</strong>
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-center text-2xl font-bold focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : null}
                Verify OTP
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-slate-600 hover:text-slate-800 font-medium py-2"
              >
                Back to{" "}
                {authMode === "email" ? "Email/Password" : "Phone Number"}
              </button>
            </form>
          )}

          {/* Create Account Link */}
          {!showOTP && (
            <div className="mt-6 text-center text-sm">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Demo credentials available on request</p>
          </div>
        </div>
      </div>
    </div>
  );
}
