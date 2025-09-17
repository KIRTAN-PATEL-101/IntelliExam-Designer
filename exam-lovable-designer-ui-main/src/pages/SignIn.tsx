// src/pages/SignIn.tsx
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, Shield, User, CheckCircle } from 'lucide-react';
import { AuthContext } from "@/context/AuthContext";
import axios from 'axios';
import axiosInstance from '@/lib/axios';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectedUserType, setDetectedUserType] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const { isAuthenticated, user, loading, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔄 Redirect if already logged in based on user type
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const redirectPath = user.user_type === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [loading, isAuthenticated, user]); // Remove navigate from dependencies

  // Function to check user type when email is entered
  const checkUserType = async (email: string) => {
    console.log('🔍 Checking user type for email:', email);
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email format, resetting detection');
      setDetectedUserType(null);
      return;
    }

    console.log('⏳ Starting user type check...');
    setIsCheckingUser(true);
    
    try {
      // Create a simple API endpoint to check user type by email
      const response = await axiosInstance.post('/auth/check-user-type/', {
        email: email
      });
      
      console.log('✅ User type detected:', response.data.user_type);
      setDetectedUserType(response.data.user_type);
    } catch (error: any) {
      console.log('❌ User type check failed:', error?.response?.status, error?.response?.data);
      // User doesn't exist or other error - reset detection
      setDetectedUserType(null);
    } finally {
      console.log('🏁 User type check completed');
      setIsCheckingUser(false);
    }
  };

  // Debounced email check - DISABLED to prevent infinite refresh
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     checkUserType(formData.email);
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ✅ call AuthContext login (handles axios + token storage)
      const userInfo = await login(formData.email, formData.password);
      
      // Immediate redirect based on user type
      const redirectPath = userInfo?.user_type === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
      
    } catch (err: any) {
      console.error("❌ Login failed:", err?.response?.data);
      setError(err?.response?.data?.error || err?.response?.data?.detail || "Login failed. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your IntelliExam Designer account</p>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-2xl text-center text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Debug Info - DISABLED */}
                {/* {formData.email && (
                  <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    Debug: Email = {formData.email} | UserType = {detectedUserType || 'none'} | Checking = {isCheckingUser ? 'yes' : 'no'}
                  </div>
                )} */}

                {/* User Type Indicator - DISABLED to prevent refresh issues */}
                {/* {(detectedUserType || isCheckingUser) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center p-4 border-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm transition-all duration-500 ease-in-out transform scale-100">
                      User type indicator content...
                    </div>
                  </div>
                )} */}

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me + Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, rememberMe: !!checked }))
                      }
                    />
                    <Label htmlFor="rememberMe">Remember me</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Error */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full gradient-primary text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to="/signup">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-primary text-primary hover:bg-accent"
                  >
                    Create New Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
