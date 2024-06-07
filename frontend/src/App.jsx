import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Settings from './components/Settings';
import Login from './components/Login';
import Profile from './components/Profile';
import Navbar from './components/Navbar'; // Import Navbar component
import './App.css'

const App = () => {
  return (
    <Router>
      <div id='navbar'>
        <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;