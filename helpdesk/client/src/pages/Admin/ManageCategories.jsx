import React, { useState, useEffect, useRef } from "react";
import userService from "../../services/userService";
import categoryService from "../../services/categoryService";
import Loader from "../../components/Loader";

// Agent Dropdown Component
const AgentDropdown = ({ agents, selectedAgents, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAgent = (agentId) => {
    if (selectedAgents.includes(agentId)) {
      onSelectionChange(selectedAgents.filter(id => id !== agentId));
    } else {
      onSelectionChange([...selectedAgents, agentId]);
    }
  };

  const removeAgent = (agentId) => {
    onSelectionChange(selectedAgents.filter(id => id !== agentId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected agents display */}
      {selectedAgents.length > 0 && (
        <div className="mb-3">
          <p className="text-gray-300 text-sm mb-2 font-medium">Selected Agents:</p>
          <div className="flex flex-wrap gap-2">
            {selectedAgents.map(agentId => {
              const agent = agents.find(a => a._id === agentId);
              return agent ? (
                <span 
                  key={agentId}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  {agent.name}
                  <button
                    onClick={() => removeAgent(agentId)}
                    className="ml-1 text-blue-100 hover:text-white hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition-all duration-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 flex items-center justify-between hover:bg-gray-700/50 transition-all duration-200"
      >
        <span className="text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          {selectedAgents.length === 0 
            ? 'Select agents...' 
            : `${selectedAgents.length} agent(s) selected`
          }
        </span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl max-h-64 overflow-hidden animate-slide-down">
          {/* Search input */}
          <div className="p-3 border-b border-gray-600/50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-gray-600/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Agent list */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredAgents.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                No agents found
              </div>
            ) : (
              filteredAgents.map((agent, index) => (
                <label
                  key={agent._id}
                  className="flex items-center p-3 hover:bg-gray-700/50 cursor-pointer text-gray-300 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent._id)}
                      onChange={() => toggleAgent(agent._id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedAgents.includes(agent._id) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-500 group-hover:border-blue-400'
                    }`}>
                      {selectedAgents.includes(agent._id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors duration-200">{agent.name}</div>
                      <div className="text-xs text-gray-400">{agent.email}</div>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      const [categoriesData, agentsData] = await Promise.all([
        categoryService.getCategories(),
        userService.getAllUsers()
      ]);
      
      setCategories(categoriesData);
      setAgents(agentsData.filter(user => user.role === "Agent"));

      // Initialize selected agents based on category assignments
      const initialSelectedAgents = {};
      categoriesData.forEach(category => {
        initialSelectedAgents[category._id] = category.assignedAgents?.map(agent => agent._id) || [];
      });
      setSelectedAgents(initialSelectedAgents);
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load categories and agents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await categoryService.createCategory({ name: newCategory.trim() });
      setNewCategory("");
      setSuccess("Category created successfully!");
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Error creating category", err);
      setError(err.response?.data?.message || "Error creating category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await categoryService.deleteCategory(categoryId);
      setSuccess("Category deleted successfully!");
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Error deleting category", err);
      setError(err.response?.data?.message || "Error deleting category");
    }
  };

  const handleAssignAgents = async (categoryId) => {
    try {
      setError("");
      setSuccess("");
      const agentIds = selectedAgents[categoryId] || [];
      await categoryService.assignAgentsToCategory(categoryId, agentIds);
      setSuccess("Agents assigned successfully!");
      fetchData(); // Refresh to show updated assignments
    } catch (err) {
      console.error("Error assigning agents", err);
      setError(err.response?.data?.message || "Error assigning agents");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0F0F0F] to-gray-800 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-4">
              Category Management
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Organize your support system by managing categories and assigning specialized agents
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm animate-shake">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-300 px-6 py-4 rounded-xl backdrop-blur-sm animate-bounce-in">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Add New Category */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8 mb-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Category</h2>
                <p className="text-gray-400">Create a new category to organize your support tickets</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter category name..."
                  className="w-full bg-gray-900/50 border border-gray-600/50 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:border-gray-500/70"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 pointer-events-none transition-all duration-200"></div>
              </div>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-6">
            {categories.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">No Categories Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Get started by creating your first category above. Categories help organize and route support tickets effectively.
                </p>
              </div>
            ) : (
              categories.map((category, index) => (
                <div
                  key={category._id}
                  className="bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8 hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <span className="text-sm font-medium">
                            {category.assignedAgents?.length || 0} agent{(category.assignedAgents?.length || 0) !== 1 ? 's' : ''} assigned
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Agent Assignment Section */}
                  {agents.length > 0 && (
                    <div className="border-t border-gray-700/50 pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h4 className="text-white font-semibold text-lg">Assign Agents</h4>
                      </div>
                      
                      <AgentDropdown
                        agents={agents}
                        selectedAgents={selectedAgents[category._id] || []}
                        onSelectionChange={(selectedIds) => {
                          setSelectedAgents(prev => ({
                            ...prev,
                            [category._id]: selectedIds
                          }));
                        }}
                      />

                      <button
                        onClick={() => handleAssignAgents(category._id)}
                        disabled={(selectedAgents[category._id] || []).length === 0}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 mt-4 hover:shadow-lg hover:shadow-green-500/25 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Assignment ({(selectedAgents[category._id] || []).length} selected)
                      </button>
                    </div>
                  )}

                  {/* Currently Assigned Agents */}
                  {category.assignedAgents && category.assignedAgents.length > 0 && (
                    <div className="border-t border-gray-700/50 pt-6 mt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-white font-semibold text-lg">Currently Assigned</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.assignedAgents.map((agent) => (
                          <div key={agent._id} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {agent.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{agent.name}</p>
                                <p className="text-gray-400 text-sm truncate">{agent.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ManageCategories;