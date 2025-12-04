import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Business {
  id: number;
  name: string;
  category: string;
  is_approved: boolean;
  address?: string;
  city?: string;
  contact_info?: string;
  image_url?: string | null;
  services?: Service[];
}

interface Service {
  id: number;
  service_name: string;
  price: number;
  duration: number;
  is_active: boolean;
}

interface Booking {
  id: number;
  customer_name: string;
  service_name: string;
  start_time: string;
  status: string;
  total_price: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'profile'>('bookings');

  const fetchBusinessData = useCallback(async () => {
    try {
      const response = await api.get('/businesses/my/profile');
      setBusiness(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.info('Please create your business profile');
      } else {
        toast.error('Failed to load business data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      if (!business) return;
      const response = await api.get(`/bookings/business/${business.id}`);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to load bookings');
    }
  }, [business]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'admin') {
      router.push('/admin');
      return;
    }
    if (user.role !== 'business') {
      router.push('/');
      return;
    }
    fetchBusinessData();
    fetchBookings();
  }, [user, router, fetchBusinessData, fetchBookings]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-gray-600 mb-6">
            You haven&apos;t created your business profile yet. Let&apos;s get started!
          </p>
          <Link
            href="/dashboard/business-setup"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Create Business Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Business Dashboard - BookIt</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <p className="text-gray-600">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 text-sm rounded-full">
                  {business.category}
                </span>
                {!business.is_approved && (
                  <span className="ml-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    Pending Approval
                  </span>
                )}
              </p>
            </div>
            <Link
              href={`/business/${business.id}`}
              className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
            >
              View Public Profile
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 font-medium border-b-2 transition ${activeTab === 'bookings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-4 font-medium border-b-2 transition ${activeTab === 'services'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 font-medium border-b-2 transition ${activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Bookings</h2>
            </div>

            {bookings.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{booking.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.service_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(booking.start_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">UGX {booking.total_price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">No bookings yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Services</h2>
              <Link
                href="/dashboard/add-service"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Add Service
              </Link>
            </div>

            {business.services && business.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {business.services.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{service.service_name}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>💵 UGX {service.price.toLocaleString()}</p>
                      <p>⏱️ {service.duration} minutes</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 mb-4">No services added yet</p>
                <Link
                  href="/dashboard/add-service"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Add Your First Service
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Business Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: Logo */}
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3 border border-dashed border-gray-300">
                  {business.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={business.image_url}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-gray-400">{business.name.charAt(0)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2 text-center">
                  Logo
                </p>
                <Link
                  href="/dashboard/edit-profile"
                  className="px-4 py-2 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition font-medium"
                >
                  Upload / change logo
                </Link>
              </div>

              {/* Right: Organisation details */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Organisation name
                    </label>
                    <p className="text-sm text-gray-900">{business.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {/* Business contact email comes from contact_info or is managed in profile setup */}
                      {business.contact_info || 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Location
                    </label>
                    <p className="text-sm text-gray-900">
                      {business.city || business.address || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Phone number
                    </label>
                    <p className="text-sm text-gray-900">
                      {/* Phone number can be stored inside contact_info or in user profile; surface here if present */}
                      {business.contact_info || 'Not set'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Category
                  </label>
                  <p className="text-sm text-gray-900">{business.category}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Status
                  </label>
                  <p className="text-sm text-gray-900">
                    {business.is_approved ? 'Approved' : 'Pending Approval'}
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href="/dashboard/edit-profile"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Edit profile details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
