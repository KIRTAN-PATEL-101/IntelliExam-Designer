import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/forgot-password/", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-md mx-auto py-20 px-4">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />
          </div>
          <Button type="submit">Send Reset Link</Button>
          {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
