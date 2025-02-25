// Import required dependencies
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Props type definition
interface ProtectedRouteProps {
  allowedRoles: string[];
}

// Protected route component that checks user authentication and role
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  // Get current user and role from auth context
  const { currentUser, userRole } = useAuth();

  // Redirect to auth if not logged in
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // Check if userRole exists and is included in allowedRoles
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  // Return Outlet
  return <Outlet />;
};

export default ProtectedRoute;
