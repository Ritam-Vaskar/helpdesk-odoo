import React, { useState, useEffect } from "react";
import api from "../../api";

const ManageByAgent = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/api/users/role/Agent");
        setAgents(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch agents");
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const fetchAgentTickets = async (agentId) => {
    try {
      const response = await api.get(`/api/tickets/agent/${agentId}`);
      setTickets(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch agent tickets");
    }
  };

  const handleAgentSelect = (agentId) => {
    setSelectedAgent(agentId);
    fetchAgentTickets(agentId);
  };

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      setAssignmentLoading(true);
      await api.post(`/api/tickets/${ticketId}/assign`, { agentId });
      fetchAgentTickets(selectedAgent);
      setError("");
    } catch (err) {
      setError("Failed to assign ticket");
    } finally {
      setAssignmentLoading(false);
      setSelectedTicket(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-white">Manage by Agent</h2>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Agent List */}
        <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Agents</h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent._id}
                onClick={() => handleAgentSelect(agent._id)}
                className={`w-full text-left p-2 rounded ${
                  selectedAgent === agent._id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm opacity-75">{agent.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="md:col-span-3">
          {selectedTicket ? (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-4">Assign Ticket: {selectedTicket.title}</h3>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <button
                    key={agent._id}
                    onClick={() => handleAssignTicket(selectedTicket._id, agent._id)}
                    disabled={assignmentLoading}
                    className={`w-full text-left p-3 rounded ${
                      selectedTicket.assignedTo === agent._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm opacity-75">{agent.email}</div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-500 p-2 rounded"
                >
                  Cancel Assignment
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{ticket.title}</h3>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Reassign
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{ticket.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className={`px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className="text-gray-400">
                      Assigned to: {ticket.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  <p className="text-gray-400">No tickets assigned to this agent.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageByAgent;
