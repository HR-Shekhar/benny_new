import apiClient from './client';

/**
 * Assignment API client
 * Handles all assignment and submission related API calls
 */

export const assignmentsAPI = {
  // ========== Assignment Endpoints ==========

  /**
   * Create a new assignment (Faculty only)
   * @param {Object} data - Assignment data
   * @param {string} data.title - Assignment title
   * @param {string} data.description - Assignment description
   * @param {string} data.deadline - Deadline in ISO format
   * @param {File[]} data.files - Array of files to upload
   */
  createAssignment: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('deadline', data.deadline);
    
    // Append all files
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    return apiClient.post('/assignments/', formData);
  },

  /**
   * Get list of all assignments
   */
  listAssignments: async () => {
    return apiClient.get('/assignments/');
  },

  /**
   * Get assignment details by ID
   * @param {string} assignmentId - Assignment ID
   */
  getAssignment: async (assignmentId) => {
    return apiClient.get(`/assignments/${assignmentId}`);
  },

  /**
   * Download an assignment file
   * @param {string} assignmentId - Assignment ID
   * @param {string} filename - File name or path
   */
  downloadAssignmentFile: async (assignmentId, filename) => {
    const response = await apiClient.get(
      `/assignments/${assignmentId}/files/${encodeURIComponent(filename)}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response;
  },

  // ========== Submission Endpoints ==========

  /**
   * Submit an assignment (Student only)
   * @param {string} assignmentId - Assignment ID
   * @param {File} file - Submission file
   */
  submitAssignment: async (assignmentId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(`/assignments/${assignmentId}/submit`, formData);
  },

  /**
   * Get all submissions for an assignment (Faculty only)
   * @param {string} assignmentId - Assignment ID
   */
  listSubmissions: async (assignmentId) => {
    return apiClient.get(`/assignments/${assignmentId}/submissions`);
  },

  /**
   * Get a specific submission with feedback (Faculty or Student owner)
   * @param {string} assignmentId - Assignment ID
   * @param {string} submissionId - Submission ID
   */
  getSubmission: async (assignmentId, submissionId) => {
    return apiClient.get(`/assignments/${assignmentId}/submissions/${submissionId}`);
  },

  /**
   * Get student's own submission for an assignment (Student only)
   * @param {string} assignmentId - Assignment ID
   */
  getMySubmission: async (assignmentId) => {
    return apiClient.get(`/assignments/${assignmentId}/my-submission`);
  },

  /**
   * Trigger AI grading for a submission (Faculty only)
   * @param {string} assignmentId - Assignment ID
   * @param {string} submissionId - Submission ID
   */
  gradeSubmission: async (assignmentId, submissionId) => {
    return apiClient.post(`/assignments/${assignmentId}/submissions/${submissionId}/grade`);
  },

  /**
   * Download a submission file
   * @param {string} assignmentId - Assignment ID
   * @param {string} submissionId - Submission ID
   */
  downloadSubmissionFile: async (assignmentId, submissionId) => {
    const response = await apiClient.get(
      `/assignments/${assignmentId}/submissions/${submissionId}/download`,
      { responseType: 'blob' }
    );
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'submission';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response;
  },
};

