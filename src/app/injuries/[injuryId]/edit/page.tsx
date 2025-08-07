'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, AlertTriangle } from 'lucide-react';
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
  photos: string[];
  suggestedTimeline: number;
}

export default function EditInjuryPage() {
  const router = useRouter();
  const params = useParams();
  const injuryId = params.injuryId as string;

  const [injury, setInjury] = useState<Injury | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInjury();
  }, [injuryId]);

  const fetchInjury = async () => {
    try {
      const response = await fetch(`/api/injuries/${injuryId}`);
      if (response.ok) {
        const data = await response.json();
        setInjury(data.injury);
      } else {
        toast.error('Failed to load injury');
      }
    } catch (error) {
      toast.error('An error occurred while loading the injury');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injury) return;

    setIsSaving(true);
    const loadingToast = toast.loading('Updating injury...');

    try {
      const response = await fetch(`/api/injuries/${injuryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: injury.type,
          description: injury.description,
          date: injury.date,
          location: injury.location,
          severity: injury.severity,
          recoveryStatus: injury.recoveryStatus,
          notes: injury.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Injury updated successfully', {
          id: loadingToast,
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast.error(data.error || 'Failed to update injury', {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error('An error occurred while updating the injury', {
        id: loadingToast,
      });
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!injury) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Injury Not Found</h2>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Edit Injury</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Injury Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Injury Type *
              </label>
              <input
                type="text"
                id="type"
                value={injury.type}
                onChange={(e) => setInjury({ ...injury, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={3}
                value={injury.description}
                onChange={(e) => setInjury({ ...injury, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Injury
                </label>
                <input
                  type="date"
                  id="date"
                  value={injury.date.split('T')[0]}
                  onChange={(e) => setInjury({ ...injury, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={injury.location}
                  onChange={(e) => setInjury({ ...injury, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                />
              </div>
            </div>

            {/* Severity */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                id="severity"
                value={injury.severity}
                onChange={(e) => setInjury({ ...injury, severity: e.target.value as 'mild' | 'moderate' | 'severe' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            {/* Recovery Status */}
            <div>
              <label htmlFor="recoveryStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Recovery Status *
              </label>
              <select
                id="recoveryStatus"
                value={injury.recoveryStatus}
                onChange={(e) => setInjury({ ...injury, recoveryStatus: e.target.value as 'Resting' | 'Light Activity' | 'Full Play' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="Resting">Resting</option>
                <option value="Light Activity">Light Activity</option>
                <option value="Full Play">Full Play</option>
              </select>
            </div>

            {/* Progress Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recovery Progress
              </label>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(injury.recoveryStatus)}`}>
                  {injury.recoveryStatus}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={injury.notes}
                onChange={(e) => setInjury({ ...injury, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Any additional information about the injury or treatment"
              />
            </div>

            {/* Messages */}
            {/* Messages */}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary inline-flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 