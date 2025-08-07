'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Activity, 
  Shield, 
  BarChart3, 
  Settings, 
  FileText,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalChildren: number;
  totalInjuries: number;
  activeInjuries: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  childrenCount: number;
}

interface RecentInjury {
  _id: string;
  type: string;
  description: string;
  date: string;
  severity: string;
  recoveryStatus: string;
  child: {
    name: string;
    parent: {
      name: string;
      email: string;
    };
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalChildren: 0,
    totalInjuries: 0,
    activeInjuries: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [recentInjuries, setRecentInjuries] = useState<RecentInjury[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse, injuriesResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/injuries?limit=5')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      if (injuriesResponse.ok) {
        const injuriesData = await injuriesResponse.json();
        setRecentInjuries(injuriesData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'children' | 'injuries', format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/admin/export/${type}?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${type.toUpperCase()} ${format.toUpperCase()} export completed`);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('An error occurred while exporting data');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{stats.totalUsers}</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{stats.totalChildren}</h3>
                <p className="text-gray-600">Total Children</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{stats.totalInjuries}</h3>
                <p className="text-gray-600">Total Injuries</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{stats.activeInjuries}</h3>
                <p className="text-gray-600">Active Injuries</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Injuries */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Injuries</h2>
              <Link
                href="/injuries"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentInjuries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent injuries</p>
              ) : (
                recentInjuries.map((injury) => (
                  <div key={injury._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{injury.type}</h3>
                        <p className="text-gray-600 text-sm">{injury.description}</p>
                        <p className="text-gray-500 text-sm">
                          Child: {injury.child?.name || 'Unknown'} • Parent: {injury.child?.parent?.name || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        injury.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        injury.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {injury.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(injury.date).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        injury.recoveryStatus === 'Resting' ? 'bg-red-100 text-red-800' :
                        injury.recoveryStatus === 'Light Activity' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {injury.recoveryStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Statistics */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Statistics</h2>
              <Link
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verified Users</span>
                <span className="font-semibold text-green-600">{stats.verifiedUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unverified Users</span>
                <span className="font-semibold text-yellow-600">{stats.unverifiedUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Parents</span>
                <span className="font-semibold text-blue-600">{stats.totalUsers - 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/children"
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">View All Children</h3>
                  <p className="text-gray-600">Browse all registered children</p>
                </div>
              </div>
            </Link>

            <Link
              href="/injuries"
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">View All Injuries</h3>
                  <p className="text-gray-600">Track all injury records</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                  <p className="text-gray-600">View user accounts</p>
                </div>
              </div>
            </Link>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
                  <p className="text-gray-600">Export children and injuries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Export Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Children */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Export All Children</h3>
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">Export all children data including parent information and injury counts.</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('children', 'csv')}
                  className="btn-secondary inline-flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('children', 'pdf')}
                  className="btn-secondary inline-flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Export Injuries */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Export All Injuries</h3>
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">Export all injury records including child and parent information.</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('injuries', 'csv')}
                  className="btn-secondary inline-flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('injuries', 'pdf')}
                  className="btn-secondary inline-flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 