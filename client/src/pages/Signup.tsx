import { SignUp, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const Signup = () => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Noto Sans Symbols, sans-serif' }}>
          Wrpup
        </h1>
        <p className="text-muted-foreground">Transform meetings into actionable insights</p>
      </div>
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
};

export default Signup;
