import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Register from './pages/Auth/Register';
import AdminEventManagement from './pages/Auth/AdminEventManagement';

import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminEventManagement />} />
        <Route path="/register" element={<Register />} />
        <Route path="/AdminEventManagement" element={<AdminEventManagement />} />
      </Routes>
      <ToastContainer position="top-right" />
    </Router>
  );
};

export default App;
