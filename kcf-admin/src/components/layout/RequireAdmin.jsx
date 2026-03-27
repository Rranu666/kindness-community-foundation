import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function RequireAdmin() {
  const { isLoadingAuth, isAuthenticated, isAdmin } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Access Denied</h2>
          <p className="text-gray-500 mb-4">Admin role required to access this dashboard.</p>
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="text-blue-600 underline text-sm"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
