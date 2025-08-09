'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Activity, Download, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Injury {
  _id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryStatus: 'Resting' | 'Light Activity' | 'Full Play';
  notes: string;
  createdAt: string;
}

interface Child {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  sport: string;
  notes: string;
  injuries: Injury[];
  parent?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children');
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      } else {
        toast.error('Failed to fetch children');
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('An error occurred while fetching children');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!childToDelete) return;

    try {
      const response = await fetch(`/api/children/${childToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChildren(children.filter(child => child._id !== childToDelete._id));
        toast.success('Child deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete child');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('An error occurred while deleting the child');
    } finally {
      setShowDeleteModal(false);
      setChildToDelete(null);
    }
  };

  const handleExport = async (childId: string, format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/children/${childId}/export?format=${format}`);
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
        toast.success(`${format.toUpperCase()} export completed`);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('An error occurred while exporting data');
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Children</h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'admin' 
                ? 'Manage all children and their injury records' 
                : 'Manage your children\'s profiles and injury records'
              }
            </p>
          </div>
          {user?.role === 'parent' && (
            <Link
              href="/children/new"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Link>
          )}
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {user?.role === 'admin' ? 'No children registered yet' : 'No children added yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'admin' 
                ? 'Children will appear here once parents start adding them to the system.'
                : 'Get started by adding your first child to track their sports injuries and recovery progress.'
              }
            </p>
            {user?.role === 'parent' && (
              <Link
                href="/children/new"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Child
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <div key={child._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-gray-600">{child.age} years old • {child.gender}</p>
                    {child.sport && (
                      <p className="text-sm text-gray-500 mt-1">Primary Sport: {child.sport}</p>
                    )}
                    {user?.role === 'admin' && child.parent && (
                      <p className="text-sm text-gray-500 mt-1">Parent: {child.parent.name}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {user?.role === 'parent' && (!child.parent || child.parent._id === user.id) && (
                      <>
                        <Link
                          href={`/children/${child._id}/edit`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setChildToDelete(child);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {child.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{child.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {child.injuries.length} injury{child.injuries.length !== 1 ? 's' : ''} recorded
                  </div>
                  <div className="flex space-x-2">
                    {user?.role === 'parent' && (!child.parent || child.parent._id === user.id) && (
                      <Link
                        href={`/children/${child._id}/injuries/new`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Add Injury
                      </Link>
                    )}
                    <Link
                      href={`/children/${child._id}`}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Export Options */}
                {child.injuries.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Export History:</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExport(child._id, 'csv')}
                          className="flex items-center text-xs text-gray-600 hover:text-blue-600 font-medium"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          CSV
                        </button>
                        <button
                          onClick={() => handleExport(child._id, 'pdf')}
                          className="flex items-center text-xs text-gray-600 hover:text-blue-600 font-medium"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && childToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Child
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete {childToDelete.name}? This action cannot be undone and will also delete all associated injuries.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setChildToDelete(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteChild}
                  className="btn-primary bg-red-500 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 