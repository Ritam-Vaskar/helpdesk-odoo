import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = useCallback(async () => {
      try {
      setLoading(true);
      const { data } = await api.get(`/api/tickets/${id}`);
        setTicket(data);
      setError("");
      } catch (err) {
      setError("Failed to load ticket. Please try again.");
      } finally {
        setLoading(false);
      }
  }, [id]);
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/tickets/${id}/comments`, { text: comment });
      setTicket(data);
      setComment("");
    } catch (err) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

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

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white">Ticket not found</h3>
        <p className="mt-2 text-gray-400">The ticket you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate("/tickets")}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="bg-[#1C1C1C] rounded-lg shadow-lg border border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-white">{ticket.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Category: {ticket.category?.name || 'Uncategorized'}</span>
                  <span>•</span>
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/tickets")}
                className="text-gray-500 hover:text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-6 text-gray-300 space-y-4">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
              {ticket.attachment && (
                <div className="mt-4">
                  <a
                    href={ticket.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#1C1C1C] rounded-lg shadow-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Comments</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-300 font-medium">
                          {comment.author?.name?.[0] || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {comment.author?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2 text-gray-300 whitespace-pre-wrap">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                No comments yet.
              </div>
            )}
            
            {/* Add Comment Form */}
            <div className="p-6">
              <form onSubmit={handleCommentSubmit}>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 bg-[#111] border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your comment here..."
                  required
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'Submitting...' : 'Add Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
