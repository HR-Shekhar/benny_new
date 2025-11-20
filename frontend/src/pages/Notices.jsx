import React, { useState, useEffect } from 'react';
import { noticesAPI } from '../api/notices';
import { useAuth } from '../context/AuthContext';

const NOTICE_CATEGORIES = {
  school_of_cset: 'School of CSET',
  school_of_law: 'School of Law',
  school_of_ai: 'School of AI',
  school_of_media: 'School of Media',
  school_of_management: 'School of Management',
  cabinet: 'Cabinet',
  clubs_and_chapters: 'Clubs & Chapters',
  faculty: 'Faculty',
};

const Notices = () => {
  const { isStudent, isFaculty } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'school_of_cset',
    target_years: [],
  });

  useEffect(() => {
    fetchNotices();
  }, [filterCategory]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      let response;
      if (isStudent) {
        response = await noticesAPI.getStudentFeed();
      } else {
        response = await noticesAPI.getAllNotices();
      }
      let fetchedNotices = response.data;
      
      if (filterCategory !== 'all') {
        fetchedNotices = fetchedNotices.filter(n => n.category === filterCategory);
      }
      
      setNotices(fetchedNotices);
    } catch (err) {
      setError('Failed to load notices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        target_years: formData.target_years.length > 0 ? formData.target_years : null,
      };
      await noticesAPI.createNotice(data);
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        category: 'school_of_cset',
        target_years: [],
      });
      fetchNotices();
    } catch (err) {
      setError('Failed to create notice');
      console.error(err);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await noticesAPI.deleteNotice(noticeId);
      fetchNotices();
    } catch (err) {
      setError('Failed to delete notice');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
        <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
        {isFaculty && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Create Notice
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(NOTICE_CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <p className="text-gray-500">No notices found.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{notice.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                      {NOTICE_CATEGORIES[notice.category] || notice.category}
                    </span>
                    {notice.target_years && notice.target_years.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Years: {notice.target_years.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                {isFaculty && (
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700 mt-3 whitespace-pre-wrap">{notice.content}</p>
              <p className="text-sm text-gray-500 mt-4">
                Posted on {formatDate(notice.created_at)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Notice</h2>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.entries(NOTICE_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Years (optional, leave empty for all years)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((year) => (
                    <label key={year} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={formData.target_years.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              target_years: [...formData.target_years, year],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              target_years: formData.target_years.filter((y) => y !== year),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Year {year}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;

