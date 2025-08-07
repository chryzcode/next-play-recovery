import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'parent';
  children?: Array<{
    _id: string;
    name: string;
    age: number;
  }>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        // Not authenticated, redirect to login immediately
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register') && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reset-password') && !pathname.startsWith('/verify-email') && pathname !== '/') {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      // If there's an error, redirect to login
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register') && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reset-password') && !pathname.startsWith('/verify-email') && pathname !== '/') {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout,
    checkAuth,
  };
} 