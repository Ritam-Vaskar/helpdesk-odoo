import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FLASK_SERVER_URL = process.env.REACT_APP_FLASK_SERVER_URL || 'http://localhost:8080';

export default function ComplaintChatBot() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const currentQuery = query;
    setHistory([...history, { query: currentQuery, response: null }]);
    setQuery('');
    setLoading(true);
    setResponse('');

    try {
      const res = await axios.post(`${FLASK_SERVER_URL}/resolve_complaint`, {
        query: currentQuery,
      });
      setResponse(res.data.response);
      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].response = res.data.response;
        return updated;
      });
    } catch (error) {
      const errorMsg = '❌ Failed to get response. Try again.';
      setResponse(errorMsg);
      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].response = errorMsg;
        return updated;
      });
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          aria-label="Open chatbot"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col p-4 border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg text-blue-700">Helpdesk Chat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-100 rounded-full p-1 transition"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-2 space-y-2">
            {history.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-8">
                Start a conversation about your issue!
              </div>
            )}
            {history.map((item, idx) => (
              <div key={idx}>
                <div className="text-right mb-1">
                  <span className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-lg text-xs">
                    {item.query}
                  </span>
                </div>
                <div className="text-left">
                  <div className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-xs max-w-full break-words prose prose-sm prose-blue">
                    {item.response ? (
                      <ReactMarkdown>{item.response}</ReactMarkdown>
                    ) : (
                      <span className="animate-pulse">Thinking...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
            <input
              ref={inputRef}
              type="text"
              placeholder="Describe your issue..."
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
              disabled={loading || !query.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
