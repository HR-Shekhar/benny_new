import apiClient from './client';

export const facultyAPI = {
  // Create/Update profile (Faculty only)
  createUpdateProfile: (data) => apiClient.post('/faculty/profile', data),

  // Get my profile (Faculty only)
  getMyProfile: () => apiClient.get('/faculty/profile/me'),

  // Get public profile
  getPublicProfile: (profileId) => apiClient.get(`/faculty/profile/${profileId}`),
};

