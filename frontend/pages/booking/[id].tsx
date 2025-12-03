import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Booking {
  id: number;
  status: string;
  customer_notes: string;
  total_price: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  business_name: string;
  business_address: string;
  contact_info: string;
  service_name: string;
  service_description: string;
  duration: number;
  start_time: string;
  end_time: string;
  payment_status: string;
  payment_method: string;
}

export default function BookingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data.booking);
    } catch (error: any) {
      toast.error('Failed to load booking details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(true);

    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p>Booking not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>Booking #{booking.id} - BookIt</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Booking Confirmation</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status.toUpperCase()}
              </span>
            </div>
            <p className="text-primary-100 mt-1">Booking ID: #{booking.id}</p>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Info */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Business Details</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {booking.business_name}</p>
                  <p><strong>Address:</strong> {booking.business_address}</p>
                  <p><strong>Contact:</strong> {booking.contact_info}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Customer Details</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {booking.customer_name}</p>
                  <p><strong>Email:</strong> {booking.customer_email}</p>
                  <p><strong>Phone:</strong> {booking.customer_phone}</p>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Service Details</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Service:</strong> {booking.service_name}</p>
                  <p><strong>Duration:</strong> {booking.duration} minutes</p>
                  <p><strong>Price:</strong> UGX {booking.total_price.toLocaleString()}</p>
                </div>
              </div>

              {/* Appointment Time */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Appointment Time</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {new Date(booking.start_time).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {booking.customer_notes && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{booking.customer_notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 text-center py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Back to Home
              </Link>

              {booking.status === 'booked' && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}

              {booking.status === 'completed' && (
                <Link
                  href={`/reviews/create?booking_id=${booking.id}`}
                  className="flex-1 text-center py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Leave a Review
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
