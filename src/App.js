import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import AppNavbar from './components/Navbar';

function App() {
  const isAuth = !!localStorage.getItem('token');
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/doc/:id" element={isAuth ? <EditorPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;