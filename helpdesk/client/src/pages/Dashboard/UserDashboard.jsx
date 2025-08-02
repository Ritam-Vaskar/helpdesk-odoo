import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const UserDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [allTickets, setAllTickets] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(() => localStorage.getItem('selectedStatus') || null);

  useEffect(() => {
    localStorage.setItem('selectedStatus', selectedStatus);
    if (selectedStatus) {
      setRecentTickets(allTickets.filter(ticket => ticket.status === selectedStatus));
    } else {
      setRecentTickets(allTickets);
    }
  }, [selectedStatus, allTickets]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.get('/api/tickets/stats'),
          api.get('/api/tickets/recent')
        ]);
        setStats(statsRes.data);
        setAllTickets(ticketsRes.data);
        setRecentTickets(selectedStatus ? 
          ticketsRes.data.filter(ticket => ticket.status === selectedStatus) : 
          ticketsRes.data
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedStatus) {
      setRecentTickets(recentTickets.filter(ticket => ticket.status === selectedStatus));
    } else {
      setRecentTickets(recentTickets);
    }
  }, [selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-500/20 border-b-purple-500 animate-spin animate-reverse mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h3>
          <p className="text-gray-400">Fetching your ticket data...</p>
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400 bg-clip-text text-transparent">
                My Dashboard
              </h1>
              <p className="text-gray-400 text-lg">
                Track your support tickets and manage your requests
              </p>
            </div>
            
            <Link 
              to="/tickets/create" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl flex items-center gap-3"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">Create New Ticket</span>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Tickets */}
            <div className="bg-gradient-to-br from-gray-700/50 via-gray-600/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-gray-300 text-sm font-medium mb-2">Total Tickets</div>
              <div className="text-4xl font-bold text-white">{stats.total}</div>
              <div className="mt-4 h-2 bg-gray-600/50 rounded-full">
                <div className="h-2 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            {/* Open Tickets */}
            <div 
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedStatus === 'Open' 
                  ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 ring-4 ring-amber-300/50 shadow-3xl' 
                  : 'bg-gradient-to-br from-gray-700/50 via-gray-600/50 to-gray-700/50 hover:from-amber-600/20 hover:via-yellow-600/20 hover:to-orange-600/20'
              } backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-2xl`}
              onClick={() => setSelectedStatus(selectedStatus === 'Open' ? null : 'Open')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {selectedStatus === 'Open' && (
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-white/80 text-sm font-medium mb-2">Open Tickets</div>
              <div className="text-4xl font-bold text-white">{stats.open}</div>
              <div className="mt-4 h-2 bg-white/20 rounded-full">
                <div className="h-2 bg-white rounded-full transition-all duration-500" style={{width: `${Math.min((stats.open / Math.max(stats.total, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>

            {/* In Progress Tickets */}
            <div 
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedStatus === 'In Progress' 
                  ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 ring-4 ring-blue-300/50 shadow-3xl' 
                  : 'bg-gradient-to-br from-gray-700/50 via-gray-600/50 to-gray-700/50 hover:from-blue-600/20 hover:via-indigo-600/20 hover:to-purple-600/20'
              } backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-2xl`}
              onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? null : 'In Progress')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {selectedStatus === 'In Progress' && (
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-white/80 text-sm font-medium mb-2">In Progress</div>
              <div className="text-4xl font-bold text-white">{stats.inProgress}</div>
              <div className="mt-4 h-2 bg-white/20 rounded-full">
                <div className="h-2 bg-white rounded-full transition-all duration-500" style={{width: `${Math.min((stats.inProgress / Math.max(stats.total, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>

            {/* Resolved Tickets */}
            <div 
              className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedStatus === 'Resolved' 
                  ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 ring-4 ring-emerald-300/50 shadow-3xl' 
                  : 'bg-gradient-to-br from-gray-700/50 via-gray-600/50 to-gray-700/50 hover:from-emerald-600/20 hover:via-green-600/20 hover:to-teal-600/20'
              } backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 shadow-2xl`}
              onClick={() => setSelectedStatus(selectedStatus === 'Resolved' ? null : 'Resolved')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {selectedStatus === 'Resolved' && (
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-white/80 text-sm font-medium mb-2">Resolved</div>
              <div className="text-4xl font-bold text-white">{stats.resolved}</div>
              <div className="mt-4 h-2 bg-white/20 rounded-full">
                <div className="h-2 bg-white rounded-full transition-all duration-500" style={{width: `${Math.min((stats.resolved / Math.max(stats.total, 1)) * 100, 100)}%`}}></div>
              </div>
            </div>
          </div>

          {/* Filter Indicator */}
          {selectedStatus && (
            <div className="flex justify-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl text-blue-300 font-medium">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Showing: {selectedStatus} tickets
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className="ml-3 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Recent Tickets */}
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/30 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 border-b border-gray-600/50">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recent Tickets
              </h2>
            </div>
            
            <div className="divide-y divide-gray-600/50">
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="group block p-6 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-3 group-hover:bg-blue-400 transition-colors duration-300"></div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 mb-2">
                              {ticket.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed mb-3">
                              {ticket.description.substring(0, 150)}
                              {ticket.description.length > 150 && "..."}
                            </p>
                            <div className="flex items-center text-sm text-gray-400">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${
                          ticket.status === 'Open' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {ticket.status}
                        </span>
                        
                        <div className="flex items-center text-gray-400 group-hover:text-blue-400 transition-colors duration-300">
                          <span className="text-sm mr-2">View Details</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-gray-700/30 to-gray-600/20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">No tickets found</h3>
                  <p className="text-gray-400 text-lg mb-6">
                    {selectedStatus ? `No ${selectedStatus.toLowerCase()} tickets found.` : 'Create your first ticket to get started!'}
                  </p>
                  <Link 
                    to="/tickets/create"
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Your First Ticket
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;