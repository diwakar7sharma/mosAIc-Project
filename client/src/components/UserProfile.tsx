import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="bg-white/10 border-white/20 text-foreground hover:bg-white/20 flex items-center space-x-2"
      >
        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
          <User size={14} className="text-white" />
        </div>
        <span className="hidden sm:inline">{user?.email || user?.name || 'User'}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg z-50"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
