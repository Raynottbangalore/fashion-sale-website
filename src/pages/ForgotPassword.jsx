import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { KeyRound, Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to reset password. Please check your email address.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fdfbf7]">
      {/* Background Pattern/Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/login_bg.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#fdfbf7] via-transparent to-[#fdfbf7]/50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-4 z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(138,28,49,0.15)] border border-white/50 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8a1c31] via-[#ffb800] to-[#8a1c31]"></div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8a1c31]/10 mb-6 group transition-all duration-300 hover:scale-110">
              <KeyRound className="h-8 w-8 text-[#8a1c31]" />
            </div>
            <h2 className="font-playfair text-3xl font-bold text-stone-900 tracking-tight">
              Reset Password
            </h2>
            <p className="mt-3 text-stone-500 font-light text-sm">
              Enter your email and we'll send you instructions to reset your password
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 bg-red-50/50 backdrop-blur-sm border-l-4 border-red-500 p-4 flex items-center rounded-r-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-green-50/50 backdrop-blur-sm border-l-4 border-green-500 p-4 flex items-center rounded-r-lg"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">{message}</p>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-[#8a1c31] transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8a1c31]/20 focus:border-[#8a1c31] transition-all text-stone-900 placeholder-stone-400 text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center py-4 px-4 bg-[#8a1c31] text-white text-sm font-semibold rounded-xl hover:bg-[#6b0f1f] shadow-lg shadow-[#8a1c31]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-[#8a1c31] hover:underline decoration-2 underline-offset-4 transition-all group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
