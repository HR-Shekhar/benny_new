import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../api/resources';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
  const { isStudent } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summarizing, setSummarizing] = useState({});
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAllResources();
      setResources(response.data || []);
    } catch (err) {
      setError('Failed to load resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (resourceId, summaryType = 'short') => {
    if (summarizing[resourceId]) return;

    setSummarizing({ ...summarizing, [resourceId]: true });
    try {
      const response = await resourcesAPI.summarizeResource(resourceId, summaryType);
      setSummaries({ ...summaries, [resourceId]: response.data.summary });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setSummarizing({ ...summarizing, [resourceId]: false });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Resources</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No resources available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {resource.course_code}
                  </span>
                  <span className="text-xs text-gray-500">{resource.course_name}</span>
                </div>
                {resource.description && (
                  <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Uploaded on {formatDate(resource.created_at)}
                </p>
              </div>

              {isStudent && (
                <div className="space-y-2">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => handleSummarize(resource.id, 'short')}
                      disabled={summarizing[resource.id]}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {summarizing[resource.id] ? 'Summarizing...' : 'Short Summary'}
                    </button>
                    <button
                      onClick={() => handleSummarize(resource.id, 'medium')}
                      disabled={summarizing[resource.id]}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => handleSummarize(resource.id, 'long')}
                      disabled={summarizing[resource.id]}
                      className="flex-1 bg-indigo-400 hover:bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      Long
                    </button>
                  </div>
                  <a
                    href={`/api/v1/resources/${resource.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
                  >
                    Download File
                  </a>
                  {summaries[resource.id] && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {summaries[resource.id]}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;

