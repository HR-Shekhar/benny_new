import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI } from '../api/assignments';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const { isStudent, isFaculty } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const assignmentRes = await assignmentsAPI.getAssignment(assignmentId);
      setAssignment(assignmentRes.data);

      // If student, check for existing submission
      if (isStudent) {
        try {
          const submissionRes = await assignmentsAPI.getMySubmission(assignmentId);
          setSubmission(submissionRes.data);
        } catch (err) {
          // No submission yet - that's okay
          if (err.response?.status !== 404) {
            console.error('Error fetching submission:', err);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDownloadFile = async (filename) => {
    try {
      await assignmentsAPI.downloadAssignmentFile(assignmentId, filename);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await assignmentsAPI.submitAssignment(assignmentId, file);
      setSubmission(res.data);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
      // Refresh to show grade if available
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/assignments')}
          className="mb-4 text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Assignments
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {assignment?.title}
          </h1>

          {assignment?.description && (
            <p className="text-gray-600 mb-4">{assignment.description}</p>
          )}

          <div className="space-y-2 mb-4">
            <div>
              <span className="font-semibold">Deadline:</span>{' '}
              <span className={isPastDeadline(assignment?.deadline) ? 'text-red-600' : ''}>
                {formatDate(assignment?.deadline)}
              </span>
              {isPastDeadline(assignment?.deadline) && (
                <span className="ml-2 text-red-600 font-semibold">(Past Deadline)</span>
              )}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  assignment?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {assignment?.status}
              </span>
            </div>
          </div>

          {assignment?.files && assignment.files.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Assignment Files
              </h2>
              <div className="space-y-2">
                {assignment.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{file.filename}</span>
                    <button
                      onClick={() => handleDownloadFile(file.filename)}
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isStudent && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit Assignment</h2>

            {submission ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold mb-2">
                  ✓ Assignment submitted successfully
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Submitted at: {formatDate(submission.submitted_at)}
                </p>
                {submission.is_late && (
                  <p className="text-sm text-red-600 mb-3 font-semibold">
                    ⚠️ This submission was late
                  </p>
                )}
                {submission.grade ? (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Your Grade</h3>
                      <div className="text-3xl font-bold text-indigo-600">
                        {submission.grade.score.toFixed(1)}/100
                      </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-semibold text-gray-700 mb-2">Feedback:</h4>
                      <div className="bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm text-gray-700">
                        {submission.grade.feedback}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/assignments/${assignmentId}/my-submission/${submission.id}`)}
                      className="mt-3 text-indigo-600 hover:text-indigo-800 underline text-sm"
                    >
                      View Full Details →
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Your submission is being reviewed. Feedback will appear here once grading is complete.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your Solution (Any file type)
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !file || isPastDeadline(assignment?.deadline)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting
                    ? 'Submitting...'
                    : isPastDeadline(assignment?.deadline)
                    ? 'Deadline Passed'
                    : 'Submit Assignment'}
                </button>
              </form>
            )}
          </div>
        )}

        {isFaculty && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => navigate(`/assignments/${assignmentId}/submissions`)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              View All Submissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;

