import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
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

    fetchTickets();
  }, []);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300 text-lg">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 max-w-md">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-300">Error Loading Dashboard</h3>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprehensive overview of system activity, user management, and ticket analytics
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Stats and Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Open Tickets</h3>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-white mb-2">{getStatusCount('Open')}</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((getStatusCount('Open') / tickets.length) * 100, 100)}%`}}></div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">In Progress</h3>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-white mb-2">{getStatusCount('In Progress')}</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((getStatusCount('In Progress') / tickets.length) * 100, 100)}%`}}></div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Resolved</h3>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-white mb-2">{getStatusCount('Resolved')}</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((getStatusCount('Resolved') / tickets.length) * 100, 100)}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-600/50">
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ticket Distribution
            </h3>
            <div className="w-full h-64 flex items-center justify-center">
              <Pie
                ref={chartRef}
                data={{
                    labels: ['Open', 'In Progress', 'Resolved'],
                    datasets: [
                      {
                        data: [
                          getStatusCount('Open'),
                          getStatusCount('In Progress'),
                          getStatusCount('Resolved')
                        ],
                        backgroundColor: [
                          'rgba(245, 158, 11, 0.9)',  // amber for Open
                          'rgba(99, 102, 241, 0.9)',  // indigo for In Progress
                          'rgba(16, 185, 129, 0.9)',  // emerald for Resolved
                        ],
                        borderColor: [
                          'rgba(245, 158, 11, 1)',
                          'rgba(99, 102, 241, 1)',
                          'rgba(16, 185, 129, 1)',
                        ],
                        borderWidth: 3,
                        hoverOffset: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: 'white',
                          font: {
                            size: 13,
                            weight: 'bold'
                          },
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                      }
                    }
                  }}
                />
              </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/admin/manage-users" className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Manage Users & Agents
            </span>
          </Link>
          <Link to="/admin/manage-categories" className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Manage Categories
            </span>
          </Link>
          <Link to="/admin/manage-by-agent" className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <span className="relative z-10 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Manage by Agent
            </span>
          </Link>
        </div>

        {/* Tickets Section */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl shadow-2xl border border-gray-600/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 border-b border-gray-600/50">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              All Tickets
              {selectedStatus && (
                <span className="ml-4 text-lg font-normal text-gray-300">
                  - Filtered by: <span className="text-blue-400 font-semibold">{selectedStatus}</span>
                </span>
              )}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {filteredTickets.map((ticket) => (
                <div key={ticket._id} className="bg-gradient-to-r from-gray-700/50 to-gray-600/30 backdrop-blur-sm rounded-xl border border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-white mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                          </svg>
                          {ticket.title}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Created by: <span className="text-white font-medium ml-1">{ticket.createdBy?.name || 'Unknown'}</span>
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)} shadow-sm`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-300 leading-relaxed">{ticket.description}</p>
                    </div>

                    {selectedTicket?._id === ticket._id ? (
                      <div className="space-y-4 border-t border-gray-600/50 pt-6 bg-gray-800/30 rounded-lg p-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Add Comment</label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment about this status change..."
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            rows="4"
                          />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleStatusUpdate(ticket._id, "In Progress")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={ticket.status === "In Progress"}
                          >
                            Mark In Progress
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(ticket._id, "Resolved")}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={ticket.status === "Resolved"}
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          Update Status
                        </button>
                        <Link 
                          to={`/tickets/${ticket._id}`} 
                          className="inline-flex items-center text-blue-400 hover:text-white font-semibold px-6 py-3 rounded-lg border-2 border-blue-400 hover:border-blue-500 hover:bg-blue-500 transition-all duration-300 transform hover:scale-105"
                        >
                          <span>View Details</span>
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    )}

                    {ticket.comments && ticket.comments.length > 0 && (
                      <div className="mt-6 border-t border-gray-600/50 pt-4">
                        <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Comments ({ticket.comments.length})
                        </h4>
                        <div className="space-y-3">
                          {ticket.comments.map((comment, index) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-blue-500">
                              <div className="flex items-center mb-1">
                                <span className="text-blue-400 font-semibold text-sm">{comment.author?.name}</span>
                                <span className="text-gray-500 text-xs ml-2">•</span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-br from-gray-700/30 to-gray-600/20 rounded-xl border-2 border-dashed border-gray-600">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No tickets available</h3>
                  <p className="text-gray-400">Tickets will appear here once they are created.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;