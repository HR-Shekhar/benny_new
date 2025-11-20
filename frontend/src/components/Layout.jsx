import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isStudent, isFaculty } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-indigo-600">Benny</span>
                <span className="text-sm text-gray-500">Student Helper</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  {isStudent && (
                    <>
                      <Link
                        to="/notices"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Notices
                      </Link>
                      <Link
                        to="/slots"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Book Slots
                      </Link>
                      <Link
                        to="/resources"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Resources
                      </Link>
                      <Link
                        to="/resources/summarize"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Summarize
                      </Link>
                    </>
                  )}
                  {isFaculty && (
                    <>
                      <Link
                        to="/notices"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Notices
                      </Link>
                      <Link
                        to="/slots/manage"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Slots
                      </Link>
                      <Link
                        to="/resources/upload"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Upload Resource
                      </Link>
                      <Link
                        to="/profile"
                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Profile
                      </Link>
                    </>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{user.full_name || user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
