import React, { useState } from 'react';
import api from '../api';

const AITestComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAIRecommendations = async () => {
    setLoading(true);
    setError('');
    setTestResults(null);

    try {
      const testQuestion = "How to fix laptop battery not charging properly?";
      
      console.log('Testing AI recommendations with question:', testQuestion);
      
      const response = await api.post('/api/users/priority-analysis', {
        question: testQuestion,
        top_n: 5
      });

      console.log('AI Response:', response.data);
      setTestResults(response.data);

    } catch (err) {
      console.error('Test failed:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testExpertiseEndpoint = async () => {
    setLoading(true);
    setError('');
    setTestResults(null);

    try {
      const response = await api.post('/api/users/expertise', {
        question: "How to fix laptop battery not charging properly?",
        top_n: 5
      });

      console.log('Expertise Response:', response.data);
      setTestResults(response.data);

    } catch (err) {
      console.error('Expertise test failed:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">AI System Test</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testAIRecommendations}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test AI Recommendations'}
          </button>
          
          <button
            onClick={testExpertiseEndpoint}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Expertise Endpoint'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-medium mb-2">Error:</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {testResults && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Test Results:</h3>
            <pre className="text-gray-300 text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITestComponent;
