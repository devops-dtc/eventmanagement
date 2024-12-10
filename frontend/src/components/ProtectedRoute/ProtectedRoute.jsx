//TO DO ENABLE THE PROTECTED ROUTE LATER

// // src/components/ProtectedRoute/ProtectedRoute.jsx
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';

// const ProtectedRoute = ({ children, roles }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   if (roles && !roles.includes(user.role)) {
//     return <Navigate to="/events" />;
//   }

//   return children;
// };

// export default ProtectedRoute;
