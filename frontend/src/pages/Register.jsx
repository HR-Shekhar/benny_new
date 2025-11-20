import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import { motion } from 'framer-motion';
import { WavyBackground } from '../components/ui/wavy-background';

const Register = () => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(userType, formData);
    if (result.success) {
      // For students, request OTP and redirect to email verification
      if (userType === 'student') {
        try {
          await authAPI.requestOTP(formData.email);
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (err) {
          // Even if OTP request fails, still redirect to verification page
          // User can request OTP again from there
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }
      } else {
        // For faculty and alumni, show success and redirect to login
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <WavyBackground
        className="min-h-screen flex items-center justify-center w-full"
        containerClassName="min-h-screen w-full"
        colors={['#5142FF', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']}
        waveWidth={70}
        backgroundFill="transparent"
        blur={12}
        speed="fast"
        waveOpacity={0.35}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-green-500 text-5xl mb-4"
          >
            ✓
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
        </motion.div>
      </WavyBackground>
    );
  }

  return (
    <WavyBackground
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full"
      containerClassName="min-h-screen w-full"
      colors={['#5142FF', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']}
      waveWidth={70}
      backgroundFill="transparent"
      blur={12}
      speed="fast"
      waveOpacity={0.35}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account on <span className="text-primary">Benny</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Create your Bennett University account
          </p>
          <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            Student Helper & Management App
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => setUserType('student')}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  userType === 'student'
                    ? 'bg-primary dark:bg-primary text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  scale: userType === 'student' ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                Student
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setUserType('faculty')}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  userType === 'faculty'
                    ? 'bg-primary dark:bg-primary text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  scale: userType === 'faculty' ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                Faculty
              </motion.button>
            </div>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-300"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-300"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-300"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary dark:bg-primary hover:bg-indigo-700 dark:hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary dark:text-primary hover:text-indigo-700 dark:hover:text-primary-dark transition-colors duration-300">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </WavyBackground>
  );
};

export default Register;