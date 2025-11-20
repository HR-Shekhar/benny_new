import React, { useState } from 'react';
import { resourcesAPI } from '../api/resources';
import { useAuth } from '../context/AuthContext';

const UploadResource = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_code: '',
    course_name: '',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.file) {
      setError('Please select a file');
      setLoading(false);
      return;
    }

    // Validate file type
    const fileExt = formData.file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'ppt', 'pptx'].includes(fileExt)) {
      setError('Only PDF and PPT/PPTX files are allowed');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('course_code', formData.course_code);
      data.append('course_name', formData.course_name);

      await resourcesAPI.uploadResource(data);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        course_code: '',
        course_name: '',
        file: null,
      });
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Handle FastAPI validation errors
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Multiple validation errors
          const errorMessages = err.response.data.detail.map(
            (e) => `${e.loc.join('.')}: ${e.msg}`
          );
          setError(errorMessages.join('; '));
        } else if (typeof err.response.data.detail === 'string') {
          // Single error message
          setError(err.response.data.detail);
        } else {
          setError('Validation error occurred');
        }
      } else {
        setError(err.message || 'Failed to upload resource');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Resource</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Resource uploaded successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Introduction to Machine Learning"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief description of the resource"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code *
              </label>
              <input
                type="text"
                name="course_code"
                required
                value={formData.course_code}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                name="course_name"
                required
                value={formData.course_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File (PDF or PPT/PPTX) *
            </label>
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.ppt,.pptx"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, PPT, PPTX
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadResource;

