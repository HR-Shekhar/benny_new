import apiClient from './client';

export const authAPI = {
  // Registration
  registerStudent: (data) => apiClient.post('/auth/register/student', data),
  registerFaculty: (data) => apiClient.post('/auth/register/faculty', data),
  registerAlumni: (data) => apiClient.post('/auth/register/alumni', data),

  // Login
  login: (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return apiClient.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // Get current user
  getMe: () => apiClient.get('/auth/me'),

  // OTP
  requestOTP: (email) => apiClient.post('/auth/request-otp', { email }),
  verifyEmail: (email, otp) => apiClient.post('/auth/verify-email', { email, otp }),
};

