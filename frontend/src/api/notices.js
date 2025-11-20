import apiClient from './client';

export const noticesAPI = {
  // Create notice (Faculty only)
  createNotice: (data) => apiClient.post('/notices/', data),

  // Get all notices
  getAllNotices: () => apiClient.get('/notices/all'),

  // Get notices by faculty
  getFacultyNotices: (facultyId) => apiClient.get(`/notices/faculty/${facultyId}`),

  // Get notices by category
  getNoticesByCategory: (category) => apiClient.get(`/notices/category/${category}`),

  // Get notices by category and year
  getNoticesByCategoryAndYear: (category, year) => 
    apiClient.get(`/notices/category/${category}/year/${year}`),

  // Get student feed
  getStudentFeed: () => apiClient.get('/notices/student-feed'),

  // Delete notice (Faculty only)
  deleteNotice: (noticeId) => apiClient.delete(`/notices/${noticeId}`),
};

