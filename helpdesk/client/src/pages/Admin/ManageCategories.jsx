import React, { useState, useEffect } from "react";
import api from "../../api";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, agentsRes] = await Promise.all([
          api.get("/api/categories"),
          api.get("/api/users/role/Agent")
        ]);
        setCategories(categoriesRes.data);
        setAgents(agentsRes.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch initial data");
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchCategoryTickets = async (categoryId) => {
    try {
      const response = await api.get(`/api/categories/${categoryId}/tickets`);
      // Sort tickets by priority in descending order
      const sortedTickets = response.data.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setTickets(sortedTickets);
      setError("");
    } catch (err) {
      setError("Failed to fetch category tickets");
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchCategoryTickets(categoryId);
    setSelectedTicket(null);
  };

  const handleAssignTicket = async (ticketId) => {
    if (!selectedAgent) {
      setError("Please select an agent");
      return;
    }
    
    try {
      setAssignmentLoading(true);
      await api.post(`/api/tickets/${ticketId}/assign`, { agentId: selectedAgent });
      fetchCategoryTickets(selectedCategory);
      setError("");
      setSelectedTicket(null);
      setSelectedAgent("");
    } catch (err) {
      setError("Failed to assign ticket");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const getPriorityLabel = (priority) => {
    if (priority >= 8) return ["High", "bg-red-100 text-red-800"];
    if (priority >= 5) return ["Medium", "bg-yellow-100 text-yellow-800"];
    return ["Low", "bg-green-100 text-green-800"];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedCategory === category._id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm block opacity-75">
                    {category.assignedAgents?.length || 0} Assigned Agents
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory 
                  ? `Tickets for ${categories.find(c => c._id === selectedCategory)?.name}`
                  : "Select a Category"}
              </h2>
            </div>

            {error && (
              <div className="m-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
                {error}
              </div>
            )}

            <div className="p-4 space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-gray-700 rounded-lg p-4 shadow-md hover:bg-gray-650 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {ticket.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        {ticket.priority && (
                          <span className={`px-3 py-1 rounded-full text-sm ${getPriorityLabel(ticket.priority)[1]}`}>
                            Priority: {getPriorityLabel(ticket.priority)[0]} ({ticket.priority}/10)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        Created by: {ticket.createdBy?.name || 'Unknown'}
                        {ticket.assignedTo && ` • Assigned to: ${ticket.assignedTo.name}`}
                      </div>
                    </div>

                    <div className="ml-4">
                      {selectedTicket?._id === ticket._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="bg-gray-600 text-white rounded px-3 py-2 text-sm"
                          >
                            <option value="">Select Agent</option>
                            {agents.map((agent) => (
                              <option key={agent._id} value={agent._id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignTicket(ticket._id)}
                            disabled={assignmentLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                          >
                            {assignmentLoading ? "Assigning..." : "Assign"}
                          </button>
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Assign Agent
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {tickets.length === 0 && selectedCategory && (
                <div className="text-center py-12">
                  <div className="text-gray-400">No tickets found for this category</div>
                </div>
              )}

              {!selectedCategory && (
                <div className="text-center py-12">
                  <div className="text-gray-400">Select a category to view tickets</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;