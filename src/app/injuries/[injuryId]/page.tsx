'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, AlertTriangle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface Injury {
  _id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  recoveryStatus: 'Resting' | 'Light Activity' | 'Full Play';
  photos: string[];
  notes: string;
  suggestedTimeline: number;
  child: {
    _id: string;
    name: string;
    age: number;
    parent?: {
      _id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function InjuryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [injury, setInjury] = useState<Injury | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (params.injuryId) {
      fetchInjury();
    }
  }, [params.injuryId]);

  const fetchInjury = async () => {
    try {
      const response = await fetch(`/api/injuries/${params.injuryId}`);
      if (response.ok) {
        const data = await response.json();
        setInjury(data.injury);
      } else {
        toast.error('Failed to load injury details');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching injury:', error);
      toast.error('An error occurred while loading injury details');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/injuries/${params.injuryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Injury deleted successfully');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete injury');
      }
    } catch (error) {
      console.error('Error deleting injury:', error);
      toast.error('An error occurred while deleting the injury');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!injury) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Injury not found</h1>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{injury.type}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user?.role === 'parent' && injury.child?.parent?._id?.toString() === user.id && (
                <>
                  <Link href={`/injuries/${injury._id}/edit`} className="btn-primary">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Injury Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Injury Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{injury.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{injury.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(injury.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {injury.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(injury.severity)}`}>
                      {injury.severity}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recovery Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecoveryStatusColor(injury.recoveryStatus)}`}>
                      {injury.recoveryStatus}
                    </span>
                  </div>
                </div>
                {injury.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{injury.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {injury.photos && injury.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {injury.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Injury photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Child Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Child Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{injury.child.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="mt-1 text-sm text-gray-900">{injury.child.age} years old</p>
                </div>
                <Link
                  href={`/children/${injury.child._id}`}
                  className="btn-primary w-full text-center"
                >
                  View Child Details
                </Link>
              </div>
            </div>

            {/* Recovery Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recovery Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(injury.recoveryStatus)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(injury.recoveryStatus)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Suggested timeline: {injury.suggestedTimeline} days
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Injury occurred</p>
                    <p className="text-xs text-gray-500">{new Date(injury.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current status</p>
                    <p className="text-xs text-gray-500">{injury.recoveryStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Injury
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this injury record? This action cannot be undone.
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