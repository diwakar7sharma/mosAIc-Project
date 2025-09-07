import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Menu, X, Home, LayoutDashboard, CheckSquare, Info, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from './UserProfile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home, public: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, public: false },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, public: false },
    { name: 'About', path: '/about', icon: Info, public: true },
    { name: 'Contact', path: '/contact', icon: Mail, public: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.public || isAuthenticated
  );

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 transition-all duration-300"
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
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
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
