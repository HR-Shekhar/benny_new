import React, { useState, useEffect } from 'react';
import { slotsAPI } from '../api/slots';
import { useAuth } from '../context/AuthContext';

const Slots = () => {
  const { isStudent } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await slotsAPI.getAvailableSlots();
      setSlots(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load slots';
      setError(errorMessage);
      console.error('Error loading slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId) => {
    try {
      await slotsAPI.bookSlot(slotId);
      setSuccess('Slot booked successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book slot');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelBooking = async (slotId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await slotsAPI.cancelBooking(slotId);
      setSuccess('Booking cancelled successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isBookedByMe = (slot) => {
    // Check if current user is in booked_by list
    // Note: This requires checking user ID, which we'd need from auth context
    // For now, we'll show all available slots
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Slots</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <p className="text-gray-500">No available slots at the moment.</p>
          </div>
        ) : (
          slots.map((slot) => {
            const isAvailable = slot.booked_count < slot.max_students;
            const isFull = slot.booked_count >= slot.max_students;

            return (
              <div
                key={slot.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  {slot.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{slot.title}</h3>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDateTime(slot.start_time)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDateTime(slot.end_time)}
                    </div>
                    {slot.location && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {slot.location}
                      </div>
                    )}
                    {slot.faculty && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {slot.faculty.full_name || slot.faculty.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Bookings:</span>
                    <span className="font-medium">
                      {slot.booked_count} / {slot.max_students}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        isFull ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${(slot.booked_count / slot.max_students) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                {isStudent && (
                  <div>
                    {isFull ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                      >
                        Full
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                      >
                        Book Slot
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Slots;

