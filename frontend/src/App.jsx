import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import Register from './pages/Auth/Register';
import AttendeeEvents from './pages/Events/AttendeeEvents';
import Enrollment from './pages/Enrollment/Enrollment';
import 'react-toastify/dist/ReactToastify.css';
import OrganizerEvents from './pages/Events/OrganizerEvents';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import EditEvent from './pages/EventManagement/EditEvent';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/attendee-events" element={<AttendeeEvents />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/organizer-events" element={<OrganizerEvents />} />
          <Route path="/edit-event" element={<EditEvent />} />
          

        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;


