import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-indigo-600">Benny</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your Student Helper & Management App
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Connect with faculty, stay updated with notices, and manage your academic journey all in one place.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-medium text-lg"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-md font-medium text-lg"
          >
            Sign Up
          </Link>
        </div>
      ) : (
        <Link
          to="/dashboard"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-medium text-lg"
        >
          Go to Dashboard
        </Link>
      )}

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-indigo-600"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Notices</h3>
          <p className="text-gray-600">
            Stay updated with all important announcements and notices from faculty and administration.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Slots</h3>
          <p className="text-gray-600">
            Easily book office hours and consultation slots with your faculty members.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-purple-600"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Faculty Profiles</h3>
          <p className="text-gray-600">
            View faculty profiles, their courses, and contact information all in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

