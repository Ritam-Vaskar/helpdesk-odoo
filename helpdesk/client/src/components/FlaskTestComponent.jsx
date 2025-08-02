import React, { useState } from 'react';
import api from '../../api';

const FlaskTestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (endpoint, data, label) => {
    setLoading(prev => ({ ...prev, [label]: true }));
    try {
      const response = await api.post(endpoint, data);
      setTestResults(prev => ({
        ...prev,
        [label]: { success: true, data: response.data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [label]: { success: false, error: error.response?.data || error.message }
      }));
    }
    setLoading(prev => ({ ...prev, [label]: false }));
  };

  const seedAgentData = async () => {
    setLoading(prev => ({ ...prev, seed: true }));
    try {
      const response = await api.post('/api/tickets/seed-agents');
      setTestResults(prev => ({
        ...prev,
        seed: { success: true, data: response.data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        seed: { success: false, error: error.response?.data || error.message }
      }));
    }
    setLoading(prev => ({ ...prev, seed: false }));
  };

  const testPriorityUsers = () => {
    // We need a ticket ID - this would need to be dynamic in real usage
    testEndpoint('/api/tickets/TICKET_ID_HERE/priority-users', {}, 'priorityUsers');
  };

  const testSimilarSearch = () => {
    testEndpoint('/api/tickets/search/enhanced', {
      query: 'laptop battery not charging',
      maxResults: 5
    }, 'similarSearch');
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Flask Integration Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={seedAgentData}
          disabled={loading.seed}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading.seed ? 'Seeding...' : 'Seed Agent Data'}
        </button>

        <button
          onClick={testSimilarSearch}
          disabled={loading.similarSearch}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading.similarSearch ? 'Testing...' : 'Test Similar Search'}
        </button>

        <button
          onClick={testPriorityUsers}
          disabled={loading.priorityUsers}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading.priorityUsers ? 'Testing...' : 'Test Priority Users'}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {Object.entries(testResults).map(([key, result]) => (
          <div key={key} className="bg-gray-700 p-4 rounded">
            <h4 className="text-lg font-medium text-white mb-2">{key}</h4>
            <pre className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlaskTestComponent;
