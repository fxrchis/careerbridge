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
    { path: '/my-applications', label: 'My Applications', icon: FiBriefcase, showFor: ROLES.STUDENT },
    { path: '/admin', label: 'Admin Panel', icon: FiSettings, showFor: ROLES.ADMIN },
    { path: '/judges-access', label: 'Judges Access', icon: FiBriefcase, showFor: 'all' },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`glass-effect shadow-lg backdrop-blur-md w-full h-20 flex items-center ${
          scrolled ? 'bg-white/90' : 'bg-white/80'
        }`}
      >
        <div className="w-full px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.span 
                className="text-2xl font-bold text-gradient"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                CareerBridge
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
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
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {currentUser ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md
                      ${showUserMenu ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'}`}
                  >
                    <FiUser className="w-4 h-4" />
                    <span>{currentUser.displayName || currentUser.email}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                      >
                        <div className="py-1">
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          >
                            <FiSettings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          >
                            <FiLogOut className="w-4 h-4 mr-2" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Link
                    to="/auth"
                    className="btn-primary"
                  >
                    Sign in
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  ((link.showFor === 'all') || (currentUser && link.showFor === userRole)) && (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors
                        ${isActivePath(link.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                    >
                      <link.icon className="w-5 h-5 mr-3" />
                      {link.label}
                    </Link>
                  )
                ))}

                {currentUser ? (
                  <>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                    >
                      <FiSettings className="w-5 h-5 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                    >
                      <FiLogOut className="w-5 h-5 mr-3" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                  >
                    <FiUser className="w-5 h-5 mr-3" />
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};

export default Navbar;
