import apiClient from './client';

export const slotsAPI = {
  // Create slot (Faculty only)
  createSlot: (data) => apiClient.post('/slots/', data),

  // Get slot by ID
  getSlot: (slotId) => apiClient.get(`/slots/${slotId}`),

  // Get my slots (Faculty only)
  getMySlots: () => apiClient.get('/slots/me'),

  // Get slots by faculty
  getSlotsByFaculty: (facultyId) => apiClient.get(`/slots/faculty/${facultyId}`),

  // Get available slots
  getAvailableSlots: () => apiClient.get('/slots/available'),

  // Book slot (Student only)
  bookSlot: (slotId) => apiClient.post(`/slots/${slotId}/book`),

  // Cancel booking (Student only)
  cancelBooking: (slotId) => apiClient.post(`/slots/${slotId}/cancel`),

  // Delete slot (Faculty only)
  deleteSlot: (slotId) => apiClient.delete(`/slots/${slotId}`),
};

