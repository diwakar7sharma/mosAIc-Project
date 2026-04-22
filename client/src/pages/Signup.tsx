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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-32 pb-20 px-4">
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
};

export default Signup;
