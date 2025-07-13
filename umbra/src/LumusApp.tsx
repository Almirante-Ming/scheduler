import { useState, useEffect } from 'react';
import { LumusLogin } from './components/LumusLogin';
import { LumusDashboard } from './components/LumusDashboard';
import { authService, type User } from './services/lumusService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
            
            // Verify token is still valid
            try {
              await authService.getCurrentUser();
            } catch (error) {
              console.error('Token validation failed:', error);
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear any stored auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const handleRegister = () => {
    // For now, just show an alert
    alert('Registration feature coming soon! Please use the test accounts for now.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated && user ? (
        <LumusDashboard user={user} onLogout={handleLogout} />
      ) : (
        <LumusLogin onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}

export default App;
