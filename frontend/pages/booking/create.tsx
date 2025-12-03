import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function CreateBooking() {
  const router = useRouter();
  const { business_id, service_id, timeslot_id } = router.query;
  const { user } = useAuth();
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book an appointment');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/bookings', {
        business_id: parseInt(business_id as string),
        service_id: parseInt(service_id as string),
        timeslot_id: parseInt(timeslot_id as string),
        customer_notes: customerNotes
      });

      toast.success('Booking created successfully!');
      router.push(`/booking/${response.data.booking.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Complete Booking - BookIt</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any special requests or notes for the business..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Go Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
