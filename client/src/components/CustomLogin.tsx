import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomLogin = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      }
    });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Noto Sans Symbols, sans-serif' }}>
            Meeting Actioner
          </h1>
          <p className="text-muted-foreground">Transform meetings into actionable insights</p>
        </div>

        {/* Auth Card */}
        <motion.div
          className="bg-black/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground text-sm">Sign in to access your dashboard</p>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Sign Up Button */}
            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full bg-white/5 border-primary/30 text-foreground hover:bg-white/10 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <User size={18} />
              <span>Create Account</span>
            </Button>

            {/* Features */}
            <div className="pt-4 border-t border-primary/20">
              <p className="text-xs text-muted-foreground text-center mb-3">What you'll get:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span>AI-powered meeting analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span>Automated task extraction</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span>Voice summaries & follow-ups</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Lock size={12} />
            <span>Secured by Auth0 • Enterprise-grade encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomLogin;
