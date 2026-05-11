import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleQuickLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@test.com', pass: 'admin123' },
      seller: { email: 'seller@test.com', pass: 'seller123' },
      user: { email: 'user@test.com', pass: 'user123' },
    };
    const { email, pass } = creds[role];
    try {
      await login(email, pass);
      navigate('/');
    } catch (err) {
      alert('Quick login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>

      <div className="quick-login">
        <h3>Quick Login (For Testing)</h3>
        <button onClick={() => handleQuickLogin('admin')}>Login as Admin</button>
        <button onClick={() => handleQuickLogin('seller')}>Login as Seller</button>
        <button onClick={() => handleQuickLogin('user')}>Login as User</button>
      </div>
    </div>
  );
};

export default LoginPage;
