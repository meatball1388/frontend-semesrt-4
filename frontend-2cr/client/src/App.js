import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import AdminUsers from './pages/AdminUsers';
import './App.css';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const Navigation = () => {
  const { user, logout } = useAuth();
  return (
    <nav>
      <Link to="/">Products</Link>
      {user ? (
        <>
          {(user.role === 'seller' || user.role === 'admin') && <Link to="/products/new">New Product</Link>}
          {user.role === 'admin' && <Link to="/users">Users</Link>}
          <span>{user.email} ({user.role})</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/products/new" 
                element={<ProtectedRoute roles={['seller', 'admin']}><ProductForm /></ProtectedRoute>} 
              />
              <Route 
                path="/products/edit/:id" 
                element={<ProtectedRoute roles={['seller', 'admin']}><ProductForm /></ProtectedRoute>} 
              />
              <Route 
                path="/products/:id" 
                element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} 
              />
              <Route 
                path="/users" 
                element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
