import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface Business {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  rating: number;
  total_reviews: number;
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['barber', 'tutor', 'mechanic', 'salon', 'spa', 'dentist', 'therapist'];

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 12 };
      if (category) params.category = category;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/businesses', { params });
      setBusinesses(response.data.businesses);
    } catch (error: any) {
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses();
  };

  return (
    <>
      <Head>
        <title>BookIt - Appointment Booking Platform</title>
        <meta name="description" content="Book appointments with local businesses" />
      </Head>

      {/* Hero Section */}
      <div className="bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight leading-none mb-8">
              Appointment booking
              <br />
              <span className="text-indigo-600">infrastructure</span> for the
              <br />
              internet
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
              Millions of businesses use BookIt to accept bookings online and in person, manage calendars, send reminders, and build a more profitable business.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-indigo-600 text-white font-semibold text-lg rounded-full hover:bg-indigo-700 transition-colors duration-200"
              >
                Start now →
              </Link>
              <Link
                href="#businesses"
                className="px-8 py-4 text-indigo-600 font-semibold text-lg hover:text-indigo-700 transition-colors duration-200"
              >
                Browse businesses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gray-50 py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Modular solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A unified platform to accept bookings, manage calendars, and grow your revenue
            </p>
          </div>
          
          <div className="space-y-32">
            {/* Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-sm font-semibold text-indigo-600 mb-4 uppercase tracking-wide">Bookings</div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Accept and manage bookings, 24/7</h3>
                <p className="text-lg text-gray-600 mb-8">
                  Let customers book appointments anytime with our online booking system. Manage your calendar, services, and availability in one place.
                </p>
                <Link href="/businesses" className="text-indigo-600 font-semibold text-lg hover:text-indigo-700">
                  Start with Bookings →
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-sm text-gray-500 mb-4">📅 Calendar View</div>
                <div className="space-y-3">
                  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                    <div className="font-semibold text-gray-900">10:00 AM - Haircut with John</div>
                    <div className="text-sm text-gray-600">Classic Cuts Barbershop</div>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <div className="font-semibold text-gray-900">2:00 PM - Spa Treatment</div>
                    <div className="text-sm text-gray-600">Relaxation Wellness Center</div>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <div className="font-semibold text-gray-900">4:30 PM - Consultation</div>
                    <div className="text-sm text-gray-600">Expert Tutoring Services</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:order-first order-last">
                <div className="text-sm text-gray-500 mb-4">💳 Payment Processing</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <div className="font-semibold">Haircut Service</div>
                      <div className="text-sm text-gray-600">Completed today</div>
                    </div>
                    <div className="font-bold text-green-600">+$45.00</div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <div className="font-semibold">Massage Therapy</div>
                      <div className="text-sm text-gray-600">Completed yesterday</div>
                    </div>
                    <div className="font-bold text-green-600">+$120.00</div>
                  </div>
                  <div className="pt-4">
                    <div className="text-2xl font-bold text-gray-900">$165.00</div>
                    <div className="text-sm text-gray-600">Total revenue (Last 2 days)</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-indigo-600 mb-4 uppercase tracking-wide">Payments</div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Secure payment processing</h3>
                <p className="text-lg text-gray-600 mb-8">
                  Accept payments online and in person. Process transactions securely with built-in fraud protection and instant payouts.
                </p>
                <Link href="/signup" className="text-indigo-600 font-semibold text-lg hover:text-indigo-700">
                  Explore Payments →
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-sm font-semibold text-indigo-600 mb-4 uppercase tracking-wide">Client Management</div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Build lasting relationships</h3>
                <p className="text-lg text-gray-600 mb-8">
                  Track customer history, send automated reminders, and keep clients coming back with personalized service.
                </p>
                <Link href="/signup" className="text-indigo-600 font-semibold text-lg hover:text-indigo-700">
                  Learn about Management →
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                    <div className="text-sm text-gray-600">Active Businesses</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
                    <div className="text-sm text-gray-600">Monthly Bookings</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">5K+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Businesses */}
      <div id="businesses" className="bg-white py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Trusted by businesses like yours</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Join thousands of service providers using BookIt to grow their business</p>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-indigo-600"></div>
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business, index) => (
                <Link
                  key={business.id}
                  href={`/business/${business.id}`}
                  className="group block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{business.category}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{business.rating ? Number(business.rating).toFixed(1) : '0.0'}</span>
                      <span className="mx-1">·</span>
                      <span>{business.total_reviews || 0} reviews</span>
                    </div>
                    {business.city && (
                      <span className="text-gray-500">{business.city}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-2">No businesses found</p>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/businesses"
              className="inline-block text-indigo-600 font-semibold text-lg hover:text-indigo-700 transition-colors"
            >
              View all businesses →
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-white py-24 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Create an account instantly and start accepting bookings in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-indigo-600 text-white font-semibold text-lg rounded-full hover:bg-indigo-700 transition-colors duration-200"
            >
              Start now
            </Link>
            <Link
              href="/businesses"
              className="px-8 py-4 text-indigo-600 font-semibold text-lg hover:text-indigo-700 transition-colors duration-200"
            >
              Browse businesses
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
