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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-white">User Dashboard</h1>
      <div className="flex gap-4">
          <Link 
            to="/tickets/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1C1C1C] p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="text-gray-400">Total Tickets</div>
          <div className="text-3xl font-bold mt-2 text-white">{stats.total}</div>
        </div>
        <div className="bg-[#1C1C1C] p-6 rounded-lg shadow-lg border border-gray-700 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'Open' ? null : 'Open')}>
          <div className="text-gray-400">Open Tickets</div>
          <div className="text-3xl font-bold mt-2 text-yellow-400">{stats.open}</div>
        </div>
        <div className="bg-[#1C1C1C] p-6 rounded-lg shadow-lg border border-gray-700 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? null : 'In Progress')}>
          <div className="text-gray-400">In Progress</div>
          <div className="text-3xl font-bold mt-2 text-blue-400">{stats.inProgress}</div>
        </div>
        <div className="bg-[#1C1C1C] p-6 rounded-lg shadow-lg border border-gray-700 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'Resolved' ? null : 'Resolved')}>
          <div className="text-gray-400">Resolved</div>
          <div className="text-3xl font-bold mt-2 text-green-400">{stats.resolved}</div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-[#1C1C1C] rounded-lg shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Tickets</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {recentTickets.length > 0 ? (
            recentTickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="block p-6 hover:bg-[#252525] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">{ticket.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{ticket.description.substring(0, 100)}...</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    ticket.status === 'Open' ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-700' :
                    ticket.status === 'In Progress' ? 'bg-blue-900/50 text-blue-200 border border-blue-700' :
                    'bg-green-900/50 text-green-200 border border-green-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Created {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              No tickets found. Create your first ticket to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
