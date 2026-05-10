import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import useUserStore from '../../store/useUserStore';
import MetaData from '@/components/common/Metadata';

export default function ForgotPassword() {
  const { forgotPassword, loading, error, message, clearError, clearMessage } = useUserStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
    if (message) {
      toast.success(message);
      clearMessage();
    }
  }, [error, message, clearError, clearMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    const result = await forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <>
        <MetaData title="Reset Password | ShopHub" />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent a password reset link to {email}
              </p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaData title="Forgot Password | ShopHub" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:text-primary/90">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}