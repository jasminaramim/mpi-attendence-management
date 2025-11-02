import { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { tokenManager } from './utils/tokenManager';
import { apiClient } from './utils/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  role: string;
  semester?: string;
}

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const token = await tokenManager.getValidToken();
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setAccessToken(token);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth init error:', error);
        tokenManager.clearTokens();
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const handleLogin = (userData: any, token: string, refreshToken?: string) => {
    setAccessToken(token);
    setUser(userData);
    
    // Save tokens with refresh token if provided
    if (refreshToken) {
      tokenManager.saveTokens(token, refreshToken);
    } else {
      // Fallback: save access token and generate a placeholder refresh token
      tokenManager.saveTokens(token, token, 3600);
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUser(null);
    tokenManager.clearTokens();
    localStorage.removeItem('user');
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#27BEEF]/10 to-[#F4A247]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#27BEEF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard accessToken={accessToken} user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
  }

  return <StudentDashboard accessToken={accessToken} user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
}
