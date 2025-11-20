import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { EtherealShadow } from '../components/ui/ethereal-shadow';
import { Typewriter } from '../components/ui/typewriter-text';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { WavyBackground } from '../components/ui/wavy-background';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <WavyBackground
      className="min-h-screen py-12 px-4 w-full"
      containerClassName="min-h-screen w-full"
      colors={['#5142FF', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']}
      waveWidth={70}
      backgroundFill="transparent"
      blur={12}
      speed="fast"
      waveOpacity={0.35}
    >
    <div className="text-center min-h-screen w-full">
      {/* Hero Section with Gradient and Ethereal Shadow */}
      <motion.div
        className="mb-16 py-20 px-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/80 dark:via-indigo-900/80 dark:to-purple-900/80 backdrop-blur-sm rounded-3xl relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Ethereal Shadow Background */}
        <EtherealShadow
          color="rgba(81, 66, 255, 0.15)"
          animation={{ scale: 80, speed: 75 }}
          noise={{ opacity: 0.3, scale: 1 }}
          sizing="fill"
          className="absolute inset-0"
        />
        
        {/* Content with relative z-index */}
        <div className="relative z-10">
          <motion.h1
            className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            variants={itemVariants}
          >
            Welcome to <span className="text-primary dark:text-primary">Benny</span>
          </motion.h1>
          <motion.div
            className="mb-4"
            variants={itemVariants}
          >
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-200 font-semibold">
              <Typewriter
                text="Your Bennett University Student Helper & Management App"
                speed={50}
                loop={false}
                className="text-2xl md:text-3xl text-gray-700 dark:text-gray-200 font-semibold"
              />
            </p>
          </motion.div>
          <motion.p
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Connect with Bennett University faculty and stay updated with notices. Built to assist Bennett University students and faculty in managing their academic journey all in one place.
          </motion.p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-center">
        {!isAuthenticated ? (
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <Link to="/login" className="no-underline">
              <ShimmerButton
                background="rgba(81, 66, 255, 1)"
                shimmerColor="#ffffff"
                className="shadow-2xl min-w-[140px]"
              >
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-base">
                  Sign In
                </span>
              </ShimmerButton>
            </Link>
            <Link to="/register" className="no-underline">
              <ShimmerButton
                background="rgba(255, 255, 255, 1)"
                shimmerColor="#5142FF"
                className="shadow-2xl min-w-[140px]"
              >
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-primary lg:text-base">
                  Sign Up
                </span>
              </ShimmerButton>
            </Link>
          </div>
        ) : (
          <Link to="/dashboard" className="no-underline">
            <ShimmerButton
              background="rgba(81, 66, 255, 1)"
              shimmerColor="#ffffff"
              className="shadow-2xl min-w-[180px]"
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-base">
                Go to Dashboard
              </span>
            </ShimmerButton>
          </Link>
        )}
      </motion.div>

      <motion.div
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-102 transition-all duration-300 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
          variants={cardVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(81, 66, 255, 0.2)' }}
        >
          <div className="bg-indigo-100 dark:bg-indigo-900 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Notices</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Stay updated with all important announcements and notices from Bennett University faculty and administration.
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-102 transition-all duration-300 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
          variants={cardVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(81, 66, 255, 0.2)' }}
        >
          <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Book Slots</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Easily book office hours and consultation slots with your Bennett University faculty members.
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-102 transition-all duration-300 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
          variants={cardVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(81, 66, 255, 0.2)' }}
        >
          <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Faculty Profiles</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            View Bennett University faculty profiles, their courses, and contact information all in one place.
          </p>
        </motion.div>
      </motion.div>
    </div>
    </WavyBackground>
  );
};

export default Home;