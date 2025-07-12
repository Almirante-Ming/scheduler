import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { authService } from '../services/lumusService';

interface LoginProps {
  onLogin: (user: any) => void;
  onRegister: () => void;
}

export const LumusLogin: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      console.log('Login successful:', response);
      onLogin(response.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (userType: 'admin' | 'professor' | 'user') => {
    const testCredentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      professor: { email: 'smith@example.com', password: 'prof123' },
      user: { email: 'test@example.com', password: 'test123' }
    };

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(testCredentials[userType]);
      console.log('Test login successful:', response);
      onLogin(response.user);
    } catch (err: any) {
      console.error('Test login error:', err);
      setError(err.response?.data?.error || 'Test login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Lumus</CardTitle>
          <CardDescription className="text-gray-600">
            Laboratory Scheduler System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Test Accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestLogin('admin')}
              disabled={isLoading}
              className="text-xs"
            >
              🔐 Admin (admin@example.com)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestLogin('professor')}
              disabled={isLoading}
              className="text-xs"
            >
              👨‍🏫 Professor (smith@example.com)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestLogin('user')}
              disabled={isLoading}
              className="text-xs"
            >
              👤 User (test@example.com)
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={onRegister}
              disabled={isLoading}
              className="text-sm"
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
