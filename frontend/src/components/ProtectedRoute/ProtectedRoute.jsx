// src/components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'Attendee') {
      return <Navigate to="/attendee-events" />;
    } else if (user.role === 'Organizer' || user.role === 'Super Admin') {
      return <Navigate to="/organizer-events" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
