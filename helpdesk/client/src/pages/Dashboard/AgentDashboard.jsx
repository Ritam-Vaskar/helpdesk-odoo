import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import aiService from "../../services/aiService";

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/api/tickets");
      setTickets(response.data);
      setFilteredTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatus) {
      setFilteredTickets(tickets.filter(ticket => ticket.status === selectedStatus));
    } else {
      setFilteredTickets(tickets);
    }
  }, [selectedStatus, tickets]);

  const getStatusCount = (status) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await api.put(`/api/tickets/${ticketId}`, {
        status: newStatus,
        comment: comment
      });
      
      // Update the tickets list with the updated ticket
      setTickets(tickets.map(ticket =>
        ticket._id === ticketId ? response.data : ticket
      ));
      
      // Reset form
      setSelectedTicket(null);
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async (ticketId) => {
    try {
      const response = await api.put(`/api/tickets/${ticketId}`, {
        comment: comment
      });
      // Update the tickets list with the updated ticket
      setTickets(tickets.map(ticket =>
        ticket._id === ticketId ? response.data : ticket
      ));
      // Reset form
      setSelectedTicket(null);
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  const getTicketSummary = async (ticketId, description) => {
    try {
      setSummaryLoading(prev => ({ ...prev, [ticketId]: true }));
      const summary = await aiService.getSummary(description);
      setSummaries(prev => ({ ...prev, [ticketId]: summary }));
    } catch (error) {
      console.error('Error getting summary:', error);
    } finally {
      setSummaryLoading(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500/20 border-b-purple-500 animate-spin animate-reverse mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h3>
          <p className="text-gray-400">Fetching your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-teal-600/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400 bg-clip-text text-transparent">
              Agent Dashboard
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Manage and track your assigned tickets with real-time updates and seamless workflow
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Open' ? null : 'Open')}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl p-6 shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl ${
                selectedStatus === 'Open' 
                  ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 ring-4 ring-amber-300/50' 
                  : 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 hover:from-amber-600/20 hover:via-yellow-600/20 hover:to-orange-600/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-extrabold text-white mb-1">{getStatusCount('Open')}</p>
                    <p className="text-white/80 text-sm font-medium">Open Tickets</p>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-700 ease-out" 
                    style={{width: `${Math.min((getStatusCount('Open') / Math.max(tickets.length, 1)) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? null : 'In Progress')}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl p-6 shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl ${
                selectedStatus === 'In Progress' 
                  ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 ring-4 ring-blue-300/50' 
                  : 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 hover:from-blue-600/20 hover:via-indigo-600/20 hover:to-purple-600/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-extrabold text-white mb-1">{getStatusCount('In Progress')}</p>
                    <p className="text-white/80 text-sm font-medium">In Progress</p>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-700 ease-out" 
                    style={{width: `${Math.min((getStatusCount('In Progress') / Math.max(tickets.length, 1)) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Resolved' ? null : 'Resolved')}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl p-6 shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl ${
                selectedStatus === 'Resolved' 
                  ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 ring-4 ring-emerald-300/50' 
                  : 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 hover:from-emerald-600/20 hover:via-green-600/20 hover:to-teal-600/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-extrabold text-white mb-1">{getStatusCount('Resolved')}</p>
                    <p className="text-white/80 text-sm font-medium">Resolved</p>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-700 ease-out" 
                    style={{width: `${Math.min((getStatusCount('Resolved') / Math.max(tickets.length, 1)) * 100, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-sm border border-red-500/30 text-red-200 px-6 py-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Tickets Section */}
          <div className="space-y-6">
            {selectedStatus && (
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-300 font-medium">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtered by: {selectedStatus}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="group bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/30 overflow-hidden hover:shadow-3xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3 flex items-center group-hover:text-blue-300 transition-colors duration-300">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-300 transition-colors duration-300"></div>
                          {ticket.title}
                        </h3>
                        <p className="text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Created by: <span className="text-white font-medium ml-1">{ticket.createdBy?.name || "Unknown"}</span>
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl p-5 mb-6 border border-gray-700/50">
                      <p className="text-gray-300 leading-relaxed">{ticket.description}</p>
                    </div>

                    {selectedTicket?._id === ticket._id ? (
                      <div className="space-y-6 border-t border-gray-600/50 pt-6 bg-gray-800/30 rounded-xl p-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-3">Add Comment or Status Update</label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment about this status change or provide updates..."
                            className="w-full px-5 py-4 bg-gray-900/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                            rows="4"
                          />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleStatusUpdate(ticket._id, "In Progress")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={ticket.status === "In Progress"}
                          >
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Mark In Progress
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(ticket._id, "Resolved")}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={ticket.status === "Resolved"}
                          >
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleAddComment(ticket._id)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Add Comment
                          </button>
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Update Status
                      </button>
                    )}

                    {/* AI Summary Section */}
                    <div className="mt-4 border-t border-gray-600/30 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center">
                          <span className="mr-2">🤖</span> AI Summary
                        </h4>
                        {!summaries[ticket._id] && (
                          <button
                            onClick={() => getTicketSummary(ticket._id, ticket.description)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full transition-colors"
                            disabled={summaryLoading[ticket._id]}
                          >
                            {summaryLoading[ticket._id] ? (
                              <span className="flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Analyzing...
                              </span>
                            ) : (
                              "Generate Summary"
                            )}
                          </button>
                        )}
                      </div>
                      
                      {summaries[ticket._id] && (
                        <div className="bg-gray-800/50 rounded-lg p-4 mt-2">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {summaries[ticket._id]}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Comments Section */}
                    {ticket.comments && ticket.comments.length > 0 && (
                      <div className="mt-6 border-t border-gray-600/50 pt-6">
                        <h4 className="text-lg font-bold text-gray-300 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Comments ({ticket.comments.length})
                        </h4>
                        <div className="space-y-4">
                          {ticket.comments.map((comment, index) => (
                            <div key={index} className="bg-gray-900/50 rounded-xl p-4 border-l-4 border-blue-500">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white text-xs font-bold">
                                    {comment.author?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <span className="text-blue-400 font-semibold">{comment.author?.name || 'Unknown'}</span>
                              </div>
                              <p className="text-gray-300 leading-relaxed ml-11">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="text-center py-20 bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-600">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">No tickets assigned</h3>
                  <p className="text-gray-400 text-lg">You will see tickets here once they are assigned to you by an admin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;