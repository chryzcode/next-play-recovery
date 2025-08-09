'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Calendar 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Child {
  _id: string;
  name: string;
  age: number;
  injuries: Injury[];
  parent?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Injury {
  _id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryStatus: 'Resting' | 'Light Activity' | 'Full Play';
  progressPercentage: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    // Redirect admins to admin dashboard
    if (user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  const checkAuthAndFetchData = async () => {
    try {
      // First check if user is authenticated
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
      
      // Now fetch children data
      const childrenResponse = await fetch('/api/children');
      if (childrenResponse.ok) {
        const data = await childrenResponse.json();
        setChildren(data);
      } else {
        console.error('Failed to fetch children');
      }
    } catch (error) {
      console.error('Error:', error);
      // If there's an error, redirect to login
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resting':
        return 'bg-red-100 text-red-800';
      case 'Light Activity':
        return 'bg-yellow-100 text-yellow-800';
      case 'Full Play':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'Resting':
        return 33;
      case 'Light Activity':
        return 66;
      case 'Full Play':
        return 100;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Track and manage your children&apos;s sports injuries and recovery progress.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Children</p>
                <p className="text-2xl font-semibold text-gray-900">{children.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Injuries</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {children.reduce((acc, child) => acc + child.injuries.filter(i => i.recoveryStatus !== 'Full Play').length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recovered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {children.reduce((acc, child) => acc + child.injuries.filter(i => i.recoveryStatus === 'Full Play').length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Need Attention</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {children.reduce((acc, child) => acc + child.injuries.filter(i => i.recoveryStatus === 'Resting').length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Children and Injuries */}
        <div className="space-y-8">
          {children.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first child to track their sports injuries and recovery progress.</p>
              <Link
                href="/children/new"
                className="btn-primary inline-flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Child
              </Link>
            </div>
          ) : (
            children.map((child) => (
              <div key={child._id} className="card">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-gray-600">{child.age} years old</p>
                  </div>
                  {user?.role === 'parent' && (
                    <Link
                      href={`/children/${child._id}/injuries/new`}
                      className="btn-primary inline-flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Injury
                    </Link>
                  )}
                </div>

                {child.injuries.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No injuries recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {child.injuries.map((injury) => (
                      <div key={injury._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{injury.type}</h4>
                            <p className="text-gray-600">{injury.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(injury.severity)}`}>
                              {injury.severity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(injury.recoveryStatus)}`}>
                              {injury.recoveryStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(injury.date).toLocaleDateString()}
                          </span>
                          <span>{injury.location}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Recovery Progress</span>
                            <span>{getProgressPercentage(injury.recoveryStatus)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(injury.recoveryStatus)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            href={`/injuries/${injury._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          {user?.role === 'parent' && (!child.parent || child.parent._id === user.id) && (
                            <Link
                              href={`/injuries/${injury._id}/edit`}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Child Button */}
        {children.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/children/new"
              className="btn-secondary inline-flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 