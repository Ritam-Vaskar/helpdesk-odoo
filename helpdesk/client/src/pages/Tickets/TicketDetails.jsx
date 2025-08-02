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
const getStatusIcon = (status) => {
  switch (status) {
    case "Open":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    case "In Progress":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      );
    case "Resolved":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case "Closed":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};
 return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-teal-600/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8 space-y-8">
        {/* Enhanced error display */}
        {error && (
          <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-sm border border-red-500/30 text-red-200 px-8 py-6 rounded-2xl shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">{error}</span>
            </div>
          </div>
        )}

        {/* Enhanced main ticket card */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 overflow-hidden">
          {/* Header Section */}
          <div className="relative p-8 border-b border-gray-600/50 bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"></div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-teal-400 bg-clip-text text-transparent">
                    {ticket.title}
                  </h2>
                </div>
                
                <div className="flex items-center gap-8 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium text-lg">
                      Category: {ticket.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium text-lg">
                      Created: {new Date(ticket.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <span className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => navigate("/tickets")}
                className="group p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50 rounded-2xl hover:from-gray-600/50 hover:to-gray-700/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-8">
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-lg">
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {ticket.description}
              </p>
              {ticket.attachment && (
                <div className="mt-6">
                  <a
                    href={ticket.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 rounded-2xl hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 backdrop-blur-sm shadow-lg"
                  >
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-semibold">View Attachment</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Comments Section */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/30 overflow-hidden">
          {/* Comments Header */}
          <div className="relative p-8 border-b border-gray-600/50 bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Comments
              </h3>
            </div>
          </div>
          
          {/* Comments List */}
          <div className="divide-y divide-gray-600/30">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment, index) => (
                <div 
                  key={index} 
                  className="p-8 hover:bg-gradient-to-r hover:from-gray-700/20 hover:via-gray-600/20 hover:to-gray-700/20 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                        <span className="text-blue-300 font-bold text-lg">
                          {comment.author?.name?.[0] || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-white">
                            {comment.author?.name || 'User'}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-gray-500/20 rounded-lg">
                              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                              {new Date(comment.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <div className="space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/50 backdrop-blur-sm shadow-lg">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-300">No comments yet</h4>
                    <p className="text-gray-400">Be the first to add a comment to this ticket</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Comment Form */}
            <div className="p-8 bg-gradient-to-r from-gray-800/30 via-gray-700/30 to-gray-800/30">
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="comment" className="flex items-center gap-3 text-lg font-semibold text-gray-300">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.828 2.828 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    Add a comment
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <textarea
                      id="comment"
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="relative w-full px-6 py-4 bg-gray-900/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm resize-none text-lg"
                      placeholder="Type your comment here..."
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className={`group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg transition-all duration-300 transform shadow-2xl ${
                      submitting || !comment.trim() 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:scale-105'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <span>Add Comment</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  </div>
);
};

export default TicketDetails;
