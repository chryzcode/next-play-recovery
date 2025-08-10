'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Child {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  sport: string;
  notes: string;
}

export default function EditChildPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [child, setChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    sport: '',
    notes: ''
  });

  useEffect(() => {
    if (params.childId) {
      fetchChild();
    }
  }, [params.childId]);

  const fetchChild = async () => {
    try {
      const response = await fetch(`/api/children/${params.childId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setChild(data);
        setFormData({
          name: data.name,
          age: data.age,
          gender: data.gender,
          sport: data.sport || '',
          notes: data.notes || '',
        });
      } else {
        toast.error('Failed to load child details');
        router.push('/children');
      }
    } catch (error) {
      console.error('Error loading child:', error);
      toast.error('An error occurred while loading child details');
      router.push('/children');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/children/${params.childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Child updated successfully!');
        router.push(`/children/${params.childId}`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update child');
      }
    } catch (error) {
      console.error('Error updating child:', error);
      toast.error('An error occurred while updating the child');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/children/${child._id}`} className="btn-secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Child Details
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit {child.name}</h1>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter child's full name"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="18"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700">
                Sport
              </label>
              <input
                type="text"
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., Soccer, Basketball, Swimming"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Any additional notes about the child"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/children/${child._id}`}
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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