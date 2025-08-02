import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
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
    <div className="min-h-screen bg-[#0F0F0F] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Agent Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            onClick={() => setSelectedStatus(selectedStatus === 'Open' ? null : 'Open')}
            className={`cursor-pointer p-4 rounded-lg ${selectedStatus === 'Open' ? 'bg-yellow-600' : 'bg-gray-700'} hover:bg-opacity-90 transition-colors`}
          >
            <h3 className="text-lg font-semibold">Open Tickets</h3>
            <p className="text-3xl font-bold">{getStatusCount('Open')}</p>
          </div>
          <div 
            onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? null : 'In Progress')}
            className={`cursor-pointer p-4 rounded-lg ${selectedStatus === 'In Progress' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-opacity-90 transition-colors`}
          >
            <h3 className="text-lg font-semibold">In Progress</h3>
            <p className="text-3xl font-bold">{getStatusCount('In Progress')}</p>
          </div>
          <div 
            onClick={() => setSelectedStatus(selectedStatus === 'Resolved' ? null : 'Resolved')}
            className={`cursor-pointer p-4 rounded-lg ${selectedStatus === 'Resolved' ? 'bg-green-600' : 'bg-gray-700'} hover:bg-opacity-90 transition-colors`}
          >
            <h3 className="text-lg font-semibold">Resolved</h3>
            <p className="text-3xl font-bold">{getStatusCount('Resolved')}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-[#1C1C1C] rounded-lg shadow-lg border border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{ticket.title}</h3>
                  <p className="text-gray-400 mt-1">
                    Created by: {ticket.createdBy?.name || "Unknown"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="text-gray-300 mb-4">{ticket.description}</p>

              {selectedTicket?._id === ticket._id ? (
                <div className="space-y-4 border-t border-gray-700 pt-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment about this status change..."
                    className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(ticket._id, "In Progress")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      disabled={ticket.status === "In Progress"}
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(ticket._id, "Resolved")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      disabled={ticket.status === "Resolved"}
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleAddComment(ticket._id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      Add Comment
                    </button>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Update Status
                </button>
              )}

              {ticket.comments && ticket.comments.length > 0 && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Comments</h4>
                  <div className="space-y-2">
                    {ticket.comments.map((comment, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        <span className="text-gray-400">{comment.author?.name}: </span>
                        {comment.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-12 bg-[#1C1C1C] rounded-lg">
              <p className="text-gray-400">No tickets available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
