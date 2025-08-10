'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Injury {
  _id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryStatus: 'Resting' | 'Light Activity' | 'Full Play';
  progressPercentage: number;
  child: {
    _id: string;
    name: string;
    parent?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
}

interface Child {
  _id: string;
  name: string;
  age: number;
}

export default function InjuriesPage() {
  const { user } = useAuth();
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChildModal, setShowChildModal] = useState(false);

  useEffect(() => {
    fetchInjuries();
    if (user?.role === 'parent') {
      fetchChildren();
    }
  }, [user]);

  const fetchInjuries = async () => {
    try {
      const response = await fetch('/api/injuries', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setInjuries(data);
      } else {
        console.error('Failed to fetch injuries');
      }
    } catch (error) {
      console.error('Error fetching injuries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      } else {
        console.error('Failed to fetch children');
      }
    } catch (error) {
      console.error('Error fetching children:', error);
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

  const handleAddInjury = () => {
    if (user?.role === 'parent') {
      if (children.length === 0) {
        // No children, redirect to add child page
        window.location.href = '/children/new';
      } else if (children.length === 1) {
        // Only one child, redirect directly to add injury for that child
        window.location.href = `/children/${children[0]._id}/injuries/new`;
      } else {
        // Multiple children, show modal to select
        setShowChildModal(true);
      }
    } else {
      // Admin should go to children page to select
      window.location.href = '/children';
    }
  };

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Injuries</h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'admin' 
                ? 'Track and manage all injury records across all children' 
                : 'Track and manage all injury records across your children'
              }
            </p>
          </div>
          {user?.role === 'parent' && (
            <button
              onClick={handleAddInjury}
              className="btn-primary inline-flex items-center self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Injury
            </button>
          )}
        </div>

        {/* Injuries List */}
        {injuries.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {user?.role === 'admin' ? 'No injuries recorded yet' : 'No injuries recorded yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'admin' 
                ? 'Injuries will appear here once parents start recording them.'
                : 'Start tracking injuries by adding your first injury record.'
              }
            </p>
            {user?.role === 'parent' && (
              <button
                onClick={handleAddInjury}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Injury
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {injuries.map((injury) => (
              <div key={injury._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{injury.type}</h3>
                    <p className="text-gray-600">{injury.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Child: {injury.child.name}
                    </p>
                    {user?.role === 'admin' && injury.child.parent && (
                      <p className="text-sm text-gray-500">
                        Parent: {injury.child.parent.name} ({injury.child.parent.email})
                      </p>
                    )}
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
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {injury.location}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
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
                  {user?.role === 'parent' && injury.child?.parent?._id?.toString() === user.id && (
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

      {/* Child Selection Modal */}
      {showChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select a Child</h3>
            <p className="text-gray-600 mb-4">
              Choose which child to add an injury for:
            </p>
            <div className="space-y-2">
              {children.map((child) => (
                <Link
                  key={child._id}
                  href={`/children/${child._id}/injuries/new`}
                  className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{child.name}</div>
                  <div className="text-sm text-gray-500">{child.age} years old</div>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowChildModal(false)}
              className="mt-4 w-full btn-secondary inline-flex items-center justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 