'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, AlertTriangle, Clock, Info } from 'lucide-react';
import { getSuggestedTimeline, type InjuryTimeline } from '@/lib/injuryTimelines';
import toast from 'react-hot-toast';
import { use } from 'react';

interface InjuryFormData {
  type: string;
  description: string;
  date: string;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  photos: File[];
}

export default function NewInjuryPage({ params }: { params: Promise<{ childId: string }> }) {
  const router = useRouter();
  const { childId } = use(params);
  const [formData, setFormData] = useState<InjuryFormData>({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    severity: 'mild',
    notes: '',
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestedTimeline, setSuggestedTimeline] = useState<InjuryTimeline | null>(null);

  // Update suggested timeline when injury type changes
  useEffect(() => {
    if (formData.type.trim()) {
      const timeline = getSuggestedTimeline(formData.type);
      setSuggestedTimeline(timeline);
    } else {
      setSuggestedTimeline(null);
    }
  }, [formData.type]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, photos: [...formData.photos, ...files] });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type.trim()) {
      newErrors.type = 'Injury type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating injury record...');

    try {
      // Convert photos to base64 for upload
      const photoUrls: string[] = [];
      if (formData.photos.length > 0) {
        for (const photo of formData.photos) {
          const base64 = await convertFileToBase64(photo);
          photoUrls.push(base64);
        }
      }

      const injuryData = {
        childId: childId,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        severity: formData.severity,
        notes: formData.notes,
        photos: photoUrls,
        suggestedTimeline: suggestedTimeline?.suggestedDays || 7,
      };

      const response = await fetch('/api/injuries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(injuryData),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Injury record created successfully!', {
          id: loadingToast,
        });
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create injury', {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error('An error occurred while creating the injury', {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Add New Injury</h1>
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Ankle Sprain, Knee Injury"
              />
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Suggested Timeline */}
            {suggestedTimeline && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Suggested Recovery Timeline
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      {suggestedTimeline.description}
                    </p>
                    <div className="text-sm text-blue-600">
                      <strong>Estimated recovery time:</strong> {suggestedTimeline.suggestedDays} days
                    </div>
                    {suggestedTimeline.tips.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-sm text-blue-700">Recovery tips:</strong>
                        <ul className="mt-1 text-sm text-blue-600">
                          {suggestedTimeline.tips.map((tip, index) => (
                            <li key={index} className="ml-4 list-disc">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe how the injury occurred and any symptoms"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Right Ankle, Left Knee"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
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

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="photos" className="cursor-pointer">
                    <span className="btn-primary inline-flex items-center">
                      Upload Photos
                    </span>
                    <input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload photos of the injury (optional, multiple allowed)
                </p>
                
                {/* Privacy Notice */}
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Privacy Notice</p>
                      <p className="mt-1">
                        Photos you upload will be stored securely and used only for injury tracking purposes. 
                        They will not be shared with third parties without your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Display uploaded photos */}
              {formData.photos.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Injury photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
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
                placeholder="Any additional information about the injury or treatment"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

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
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Injury'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 