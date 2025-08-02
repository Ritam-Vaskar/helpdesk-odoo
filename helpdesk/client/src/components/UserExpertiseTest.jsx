import React, { useState } from 'react';
import api from '../../api';

const UserExpertiseTest = () => {
  const [question, setQuestion] = useState('How to fix laptop battery not charging properly?');
  const [topN, setTopN] = useState(5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testExpertiseFormatting = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/users/expertise', {
        question: question,
        top_n: topN
      });
      setResults({
        type: 'formatting',
        data: response.data
      });
    } catch (err) {
      setError(`Formatting test failed: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  const testFlaskIntegration = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/users/priority-analysis', {
        question: question,
        top_n: topN
      });
      setResults({
        type: 'flask-integration',
        data: response.data
      });
    } catch (err) {
      setError(`Flask integration test failed: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">User Expertise & Flask Integration Test</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Question:
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
            placeholder="Enter your question here..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Top N Results:
          </label>
          <input
            type="number"
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value))}
            className="w-32 bg-gray-700 text-white p-2 rounded border border-gray-600"
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testExpertiseFormatting}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Data Formatting'}
        </button>
        
        <button
          onClick={testFlaskIntegration}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Flask Integration'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-gray-700 p-4 rounded">
          <h4 className="text-lg font-medium text-white mb-2">
            Results ({results.type}):
          </h4>
          <pre className="text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UserExpertiseTest;
