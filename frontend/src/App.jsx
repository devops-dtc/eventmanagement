import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Register from './pages/Auth/Register';
import Enrollment from './pages/Enrollment/Enrollment';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import EditEvent from './pages/EventManagement/EditEvent';
import CreateEvent from './pages/EventManagement/CreateEvent';
import Profile from './pages/Profile/Profile';
import AboutUs from './pages/Home/AboutUs';
import ContactUs from './pages/Home/ContactUs';
import EventManagementDashboard from './pages/EventManagement/EventManagementDashboard';
import UserManagementDashboard from './pages/EventManagement/UserManagementDashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected Routes */}
          <Route path="/enrollment" element={
            <PrivateRoute>
              <Enrollment />
            </PrivateRoute>
          } />
          <Route path="/edit-event" element={
            <PrivateRoute>
              <EditEvent />
            </PrivateRoute>
          } />
          <Route path="/create-event" element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/event-management" element={
            <PrivateRoute>
              <EventManagementDashboard />
            </PrivateRoute>
          } />
          <Route path="/user-management" element={
            <PrivateRoute>
              <UserManagementDashboard />
            </PrivateRoute>
          } />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
};

export default App;
