import React, { useState } from 'react';
import { resourcesAPI } from '../api/resources';

const SummarizeFile = () => {
  const [file, setFile] = useState(null);
  const [summaryType, setSummaryType] = useState('short');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      if (!['pdf', 'ppt', 'pptx'].includes(fileExt)) {
        setError('Only PDF and PPT/PPTX files are allowed');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setSummary('');
    setLoading(true);

    try {
      const response = await resourcesAPI.summarizeLocalFile(file, summaryType);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Summarize Your File</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSummarize} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (PDF or PPT/PPTX) *
            </label>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, PPT, PPTX
            </p>
            {file && (
              <p className="mt-2 text-sm text-indigo-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Type
            </label>
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="short"
                  checked={summaryType === 'short'}
                  onChange={(e) => setSummaryType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Short</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medium"
                  checked={summaryType === 'medium'}
                  onChange={(e) => setSummaryType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="long"
                  checked={summaryType === 'long'}
                  onChange={(e) => setSummaryType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Long</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Generating Summary...' : 'Generate Summary'}
          </button>
        </form>
      </div>

      {summary && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarizeFile;

