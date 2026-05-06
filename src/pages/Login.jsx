import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, login, googleSignIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const result = await login(email, password);
      if (result.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError("");
      setLoading(true);
      const result = await googleSignIn();
      if (result.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
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

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8a1c31]/10 mb-6 transition-all duration-300 hover:scale-110">
              <LogIn className="h-8 w-8 text-[#8a1c31]" />
            </div>
            <h2 className="font-playfair text-3xl font-bold text-stone-900 tracking-tight">
              Welcome Back
            </h2>
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

          <form 
            className="space-y-5" 
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
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
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-[#8a1c31] transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8a1c31]/20 focus:border-[#8a1c31] transition-all text-stone-900 placeholder-stone-400 text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" size="sm" className="text-xs font-medium text-[#8a1c31] hover:underline decoration-2 underline-offset-4">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center py-4 px-4 bg-[#8a1c31] text-white text-sm font-semibold rounded-xl hover:bg-[#6b0f1f] shadow-lg shadow-[#8a1c31]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white/80 text-stone-400 font-medium uppercase">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3.5 border border-stone-200 rounded-xl bg-white hover:bg-stone-50 hover:border-stone-300 transition-all group disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-stone-700 font-medium text-sm">Sign in with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-stone-500">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-[#8a1c31] hover:underline decoration-2 underline-offset-4 transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

