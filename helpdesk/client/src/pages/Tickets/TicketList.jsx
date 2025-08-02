import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
  });

    const fetchTickets = async () => {
      try {
      setLoading(true);
      const { data } = await api.get("/api/tickets");
        setTickets(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filters.status === "all" || ticket.status === filters.status;
    const matchesCategory = filters.category === "all" || 
      (ticket.category && ticket.category._id === filters.category);
    const matchesSearch = 
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Tickets</h2>
        <Link
          to="/tickets/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Ticket
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-[#1C1C1C] rounded-lg shadow-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <select
                className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="all">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="General">General</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="block p-6 hover:bg-[#252525] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white">{ticket.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{ticket.description.substring(0, 150)}...</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Category: {ticket.category?.name || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              {filters.search || filters.status !== "all" || filters.category !== "all" ? (
                <>
                  <p>No tickets match your filters.</p>
                  <button
                    onClick={() => setFilters({ status: "all", category: "all", search: "" })}
                    className="mt-2 text-blue-400 hover:text-blue-300"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p>You haven't created any tickets yet.</p>
                  <Link to="/tickets/create" className="mt-2 text-blue-400 hover:text-blue-300 inline-block">
                    Create your first ticket
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketList;
