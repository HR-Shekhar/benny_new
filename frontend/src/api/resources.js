import apiClient from './client';

export const resourcesAPI = {
  // Faculty uploads a resource
  uploadResource: (formData) => {
    // Don't set Content-Type - let axios set it automatically with boundary
    return apiClient.post('/resources/upload', formData);
  },

  // Get all resources
  getAllResources: () => apiClient.get('/resources/all'),

  // Summarize an uploaded resource
  summarizeResource: (resourceId, summaryType = 'short') =>
    apiClient.get(`/resources/${resourceId}/summarize?summary_type=${summaryType}`),

  // Summarize local file (student upload)
  summarizeLocalFile: (file, summaryType = 'short') => {
    const data = new FormData();
    data.append('file', file);
    data.append('summary_type', summaryType);
    // Don't set Content-Type - let axios set it automatically with boundary
    return apiClient.post('/resources/summarize/local', data);
  },

  // Download resource file
  downloadResource: (resourceId) => {
    return apiClient.get(`/resources/${resourceId}/download`, {
      responseType: 'blob',
    });
  },
};

