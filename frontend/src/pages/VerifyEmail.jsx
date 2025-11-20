import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isStudent, user, refreshUser, isAuthenticated } = useAuth();
  const email = searchParams.get('email') || user?.email || '';
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Only allow students to access this page
    // If logged in and not a student, redirect to dashboard
    if (isAuthenticated && user) {
      if (!isStudent) {
        navigate('/dashboard');
      }
    }
    // If not logged in, check if email is a student email (@bennett.edu.in)
    // This is a simple check - only students should verify email
    if (!isAuthenticated && email && !email.endsWith('@bennett.edu.in')) {
      // Not a student email, redirect to login
      navigate('/login');
    }
  }, [user, isStudent, isAuthenticated, navigate, email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyEmail(email, otp);
      if (response.data.verified) {
        setSuccess(true);
        // Refresh user data if logged in
        if (isAuthenticated) {
          await refreshUser();
        }
        // Always redirect to login after verification
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to verify email. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      await authAPI.requestOTP(email);
      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600">Your email has been successfully verified.</p>
          <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to
          </p>
          <p className="mt-1 text-center text-sm font-medium text-indigo-600">
            {email}
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            Email verification is required for students only
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              OTP sent successfully! Please check your email.
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading || countdown > 0}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? 'Sending...'
                : countdown > 0
                ? `Resend OTP (${countdown}s)`
                : 'Resend OTP'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Skip for now (verify later)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;

