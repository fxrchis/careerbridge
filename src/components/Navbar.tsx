import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/firebase';
import { FiHome, FiBriefcase, FiHelpCircle, FiSettings, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome, showFor: 'all' },
    { path: '/jobs', label: 'Jobs', icon: FiBriefcase, showFor: 'all' },
    { path: '/help', label: 'Help', icon: FiHelpCircle, showFor: 'all' },
    { path: '/submit-posting', label: 'Post a Job', icon: FiBriefcase, showFor: ROLES.EMPLOYER },
    { path: '/my-postings', label: 'My Postings', icon: FiBriefcase, showFor: ROLES.EMPLOYER },
    { path: '/employer/applications', label: 'Applications', icon: FiBriefcase, showFor: ROLES.EMPLOYER },
    { path: '/my-applications', label: 'My Applications', icon: FiBriefcase, showFor: ROLES.STUDENT },
    { path: '/admin', label: 'Admin Panel', icon: FiSettings, showFor: ROLES.ADMIN },
    { path: '/judges-access', label: 'Judges Access', icon: FiBriefcase, showFor: 'all' },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 sm:py-4' : 'py-3 sm:py-6'}`}>
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`glass-effect shadow-lg backdrop-blur-md w-full flex items-center ${
          scrolled ? 'bg-white/90' : 'bg-white/80'
        }`}
      >
        <div className="w-full px-4 sm:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-xl sm:text-2xl font-bold text-gradient"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                CareerBridge
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {navLinks.map((link) => (
                ((link.showFor === 'all') || (currentUser && link.showFor === userRole)) && (
                  <motion.div
                    key={link.path}
                    className="relative"
                    whileHover={{ y: -2 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors
                        ${isActivePath(link.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                    >
                      <link.icon className="w-5 h-5 mr-2" />
                      {link.label}
                    </Link>
                    {isActivePath(link.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                )
              ))}

              {/* Desktop User Menu */}
              {currentUser ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ y: -2 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-primary-50"
                  >
                    <FiUser className="w-5 h-5 mr-2" />
                    {currentUser.displayName || currentUser.email}
                  </motion.button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                      >
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        >
                          <FiLogOut className="w-5 h-5 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 rounded-md hover:bg-primary-50"
                >
                  <FiUser className="w-5 h-5 mr-2" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 focus:outline-none"
              >
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden"
          >
            <div className="glass-effect shadow-lg backdrop-blur-md px-4 pt-2 pb-4 space-y-1 bg-white/90">
              {navLinks.map((link) => (
                ((link.showFor === 'all') || (currentUser && link.showFor === userRole)) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors
                      ${isActivePath(link.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                  >
                    <link.icon className="w-5 h-5 mr-2" />
                    {link.label}
                  </Link>
                )
              ))}
              
              {/* Mobile User Menu */}
              {currentUser ? (
                <>
                  <div className="px-4 py-3">
                    <div className="flex items-center">
                      <FiUser className="w-5 h-5 mr-2 text-gray-700" />
                      <span className="text-base font-medium text-gray-700">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                  >
                    <FiLogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                >
                  <FiUser className="w-5 h-5 mr-2" />
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
