import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function AppNavbar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">RealTimeCollab</Navbar.Brand>
      <Nav className="ml-auto">
        {localStorage.getItem('token') && (
          <Button variant="outline-danger" onClick={logout}>Logout</Button>
        )}
      </Nav>
    </Navbar>
  );
}