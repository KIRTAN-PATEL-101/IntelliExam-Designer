import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  Shield
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms of Service');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/register/',
        {
          username: formData.name,
          email: formData.email,
          password: formData.password
        }
      );

      console.log('✅ Signup successful:', response.data);
      alert('Signup successful!');
      setIsSuccess(true);
    } catch (error: any) {
      console.error('❌ Signup failed:', error?.response?.data);
      alert(error?.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navigation />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-8">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Account Created Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to IntelliExam Designer! We've sent a verification email to{' '}
                    <span className="font-medium text-primary">{formData.email}</span>
                  </p>
                  <Link to="/signin">
                    <Button
                      size="lg"
                      className="w-full gradient-primary text-white hover:opacity-90"
                    >
                      Continue to Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join thousands of educators using IntelliExam Designer</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-2xl text-center text-gray-900">Sign Up</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Password strength:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength(formData.password) <= 2
                              ? 'text-red-600'
                              : passwordStrength(formData.password) <= 3
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {getStrengthText(passwordStrength(formData.password))}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStrengthColor(
                            passwordStrength(formData.password)
                          )}`}
                          style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: !!checked }))
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    isLoading ||
                    !formData.agreeToTerms ||
                    formData.password !== formData.confirmPassword
                  }
                  className="w-full gradient-primary text-white hover:opacity-90"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to="/signin">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-primary text-primary hover:bg-accent"
                  >
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
