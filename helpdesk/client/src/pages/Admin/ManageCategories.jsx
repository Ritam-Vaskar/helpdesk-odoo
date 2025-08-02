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
        <div className="mb-2">
          <p className="text-gray-300 text-sm mb-1">Selected Agents:</p>
          <div className="flex flex-wrap gap-2">
            {selectedAgents.map(agentId => {
              const agent = agents.find(a => a._id === agentId);
              return agent ? (
                <span 
                  key={agentId}
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center"
                >
                  {agent.name}
                  <button
                    onClick={() => removeAgent(agentId)}
                    className="ml-2 text-blue-200 hover:text-white"
                  >
                    ×
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
        className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-left focus:outline-none focus:border-blue-500 flex items-center justify-between"
      >
        <span className="text-gray-300">
          {selectedAgents.length === 0 
            ? 'Select agents...' 
            : `${selectedAgents.length} agent(s) selected`
          }
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-600">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:bg-gray-600"
            />
          </div>

          {/* Agent list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredAgents.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm">No agents found</div>
            ) : (
              filteredAgents.map((agent) => (
                <label
                  key={agent._id}
                  className="flex items-center p-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(agent._id)}
                    onChange={() => toggleAgent(agent._id)}
                    className="mr-2"
                  />
                  <div className="flex-1">
                    <div className="text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.email}</div>
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-white">Manage Categories</h2>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Add New Category */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add new category"
          className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white w-full focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleAddCategory}
          disabled={!newCategory.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded text-white transition-colors"
        >
          Add
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No categories found. Create your first category above.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {category.assignedAgents?.length || 0} agent(s) assigned
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="text-red-500 hover:text-red-400 hover:underline transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Agent Assignment Section with Dropdown */}
              {agents.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-white mb-2">Assign Agents:</h4>
                  
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
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-white text-sm transition-colors mt-3"
                  >
                    Update Assignment ({(selectedAgents[category._id] || []).length} selected)
                  </button>
                </div>
              )}

              {/* Currently Assigned Agents */}
              {category.assignedAgents && category.assignedAgents.length > 0 && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="text-white mb-2">Currently Assigned:</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.assignedAgents.map((agent) => (
                      <span key={agent._id} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        {agent.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageCategories;