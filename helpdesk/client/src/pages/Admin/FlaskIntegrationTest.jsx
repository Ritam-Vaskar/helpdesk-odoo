import React, { useState, useEffect } from 'react';
import api from '../../api';
import UserExpertiseTest from '../../components/UserExpertiseTest';
import FlaskTestComponent from '../../components/FlaskTestComponent';

const FlaskIntegrationTest = () => {
  const [agents, setAgents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, ticketsRes] = await Promise.all([
          api.get('/api/users/role/Agent'),
          api.get('/api/tickets')
        ]);
        setAgents(agentsRes.data);
        setTickets(ticketsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">Flask Integration Testing</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">System Overview</h3>
          <div className="space-y-2 text-gray-300">
            <p>Total Agents: <span className="text-blue-400">{agents.length}</span></p>
            <p>Total Tickets: <span className="text-green-400">{tickets.length}</span></p>
            <p>Resolved Tickets: <span className="text-yellow-400">
              {tickets.filter(t => t.status === 'Resolved').length}
            </span></p>
          </div>
          
          <div className="mt-4">
            <h4 className="text-md font-medium text-white mb-2">Agents:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {agents.map(agent => (
                <div key={agent._id} className="text-sm text-gray-400">
                  {agent.name} - {agent.email}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  const response = await api.post('/api/tickets/seed-agents');
                  alert(`Success: ${response.data.message}`);
                } catch (error) {
                  alert(`Error: ${error.response?.data?.message || error.message}`);
                }
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Seed Agent Expertise Data
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Refresh Data
            </button>
          </div>
          
          <div className="mt-4">
            <h4 className="text-md font-medium text-white mb-2">Endpoints Available:</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>POST /api/users/expertise</div>
              <div>POST /api/users/priority-analysis</div>
              <div>POST /api/tickets/search/similar</div>
              <div>POST /api/tickets/search/enhanced</div>
              <div>GET /api/tickets/:id/priority-users</div>
              <div>GET /api/tickets/:id/summary</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Components */}
      <div className="mt-6 space-y-6">
        <UserExpertiseTest />
        <FlaskTestComponent />
      </div>

      {/* Raw Data Display */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4 text-white">Sample Flask Request Format</h3>
        <pre className="text-sm text-green-400 bg-gray-900 p-4 rounded overflow-x-auto">
{`{
  "question": "How to fix laptop battery not charging properly?",
  "top_n": 5,
  "users": [
    {
      "userId": "agent_mongodb_id",
      "expertise_domain": "Hardware Troubleshooting",
      "Solved queries": [
        "How to solve laptop problems?",
        "How to fix laptop screen issues?",
        "How to troubleshoot laptop battery problems?",
        "How to clean laptop keyboard properly?",
        "How to upgrade laptop RAM?"
      ]
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default FlaskIntegrationTest;
