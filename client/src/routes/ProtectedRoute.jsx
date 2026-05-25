import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { navigateTo } from '../utils/navigation';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigateTo('/login', { replace: true });
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-slate-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;