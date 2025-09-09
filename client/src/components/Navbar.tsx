import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, LayoutDashboard, CheckSquare, Info, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from './UserProfile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  // Handle scroll effect for floating navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home, public: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, public: false },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, public: false },
    { name: 'About', path: '/about', icon: Info, public: true },
    { name: 'Contact', path: '/contact', icon: Mail, public: true },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (isAuthenticated) {
      // For authenticated users, hide Home page
      return item.name !== 'Home';
    } else {
      // For unauthenticated users, show only public pages
      return item.public;
    }
  });

  // Render different navbar styles based on authentication status
  if (!isAuthenticated) {
    // Floating capsule navbar for non-authenticated users
    return (
      <div className={`fixed inset-x-0 z-[60] flex justify-center transition-all duration-500 ${
        isScrolled ? 'top-4' : 'top-8'
      }`}>
        <motion.nav
          className={`px-6 py-3 rounded-full border border-green-500/30 transition-all duration-500 ${
            isScrolled ? 'px-4 py-2 scale-95' : 'px-6 py-3 scale-100'
          }`}
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)'
          }}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className={`font-bold text-green-600 transition-all duration-300 ${
                isScrolled ? 'text-sm' : 'text-lg'
              }`} style={{ fontFamily: 'Noto Sans Symbols, sans-serif' }}>
                Meeting Actioner
              </span>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-4">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    } ${isScrolled ? 'px-2 py-1 text-sm' : 'px-3 py-2'}`}
                  >
                    <Icon size={isScrolled ? 14 : 16} />
                    <span className={isScrolled ? 'hidden lg:inline' : ''}>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Button */}
            <div className="flex items-center space-x-2">
              {!isLoading && (
                <Link to="/login">
                  <Button className={`bg-green-700 hover:bg-green-800 text-white rounded-full transition-all duration-300 ${
                    isScrolled ? 'px-3 py-1 text-sm' : 'px-4 py-2'
                  }`}>
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Menu for floating navbar */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden mt-2 p-4 rounded-2xl border border-green-500/30"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(12px) saturate(180%)',
                WebkitBackdropFilter: 'blur(12px) saturate(180%)'
              }}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-green-600/20 text-green-400'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                <div className="border-t border-green-500/20 pt-2 mt-2">
                  {!isLoading && (
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl">
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Regular navbar for authenticated users
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-[60] border-b border-green-500/30 transition-all duration-300"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px) saturate(180%)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2 flex-shrink-0">
            <span className="font-bold text-green-600 text-lg" style={{ fontFamily: 'Noto Sans Symbols, sans-serif' }}>
              Meeting Actioner
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-foreground/80 hover:text-foreground hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <Link to="/login">
                    <Button className="bg-green-700 hover:bg-green-800 text-white">
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            className="md:hidden border-t border-primary/20 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-foreground/80 hover:text-foreground hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-primary/20 pt-2 mt-2">
                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <div onClick={() => setIsOpen(false)}>
                        <UserProfile />
                      </div>
                    ) : (
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
                          Login
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
