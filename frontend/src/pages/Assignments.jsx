import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI } from '../api/assignments';

const Assignments = () => {
  const { user, isFaculty, isStudent } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentsAPI.listAssignments();
      setAssignments(res.data.assignments || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const isPastDeadline = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
  };

  const handleCreateAssignment = () => {
    navigate('/assignments/create');
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/assignments/${assignmentId}/submissions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
          {isFaculty && (
            <button
              onClick={handleCreateAssignment}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Create Assignment
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500">No assignments available</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {assignment.title}
                    </h2>
                    {assignment.description && (
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Deadline: {formatDate(assignment.deadline)}
                      </span>
                      {isPastDeadline(assignment.deadline) && (
                        <span className="text-red-600 font-semibold">Past Deadline</span>
                      )}
                      {assignment.files && assignment.files.length > 0 && (
                        <span>{assignment.files.length} file(s)</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        assignment.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleViewAssignment(assignment.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    {isStudent ? 'View & Submit' : 'View Details'}
                  </button>
                  {isFaculty && (
                    <button
                      onClick={() => handleViewSubmissions(assignment.id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      View Submissions
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;

