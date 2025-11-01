import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ResetPassword = () => {
const { uid, token } = useParams();
const navigate = useNavigate();

const [formData, setFormData] = useState({
password: '',
confirmPassword: '',
});

const [isLoading, setIsLoading] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (formData.password !== formData.confirmPassword) {
  alert('Passwords do not match');

  return;
}

setIsLoading(true);

try {
  const response = await axios.post(
    `http://127.0.0.1:8000/api/auth/reset-password/${uid}/${token}/`,
    formData
  );
  alert('✅ Password reset successful!');
  navigate('/signin');
} catch (error: any) {
  console.error('❌ Error:', error?.response?.data);
  alert(error?.response?.data?.error || 'Something went wrong.');
} finally {
  setIsLoading(false);
}

}
return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
<Navigation />
  <div className="flex-grow flex items-center justify-center px-4">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">Reset Your Password</h2>

      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirm_password">Confirm Password</Label>
        <Input
          type="password"
          name="confirmPassword"
          id="confirm_password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full gradient-primary text-white"
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  </div>

  <Footer />
</div>
);
};

export default ResetPassword;
