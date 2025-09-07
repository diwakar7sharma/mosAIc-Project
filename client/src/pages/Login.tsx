import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import CustomLogin from '../components/CustomLogin';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <CustomLogin />;
};

export default Login;
