const User = require("../models/User");
const Ticket = require("../models/Ticket"); // Assuming Ticket model is in the same directory
const axios = require("axios");

// Flask server configuration
const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || "http://localhost:8080";

// Get all users with a specific role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role: role })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      message: "Error fetching users",
      error: err.message 
    });
  }
};


// "question": "How to fix laptop battery not charging properly?",
    // "top_n": 5,
    // "users": [
    //     {
    //         "userId": "23CS8002",
    //         "expertise_domain": "AI/API Integration",
    //         "Solved queries": [
    //             "How to integrate Gemini API with Flask?",
    //             "How to summarize text using Gemini API?",
    //             "How to handle errors in Gemini API integration?",
    //             "How to configure API keys for Gemini?",
    //             "How to implement text processing with AI models?",
    //             "How to handle API rate limiting?",
    //             "How to parse JSON responses from APIs?",
    //             "How to implement error handling for API calls?"
    //         ]
    //     },

exports.getUserByExperties = async (req, res) => {
  try { 
    const question = req.body.question;
    const top_n = req.body.top_n || 5;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }
    
    // Get all agents with their expertise data
    const agent_users = await User.find({ role: "Agent" })
      .select('_id name email expertiseDomain solvedQueries expertise skills');
    
    if (agent_users.length === 0) {
      return res.status(404).json({ message: "No agents found" });
    }
    
    const users = [];
    
    // Get all resolved tickets to extract solved queries
    const AllTickets = await Ticket.find({ status: "Resolved" })
      .populate('assignedTo', 'name email')
      .select('title description assignedTo');
    
    // Build agent expertise map from resolved tickets
    const agentSolvedQueries = {};
    for (let i = 0; i < AllTickets.length; i++) {
      const ticket = AllTickets[i];
      if (ticket.assignedTo && ticket.assignedTo._id) {
        const agentId = ticket.assignedTo._id.toString();
        if (!agentSolvedQueries[agentId]) {
          agentSolvedQueries[agentId] = [];
        }
        // Add ticket title and description as solved queries
        const solvedQuery = `${ticket.title}: ${ticket.description}`;
        agentSolvedQueries[agentId].push(solvedQuery);
      }
    }
    
    // Format users data for Flask server
    for (let agent of agent_users) {
      const agentId = agent._id.toString();
      
      // Get solved queries from tickets or use predefined ones
      let solvedQueries = agentSolvedQueries[agentId] || [];
      
      // If agent has predefined solved queries, use those
      if (agent.solvedQueries && agent.solvedQueries.length > 0) {
        solvedQueries = agent.solvedQueries;
      }
      
      // If no solved queries found, use default based on expertise
      if (solvedQueries.length === 0) {
        solvedQueries = [
          "General customer support",
          "Basic troubleshooting",
          "User assistance"
        ];
      }
      
      // Determine expertise domain
      let expertiseDomain = agent.expertiseDomain || "General Support";
      
      // If no expertise domain, try to infer from expertise/skills
      if (!agent.expertiseDomain && agent.expertise && agent.expertise.length > 0) {
        expertiseDomain = agent.expertise[0];
      }
      
      users.push({
        userId: agentId,
        expertise_domain: expertiseDomain,
        "Solved queries": solvedQueries.slice(0, 10) // Limit to 10 queries
      });
    }
    
    // Prepare the request format for Flask server
    const flaskRequest = {
      question: question.trim(),
      top_n: top_n,
      users: users
    };
    
    res.json({
      message: "User expertise data formatted successfully",
      data: flaskRequest,
      totalAgents: users.length
    });
    
  } catch (e) {
    console.error("Error in getUserByExperties:", e);
    res.status(500).json({ 
      message: "Error fetching user expertise data",
      error: e.message 
    });
  }
};

// Get priority users by calling Flask server with expertise data
exports.getPriorityUsersByExpertise = async (req, res) => {
  try {
    const question = req.body.question;
    const top_n = req.body.top_n || 5;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }
    
    // Get formatted user expertise data
    const agent_users = await User.find({ role: "Agent" })
      .select('_id name email expertiseDomain solvedQueries expertise skills');
    
    if (agent_users.length === 0) {
      return res.status(404).json({ message: "No agents found" });
    }
    
    const users = [];
    
    // Get all resolved tickets to extract solved queries
    const AllTickets = await Ticket.find({ status: "Resolved" })
      .populate('assignedTo', 'name email')
      .select('title description assignedTo');
    
    // Build agent expertise map from resolved tickets
    const agentSolvedQueries = {};
    for (let i = 0; i < AllTickets.length; i++) {
      const ticket = AllTickets[i];
      if (ticket.assignedTo && ticket.assignedTo._id) {
        const agentId = ticket.assignedTo._id.toString();
        if (!agentSolvedQueries[agentId]) {
          agentSolvedQueries[agentId] = [];
        }
        const solvedQuery = `${ticket.title}: ${ticket.description}`;
        agentSolvedQueries[agentId].push(solvedQuery);
      }
    }
    
    // Format users data for Flask server
    for (let agent of agent_users) {
      const agentId = agent._id.toString();
      
      let solvedQueries = agentSolvedQueries[agentId] || [];
      
      if (agent.solvedQueries && agent.solvedQueries.length > 0) {
        solvedQueries = agent.solvedQueries;
      }
      
      if (solvedQueries.length === 0) {
        solvedQueries = [
          "General customer support",
          "Basic troubleshooting",
          "User assistance"
        ];
      }
      
      let expertiseDomain = agent.expertiseDomain || "General Support";
      
      if (!agent.expertiseDomain && agent.expertise && agent.expertise.length > 0) {
        expertiseDomain = agent.expertise[0];
      }
      
      users.push({
        userId: agentId,
        expertise_domain: expertiseDomain,
        "Solved queries": solvedQueries.slice(0, 10)
      });
    }
    
    // Call Flask server for priority analysis
    try {
      const flaskResponse = await axios.post(`${FLASK_SERVER_URL}/priority-users`, {
        question: question.trim(),
        top_n: top_n,
        users: users
      });
      
      // Enrich the response with agent details
      const priorityUsers = flaskResponse.data.priority_users || [];
      const enrichedUsers = priorityUsers.map(user => {
        const agent = agent_users.find(a => a._id.toString() === user.userId);
        return {
          ...user,
          name: agent ? agent.name : 'Unknown Agent',
          email: agent ? agent.email : 'unknown@email.com'
        };
      });
      
      res.json({
        question: question.trim(),
        totalAgents: users.length,
        priorityUsers: enrichedUsers,
        flaskResponse: flaskResponse.data
      });
      
    } catch (flaskError) {
      console.error("Flask server error:", flaskError.message);
      res.status(500).json({
        message: "Failed to get priority users from AI service",
        error: flaskError.message,
        formattedData: {
          question: question.trim(),
          top_n: top_n,
          users: users
        }
      });
    }
    
  } catch (e) {
    console.error("Error in getPriorityUsersByExpertise:", e);
    res.status(500).json({ 
      message: "Error analyzing user expertise",
      error: e.message 
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['User', 'Agent'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'Admin') {
      return res.status(403).json({ message: "Cannot modify admin role" });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ 
      message: "Error updating user role",
      error: err.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'Admin') {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ 
      message: "Error deleting user",
      error: err.message 
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .lean();
      
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's ticket statistics
    const ticketStats = await Ticket.aggregate([
      { $match: { createdBy: user._id } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } }
      }}
    ]);

    res.json({
      user,
      stats: ticketStats[0] || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
      }
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};