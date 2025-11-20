import React, { useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Bell, 
  Calendar, 
  BookOpen, 
  Upload, 
  User,
  LogIn,
  UserPlus,
  LogOut,
  MessageCircle,
  FileText
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isStudent, isFaculty } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build navigation items based on user role
  const navItems = useMemo(() => {
    if (!user) {
      // For non-authenticated users, don't show navbar (Benny logo serves as home)
      return [];
    }

    if (isStudent) {
      return [
        { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { name: 'Notices', url: '/notices', icon: Bell },
        { name: 'Slots', url: '/slots', icon: Calendar },
        { name: 'Resources', url: '/resources', icon: BookOpen },
        { name: 'Assignments', url: '/assignments', icon: FileText },
        { name: 'Chatbot', url: '/chatbot', icon: MessageCircle },
      ];
    }

    if (isFaculty) {
      return [
        { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { name: 'Notices', url: '/notices', icon: Bell },
        { name: 'Slots', url: '/slots/manage', icon: Calendar },
        { name: 'Upload', url: '/resources/upload', icon: Upload },
        { name: 'Assignments', url: '/assignments', icon: FileText },
        { name: 'Profile', url: '/profile', icon: User },
        { name: 'Chatbot', url: '/chatbot', icon: MessageCircle },
      ];
    }

    // Default for other roles
    return [
      { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ];
  }, [user, isStudent, isFaculty]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Single Unified Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                <span className="text-2xl font-bold text-primary">Benny</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Student Helper</span>
              </Link>
            </div>

            {/* Navigation Items with Tubelight Animation */}
            {navItems.length > 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="relative flex items-center gap-1 bg-background/5 rounded-lg px-1 h-12">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url || 
                      (item.url !== '/' && location.pathname.startsWith(item.url));

                    return (
                      <Link
                        key={item.name}
                        to={item.url}
                        className={cn(
                          "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-lg transition-colors z-10",
                          "text-foreground/80 hover:text-primary",
                          isActive && "text-primary",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={18} strokeWidth={2.5} />
                          <span className="hidden md:inline">{item.name}</span>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="lamp"
                            className="absolute inset-0 w-full bg-primary/10 rounded-lg -z-10"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          >
                            {/* Tubelight glow effect at the top */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                              <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                              <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                              <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                            </div>
                          </motion.div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Actions */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                    {user.full_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <UserPlus size={16} />
                    <span className="hidden sm:inline">Sign Up</span>
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
