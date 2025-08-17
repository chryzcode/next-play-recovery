'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    consentAgreed: false,
    isThirteenOrOlder: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.consentAgreed) {
      newErrors.consentAgreed = 'You must agree to the terms and consent to continue';
    }

    if (!formData.isThirteenOrOlder) {
      newErrors.isThirteenOrOlder = 'You must be 13 or older to create an account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          consentAgreed: formData.consentAgreed,
          isThirteenOrOlder: formData.isThirteenOrOlder,
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please check your email to verify your account.', {
          id: loadingToast,
        });
        router.push('/login');
      } else {
        toast.error(data.error || 'Failed to create account', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred while creating your account', {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={isLoading}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 border placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className={`appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Age Question */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
                <label className="text-sm font-medium text-blue-900">
                  Are you 13 or older?
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="age"
                    value="yes"
                    checked={formData.isThirteenOrOlder === true}
                    onChange={() => setFormData({ ...formData, isThirteenOrOlder: true })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-blue-800">Yes, I am 13 or older</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="age"
                    value="no"
                    checked={formData.isThirteenOrOlder === false}
                    onChange={() => setFormData({ ...formData, isThirteenOrOlder: false })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-blue-800">No, I am under 13</span>
                </label>
              </div>
              {formData.isThirteenOrOlder === false && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    Sorry, users under 13 cannot create an account on Next Play Recovery. Please ask a parent/guardian to help track injuries or contact us at hello@nextplayrecovery.com.
                  </p>
                </div>
              )}
              {errors.isThirteenOrOlder && <p className="mt-1 text-sm text-red-600">{errors.isThirteenOrOlder}</p>}
            </div>

            {/* Consent Checkbox */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.consentAgreed}
                  onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                  required
                />
                <div className="text-sm text-gray-700">
                  <p>
                    ☑️ I understand that Next Play Recovery (including the Resource Center) is for informational use only and not medical advice. 
                    I agree to the Terms of Use, Privacy Policy, and Disclaimer, consent to the storage of my data (including optional photos), 
                    and confirm I am 13 or older (with parent/guardian consent if under 18).
                  </p>
                </div>
              </label>
              {errors.consentAgreed && <p className="mt-1 text-sm text-red-600">{errors.consentAgreed}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.isThirteenOrOlder}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 