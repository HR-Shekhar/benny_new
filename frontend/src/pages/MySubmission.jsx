import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentsAPI } from '../api/assignments';

const MySubmission = () => {
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    fetchData();
  }, [assignmentId, submissionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [submissionRes, assignmentRes] = await Promise.all([
        assignmentsAPI.getSubmission(assignmentId, submissionId),
        assignmentsAPI.getAssignment(assignmentId),
      ]);
      setSubmission(submissionRes.data);
      setAssignment(assignmentRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async () => {
    try {
      await assignmentsAPI.downloadSubmissionFile(assignmentId, submissionId);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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

  if (error && !submission) {
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
          onClick={() => navigate(`/assignments/${assignmentId}`)}
          className="mb-4 text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Assignment
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {assignment?.title || 'My Submission'}
          </h1>

          <div className="space-y-2 mb-4">
            <div>
              <span className="font-semibold">Submitted At:</span>{' '}
              {formatDate(submission?.submitted_at)}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  submission?.status === 'graded'
                    ? 'bg-green-100 text-green-800'
                    : submission?.is_late
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {submission?.status}
                {submission?.is_late && ' (Late)'}
              </span>
            </div>
            {submission?.file && (
              <div>
                <span className="font-semibold">File:</span>{' '}
                {submission.file.filename}
                <button
                  onClick={handleDownloadFile}
                  className="ml-4 text-indigo-600 hover:text-indigo-800 underline"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {submission?.grade ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Grading Results</h2>

            <div className="mb-6">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {submission.grade.score.toFixed(1)}/100
              </div>
              <div className="text-sm text-gray-500">
                Graded at: {formatDate(submission.grade.graded_at)}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Feedback:</h3>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
                {submission.grade.feedback}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Your submission is being reviewed.</p>
              <p className="text-sm">Feedback will appear here once grading is complete.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmission;

