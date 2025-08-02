import React, { useEffect, useState } from 'react';
import api from '../../api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const [usersResponse, agentsResponse] = await Promise.all([
        api.get('/api/users/role/User'),
        api.get('/api/users/role/Agent')
      ]);
      setUsers(usersResponse.data);
      setAgents(agentsResponse.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToAgent = async (userId) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role: 'Agent' });
      fetchUsers(); // Refresh the lists
    } catch (err) {
      setError(err.message);
    }
  };

  const demoteToUser = async (userId) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role: 'User' });
      fetchUsers(); // Refresh the lists
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers(); // Refresh the lists
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center">Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Users Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => promoteToAgent(user._id)}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                >
                  Promote to Agent
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-gray-400">No users found</p>
          )}
        </div>
      </div>

      {/* Agents Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Agents</h2>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-gray-400">{agent.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => demoteToUser(agent._id)}
                  className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                >
                  Demote to User
                </button>
                <button
                  onClick={() => deleteUser(agent._id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {agents.length === 0 && (
            <p className="text-gray-400">No agents found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;