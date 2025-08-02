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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [priorityUsers, setPriorityUsers] = useState([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [ticketSummary, setTicketSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Clean markdown formatting from text
  const cleanMarkdown = (text) => {
    if (!text) return text;
    
    return text
      // Remove markdown headers
      .replace(/^#+\s*/gm, '')
      // Remove bold/italic formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
      .replace(/\*([^*]+)\*/g, '$1')      // *italic* -> italic
      .replace(/__([^_]+)__/g, '$1')      // __bold__ -> bold
      .replace(/_([^_]+)_/g, '$1')        // _italic_ -> italic
      // Remove bullet points and list formatting
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove code blocks
      .replace(/```[^`]*```/gs, '')
      .replace(/`([^`]+)`/g, '$1')
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

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
    
    const initializeData = async () => {
      await fetchAgents();
      // Optionally seed agent data for development
      try {
        await api.post('/api/tickets/seed-agents');
        console.log('Agent data seeded successfully');
      } catch (err) {
        console.log('Agent data seeding failed or already exists:', err.message);
      }
    };
    
    initializeData();
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
    setSelectedTicket(null);
    setShowAIAssistant(false);
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

  // AI Assistant Functions
  const getPriorityUsers = async (ticket) => {
    try {
      setPriorityLoading(true);
      const response = await api.post('/api/users/priority-analysis', {
        question: `${ticket.title}: ${ticket.description}`,
        top_n: 5
      });

      console.log('AI Priority Response:', response.data);

      if (response.data && response.data.flaskResponse && response.data.flaskResponse.priority_users) {
        // Map Flask response to include actual agent names
        const mappedUsers = response.data.flaskResponse.priority_users.map(user => {
          // Find the actual agent by userId
          const agent = agents.find(a => a._id === user.userId);
          return {
            ...user,
            name: agent ? agent.name : `Agent ${user.userId}`,
            email: agent ? agent.email : 'unknown@email.com',
            reasoning: cleanMarkdown(user.reasoning), // Clean markdown from reasoning
            matching_queries: user.matching_queries?.map(q => cleanMarkdown(q)) || [], // Clean markdown from queries
            agentId: user.userId // Keep original userId for assignment
          };
        });

        setPriorityUsers({ 
          ...response.data.flaskResponse, 
          priority_users: mappedUsers 
        });
      } else {
        console.error('Invalid AI response format');
        setPriorityUsers({ priority_users: [] });
      }
    } catch (err) {
      console.error('Error getting AI recommendations:', err);
      setError("Failed to get AI recommendations: " + (err.response?.data?.message || err.message));
      setPriorityUsers({ priority_users: [] });
    } finally {
      setPriorityLoading(false);
    }
  };

  const getTicketSummary = async (ticketId) => {
    try {
      setSummaryLoading(true);
      const response = await api.get(`/api/tickets/${ticketId}/summary`);
      setTicketSummary(response.data.summary);
    } catch (err) {
      setError("Failed to get ticket summary");
      setTicketSummary("");
    } finally {
      setSummaryLoading(false);
    }
  };

  const searchSimilarComplaints = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await api.post('/api/tickets/search/enhanced', {
        query: searchQuery,
        maxResults: 10
      });
      setSearchResults(response.data.similar_complaints || []);
    } catch (err) {
      setError("Failed to search similar complaints");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setShowAIAssistant(true);
    getPriorityUsers(ticket);
    getTicketSummary(ticket._id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return "bg-red-100 text-red-800";
    if (priority >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getPriorityText = (priority) => {
    if (priority >= 8) return "High";
    if (priority >= 5) return "Medium";
    return "Low";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">AI-Powered Agent Management</h2>
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          {showAIAssistant ? "Hide AI Assistant" : "Show AI Assistant"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* AI Search Section */}
      {showAIAssistant && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4 text-white">🤖 AI Complaint Search</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for similar complaints (e.g., 'fridge issue', 'delivery problem')..."
              className="flex-1 bg-gray-700 text-white p-2 rounded border border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && searchSimilarComplaints()}
            />
            <button
              onClick={searchSimilarComplaints}
              disabled={searchLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {searchLoading ? "Searching..." : "AI Search"}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300">Similar Complaints Found:</h4>
              {searchResults.map((result, idx) => (
                <div key={idx} className="bg-gray-700 p-2 rounded text-sm">
                  <div className="text-white">{result.complaint}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    Similarity: {(result.similarity_score * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Agent List */}
        <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Agents</h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent._id}
                onClick={() => handleAgentSelect(agent._id)}
                className={`w-full text-left p-2 rounded transition-colors ${
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

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {selectedTicket && showAIAssistant ? (
            /* AI Assistant Panel */
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedTicket.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{selectedTicket.description}</p>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedTicket.priority || 1)}`}>
                        Priority: {getPriorityText(selectedTicket.priority || 1)} ({selectedTicket.priority || 1}/10)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicket(null);
                      setShowAIAssistant(false);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2 text-white">🧠 AI Summary</h4>
                {summaryLoading ? (
                  <div className="animate-pulse bg-gray-700 h-20 rounded"></div>
                ) : (
                  <p className="text-gray-300 bg-gray-700 p-3 rounded">{ticketSummary || "No summary available"}</p>
                )}
              </div>

              {/* Priority Users */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-4 text-white">🎯 AI Recommended Agents</h4>
                {priorityLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1,2,3].map(i => <div key={i} className="bg-gray-700 h-16 rounded"></div>)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {priorityUsers?.priority_users?.length > 0 ? (
                      priorityUsers.priority_users.map((user, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-700 p-3 rounded hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400 mb-1">{user.email}</div>
                              <div className="text-sm text-gray-300">{user.reasoning}</div>
                              <div className="flex gap-4 mt-2">
                                <div className="text-xs text-blue-400">
                                  Score: {user.relevance_score}/10
                                </div>
                                <div className="text-xs text-green-400">
                                  {user.total_solved_queries} queries solved
                                </div>
                              </div>
                              {user.matching_queries && user.matching_queries.length > 0 && (
                                <div className="text-xs text-yellow-400 mt-1">
                                  Similar: "{user.matching_queries[0]}"
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => handleAssignTicket(selectedTicket._id, user.agentId)}
                                disabled={assignmentLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                              >
                                {assignmentLoading ? "Assigning..." : "Assign"}
                              </button>
                              {idx === 0 && user.relevance_score > 0 && (
                                <div className="text-xs text-green-500 mt-1 text-center">
                                  Top Match ⚡
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No AI recommendations available</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Make sure the Flask AI server is running
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Ticket List */
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{ticket.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{ticket.description}</p>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority || 1)}`}>
                          Priority: {getPriorityText(ticket.priority || 1)} ({ticket.priority || 1}/10)
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Assigned to: {ticket.assignedTo?.name || "Unassigned"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTicketSelect(ticket)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                      >
                        🤖 AI Assist
                      </button>
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && selectedAgent && (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  <p className="text-gray-400">No tickets assigned to this agent.</p>
                </div>
              )}
              {!selectedAgent && (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  <p className="text-gray-400">Select an agent to view their tickets.</p>
                </div>
              )}
            </div>
          )}

          {/* Manual Assignment Modal */}
          {selectedTicket && !showAIAssistant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-lg font-medium mb-4 text-white">Assign Ticket: {selectedTicket.title}</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {agents.map((agent) => (
                    <button
                      key={agent._id}
                      onClick={() => handleAssignTicket(selectedTicket._id, agent._id)}
                      disabled={assignmentLoading}
                      className={`w-full text-left p-3 rounded transition-colors ${
                        selectedTicket.assignedTo?._id === agent._id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      } disabled:opacity-50`}
                    >
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm opacity-75">{agent.email}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageByAgent;
