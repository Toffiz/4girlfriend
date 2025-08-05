import React, { useState } from 'react';
import { authService } from './supabaseClient';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Hidden credentials (encoded for basic security)
  const validCredentials = {
    username: atob('RGFuaWFs'), // 'Danial' encoded
    password: atob('QWxiaW5h')  // 'Albina' encoded
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // First try Supabase authentication
      const user = await authService.checkAuth(credentials.username, credentials.password);
      
      if (user) {
        onLogin(true);
        return;
      }
    } catch (error) {
      console.log('Supabase auth failed, trying local auth:', error);
    }
    
    // Fallback to local authentication
    if (credentials.username === validCredentials.username && 
        credentials.password === validCredentials.password) {
      onLogin(true);
    } else {
      setError('Invalid credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-form-container">
        <div className="login-header">
          <h1 className="login-title">Welcome</h1>
          <p className="login-subtitle">Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        
        <div className="login-footer">
          <p>Enter to access our garden</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
