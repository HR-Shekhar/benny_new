import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../api/faculty';
import { useAuth } from '../context/AuthContext';

const FacultyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    courses: [],
    contact: {
      phone: '',
      cabin: '',
    },
  });
  const [newCourse, setNewCourse] = useState({ code: '', name: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await facultyAPI.getMyProfile();
      setProfile(response.data);
      setFormData({
        description: response.data.description || '',
        courses: response.data.courses || [],
        contact: response.data.contact || { phone: '', cabin: '' },
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet, allow creation
        setIsEditing(true);
      } else {
        setError('Failed to load profile');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        description: formData.description || null,
        courses: formData.courses.length > 0 ? formData.courses : [],
        contact: formData.contact.phone || formData.contact.cabin
          ? formData.contact
          : null,
      };
      const response = await facultyAPI.createUpdateProfile(data);
      setProfile(response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      setFormData({
        ...formData,
        courses: [...formData.courses, { ...newCourse }],
      });
      setNewCourse({ code: '', name: '' });
    }
  };

  const handleRemoveCourse = (index) => {
    setFormData({
      ...formData,
      courses: formData.courses.filter((_, i) => i !== index),
    });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

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

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell students about yourself, your research interests, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courses
              </label>
              <div className="space-y-2 mb-3">
                {formData.courses.map((course, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
                    <span className="flex-1 font-medium">{course.code}</span>
                    <span className="flex-2">{course.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Course Code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="flex-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={formData.contact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Cabin Number"
                  value={formData.contact.cabin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, cabin: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.full_name || user?.email}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            {profile?.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
              </div>
            )}

            {profile?.courses && profile.courses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.courses.map((course, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <span className="font-medium text-indigo-600">{course.code}</span>
                      <p className="text-gray-700">{course.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.contact && (profile.contact.phone || profile.contact.cabin) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                <div className="space-y-2">
                  {profile.contact.phone && (
                    <div className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {profile.contact.phone}
                    </div>
                  )}
                  {profile.contact.cabin && (
                    <div className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 mr-2"
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
                      Cabin: {profile.contact.cabin}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!profile && (
              <div className="text-center py-8 text-gray-500">
                <p>No profile information available. Click "Edit Profile" to create one.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyProfile;

