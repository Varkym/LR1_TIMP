import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Shield from './components/Shield';
import Detail from './components/Detail';
import AddService from './components/AddService';
import Login from './components/Login';
import Events from './components/Events';
import NotFound from './components/NotFound';
import Register from './components/Register';
import Signature from './components/Signature';
import './App.css';

function ProtectedRoute({ children, isAuthenticated, authReady }) {
  if (!authReady) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setAuthReady(true);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthReady(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAuthReady(true);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={!!user} authReady={authReady}>
                <Shield user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detail/:id"
            element={
              <ProtectedRoute isAuthenticated={!!user} authReady={authReady}>
                <Detail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute isAuthenticated={!!user} authReady={authReady}>
                <AddService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute isAuthenticated={!!user} authReady={authReady}>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Signature />
      </div>
    </Router>
  );
}
