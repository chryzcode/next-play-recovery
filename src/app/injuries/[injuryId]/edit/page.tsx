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
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    date: '',
    location: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    recoveryStatus: 'Resting' as 'Resting' | 'Light Activity' | 'Full Play',
    notes: '',
    photos: [] as string[],
  });
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);

  useEffect(() => {
    fetchInjury();
  }, [injuryId]);

  const fetchInjury = async () => {
    try {
      const response = await fetch(`/api/injuries/${injuryId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setInjury(data.injury);
        setFormData({
          type: data.injury.type,
          description: data.injury.description,
          date: data.injury.date.split('T')[0],
          location: data.injury.location,
          severity: data.injury.severity,
          recoveryStatus: data.injury.recoveryStatus,
          notes: data.injury.notes || '',
          photos: data.injury.photos || [],
        });
      } else {
        toast.error('Failed to load injury details');
        router.push('/injuries');
      }
    } catch (error) {
      console.error('Error loading injury:', error);
      toast.error('An error occurred while loading injury details');
      router.push('/injuries');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingPhotos(true);
      const files = Array.from(e.target.files);
      
      try {
        // Create FormData for upload
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });

        // Upload to Cloudinary via our API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.urls) {
            // Add the new Cloudinary URLs to photos
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, ...result.urls]
            }));
            toast.success(`Successfully uploaded ${result.urls.length} image(s)`);
          }
        } else {
          toast.error('Failed to upload images');
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Error uploading images');
      } finally {
        setIsProcessingPhotos(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      console.log('Submitting form data:', formData); // Debug log
      
      const response = await fetch(`/api/injuries/${injuryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Injury updated successfully!');
        router.push(`/injuries/${injuryId}`);
      } else {
        const data = await response.json();
        console.error('API error response:', data); // Debug log
        toast.error(data.error || 'Failed to update injury');
      }
    } catch (error) {
      console.error('Error updating injury:', error);
      toast.error('An error occurred while updating the injury');
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
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as 'mild' | 'moderate' | 'severe' })}
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
                value={formData.recoveryStatus}
                onChange={(e) => setFormData({ ...formData, recoveryStatus: e.target.value as 'Resting' | 'Light Activity' | 'Full Play' })}
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
                  <span>{getProgressPercentage(formData.recoveryStatus)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(formData.recoveryStatus)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.recoveryStatus)}`}>
                  {formData.recoveryStatus}
                </span>
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Injury Photos
              </label>
              
              {/* Current Photos Display */}
              {formData.photos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">Current photos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Injury photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {isProcessingPhotos ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-600 text-sm">Processing photos...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="photos" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {formData.photos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                        </span>
                        <input
                          id="photos"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoChange}
                          className="hidden"
                          disabled={isProcessingPhotos}
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Click to add more photos
                    </p>
                  </>
                )}
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
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Include date, progress, and any observations, symptom changes, or questions. Example: 06/20 – Able to jog without pain."
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