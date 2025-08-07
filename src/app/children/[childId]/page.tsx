'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Plus, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface Child {
  _id: string;
  name: string;
  age: number;
  gender: string;
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

interface Injury {
  _id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryStatus: 'Resting' | 'Light Activity' | 'Full Play';
  notes: string;
}

export default function ChildDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (params.childId) {
      fetchChild();
    }
  }, [params.childId]);

  const fetchChild = async () => {
    try {
      const response = await fetch(`/api/children/${params.childId}`);
      if (response.ok) {
        const data = await response.json();
        setChild(data);
      } else {
        toast.error('Failed to load child details');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching child:', error);
      toast.error('An error occurred while loading child details');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/children/${params.childId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Child deleted successfully');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete child');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('An error occurred while deleting the child');
    } finally {
      setShowDeleteModal(false);
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

  const getRecoveryStatusColor = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Child not found</h1>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user?.role === 'parent' && child.parent && child.parent._id === user.id && (
                <>
                  <Link href={`/children/${child._id}/edit`} className="btn-primary">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-secondary bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Child Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Child Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{child.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <p className="mt-1 text-sm text-gray-900">{child.age} years old</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{child.gender}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sport</label>
              <p className="mt-1 text-sm text-gray-900">{child.sport || 'Not specified'}</p>
            </div>
            {child.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{child.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Injuries Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Injury History</h2>
            <div className="flex items-center space-x-2">
              {user?.role === 'parent' && child.parent && child.parent._id === user.id && (
                <Link href={`/children/${child._id}/injuries/new`} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Injury
                </Link>
              )}
              <div className="flex space-x-2">
                <Link
                  href={`/api/children/${child._id}/export?format=csv`}
                  className="btn-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Link>
                <Link
                  href={`/api/children/${child._id}/export?format=pdf`}
                  className="btn-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Link>
              </div>
            </div>
          </div>

          {child.injuries && child.injuries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {child.injuries.map((injury) => (
                    <tr key={injury._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {injury.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(injury.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {injury.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(injury.severity)}`}>
                          {injury.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecoveryStatusColor(injury.recoveryStatus)}`}>
                          {injury.recoveryStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/injuries/${injury._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {user?.role === 'parent' && child.parent && child.parent._id === user.id && (
                            <Link
                              href={`/injuries/${injury._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No injuries recorded yet.</p>
              {user?.role === 'parent' && child.parent && child.parent._id === user.id && (
                <Link href={`/children/${child._id}/injuries/new`} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Injury
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Child
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete {child.name}? This action cannot be undone and will also delete all associated injuries.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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