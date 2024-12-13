import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
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
import AdminEventManagementDashboard from './pages/EventManagement/AdminEventManagementDashboard';
import UserManagementDashboard from './pages/EventManagement/UserManagement';


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/edit-event" element={<EditEvent />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/event-management" element={<AdminEventManagementDashboard />} />
          <Route path="/user-management" element={<UserManagementDashboard />} />

        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;


