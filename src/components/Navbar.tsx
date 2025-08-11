'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Activity, 
  BookOpen, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'parent';
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Always check auth status
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
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

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Show loading navbar
  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.jpeg"
                  alt="Next Play Recovery logo"
                  width={54}
                  height={54}
                  className="h-14 w-14 object-contain rounded"
                  priority
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Define navigation items based on authentication status
  const getNavItems = () => {
    if (!user) {
      // Unauthenticated users see no navigation items
      return [];
    }

    // Authenticated users see full navigation
    if (user.role === 'admin') {
      return [
        { name: 'Admin Dashboard', href: '/admin', icon: Settings },
        { name: 'Children', href: '/children', icon: Users },
        { name: 'Injuries', href: '/injuries', icon: Activity },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Children', href: '/children', icon: Users },
        { name: 'Injuries', href: '/injuries', icon: Activity },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.jpeg"
                alt="Next Play Recovery logo"
                width={60}
                height={60}
                className="h-15 w-15 object-contain rounded"
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-4 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 xl:px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1 xl:mr-2" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu and Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Desktop User Menu - only for authenticated users */}
            {user && (
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
                <Link
                  href="/profile"
                  className={`flex items-center px-2 xl:px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                    isActive('/profile')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 mr-1 xl:mr-2" />
                  <span className="hidden xl:inline">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 xl:px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors duration-200 whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4 mr-1 xl:mr-2" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Show Login/Register for unauthenticated users - positioned on the right */}
            {!user && (
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
                <Link
                  href="/login"
                  className="flex items-center px-2 xl:px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Login</span>
                </Link>
                <Link
                  href="/register"
                  className="btn-primary inline-flex items-center px-2 xl:px-3 py-2 text-sm font-medium whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Register</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Show Login/Register for unauthenticated users on mobile */}
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              
              {/* Show user menu for authenticated users on mobile */}
              {user && (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      isActive('/profile')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    {user.name}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 