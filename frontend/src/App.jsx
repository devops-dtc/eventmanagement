import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import Register from './pages/Auth/Register';
import Events from './pages/Events/Events';
import Enrollment from './pages/Enrollment/Enrollment';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Enrollment/>} />
          <Route path="/events" element={<Events />} />
          <Route path="/enrollment" element={<Enrollment />} />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;
