import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const { handleRedirectCallback, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        navigate('/dashboard');
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/');
      }
    };

    if (!isLoading) {
      handleCallback();
    }
  }, [handleRedirectCallback, navigate, isLoading]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Completing Sign In</h2>
        <p className="text-gray-400">Please wait while we authenticate you...</p>
      </div>
    </div>
  );
};

export default Callback;
