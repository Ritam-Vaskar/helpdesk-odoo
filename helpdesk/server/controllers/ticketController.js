const Ticket = require("../models/Ticket");
const mongoose = require("mongoose");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { uploadToBlob } = require("../utils/blobService");
const axios = require("axios");

// Flask server configuration
const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || "http://localhost:8080";

exports.createTicket = async (req, res) => {
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const ticketData = {
      ...req.body,
      createdBy: req.user.userId,
      status: "Open"
    };

    // Get priority score from Flask server
    try {
      const priorityResponse = await axios.post(`${FLASK_SERVER_URL}/priority_score`, {
        text: `${req.body.title} ${req.body.description}`
      });
      ticketData.priority = priorityResponse.data.priority_score || 1;
    } catch (error) {
      console.warn("Failed to get priority score:", error.message);
      ticketData.priority = 1; // Default priority
    }

    // Save complaint to Flask server for semantic search
    try {
      await axios.post(`${FLASK_SERVER_URL}/add_complaint`, {
        text: `${req.body.title}: ${req.body.description}`,
        category: req.body.category,
        timestamp: new Date().toISOString(),
        user_id: req.user.userId
      });
    } catch (error) {
      console.warn("Failed to save complaint to Flask server:", error.message);
    }

    // Handle file upload to Azure Blob Storage
    if (req.file) {
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ 
            message: "Invalid file type. Allowed types: JPEG, PNG, PDF, DOC, DOCX" 
          });
        }

        const blobUrl = await uploadToBlob(req.file);
        if (!blobUrl) {
          throw new Error('File upload failed - no URL returned');
        }
        ticketData.attachment = blobUrl;
      } catch (error) {
        console.error("File upload error:", error);
        return res.status(500).json({ 
          message: "File upload failed", 
          error: error.message 
        });
      }
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("category", "name");

    res.status(201).json(populatedTicket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ 
      message: "Failed to create ticket",
      error: err.message 
    });
  }
};

exports.getTickets = async (req, res) => {
  try {
    let query = {};
    const userRole = req.user.role.toLowerCase();
    
    // If user is not admin or agent, only show their tickets
    if (userRole === 'user') {
      query.createdBy = req.user.userId;
    } else if (userRole === 'agent') {
      // For agents, show all open tickets and tickets assigned to them
      query.$or = [
        { status: 'Open' },
        { assignedTo: req.user.userId }
      ];
    }
    
    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ 
      message: "Error fetching tickets",
      error: err.message 
    });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    console.log('Fetching ticket with ID:', req.params.id);
    console.log('User ID from token:', req.user.userId);

    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("category", "name")
      .populate("comments.author", "name email")
      .populate("assignedTo", "name email");

    console.log('Found ticket:', ticket);

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Handle case where createdBy is null
    if (!ticket.createdBy) {
      console.log('Ticket has no creator, allowing access');
      return res.json(ticket);
    }

    const userRole = req.user.role.toLowerCase();
    const isAdmin = userRole === 'admin';
    const isAgent = userRole === 'agent';
    const isTicketCreator = ticket.createdBy._id.toString() === req.user.userId;
    const isAssignedAgent = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user.userId;

    // Allow access if user is admin, agent (any ticket), or ticket creator, or assigned agent
    if (!isAdmin && !isAgent && !isTicketCreator && !isAssignedAgent) {
      console.log('Authorization failed. User role:', userRole);
      return res.status(403).json({ message: "Not authorized to view this ticket" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ 
      message: "Error fetching ticket",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const userRole = req.user.role.toLowerCase();
    const isTicketCreator = ticket.createdBy && ticket.createdBy.toString() === req.user.userId;
    
    // Allow agents and admins to update ticket status and add comments
    if (userRole !== 'agent' && userRole !== 'admin' && !isTicketCreator) {
      return res.status(403).json({ message: "Not authorized to update this ticket" });
    }

    // Define allowed updates based on role
    const allowedUpdates = ['status'];
    if (userRole === 'agent' || userRole === 'admin') {
      // If agent or admin is updating status, automatically assign the ticket
      if (req.body.status === 'In Progress' && !ticket.assignedTo) {
        req.body.assignedTo = req.user.userId;
      }
    }

    // Add comment if provided
    if (req.body.comment) {
      ticket.comments.push({
        text: req.body.comment,
        author: req.user.userId
      });
      await ticket.save();
    }

    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key) || key === 'assignedTo')
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("category", "name")
      .populate("comments.author", "name email")
      .populate("assignedTo", "name email");

    res.json(updatedTicket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ 
      message: "Failed to update ticket",
      error: err.message 
    });
  }
};

exports.getTicketsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const tickets = await Ticket.find({ assignedTo: agentId })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error("Error fetching agent tickets:", err);
    res.status(500).json({ message: "Error fetching agent tickets" });
  }
};

exports.getTicketsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const tickets = await Ticket.find({ assignedTo: agentId })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error("Error fetching agent tickets:", err);
    res.status(500).json({ message: "Error fetching agent tickets" });
  }
};

// Update addComment function to automatically assign ticket
exports.addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Get user role and normalize it to lowercase for comparison
    const userRole = req.user.role.toLowerCase();
    const isAdmin = userRole === 'admin';
    const isAgent = userRole === 'agent';
    const isCreator = ticket.createdBy.toString() === req.user.userId;
    const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === req.user.userId;

    // Allow comments from admins, agents, ticket creator, or assigned agent
    if (!isAdmin && !isAgent && !isCreator && !isAssigned) {
      return res.status(403).json({ message: "Not authorized to comment on this ticket" });
    }

    const comment = {
      text: req.body.text,
      author: req.user.userId
    };

    // If an agent comments and ticket is unassigned, assign it to them
    if (isAgent && !ticket.assignedTo && !isCreator) {
      ticket.assignedTo = req.user.userId;
    }

    ticket.comments.push(comment);
    await ticket.save();

    // Create notification for relevant users
    const notificationRecipient = isCreator ? ticket.assignedTo : ticket.createdBy;
    
    if (notificationRecipient) {
      const notification = new Notification({
        user: notificationRecipient,
        message: `New comment on ticket: ${ticket.title}`,
      });
      await notification.save();
    }

    const updatedTicket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("category", "name")
      .populate("comments.author", "name email")
      .populate("assignedTo", "name email");

    res.json(updatedTicket);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ 
      message: "Failed to add comment",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    console.log('Fetching stats for user:', req.user.userId);
    
    const stats = await Ticket.aggregate([
      { 
        $match: { 
          createdBy: new mongoose.Types.ObjectId(req.user.userId)
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('Found stats:', stats);

    const defaultStats = {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0
    };

    res.json(stats.length > 0 ? stats[0] : defaultStats);
  } catch (err) {
    console.error("Error fetching ticket stats:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ 
      message: "Error fetching ticket statistics",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.getRecentTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.userId })
      .populate("createdBy", "name email")
      .populate("category", "name")
      .populate("assignedTo", "name email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found" });
    }

    // Get progress stats for each ticket
    const ticketsWithProgress = tickets.map(ticket => {
      const totalComments = ticket.comments.length;
      let progress = 0;
      
      switch(ticket.status) {
        case 'Open':
          progress = 25;
          break;
        case 'In Progress':
          progress = 50;
          break;
        case 'Resolved':
          progress = 75;
          break;
        case 'Closed':
          progress = 100;
          break;
        default:
          progress = 0;
      }

      return {
        ...ticket.toObject(),
        progress,
        totalComments
      };
    });

    res.json(ticketsWithProgress);
  } catch (err) {
    console.error("Error fetching recent tickets:", err);
    res.status(500).json({
      message: "Error fetching recent tickets",
      error: err.message
    });
  }
};

exports.assignTicketToAgent = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { agentId } = req.body;

    // Validate agent exists and is actually an agent
    const agent = await User.findOne({ 
      _id: agentId, 
      role: { $in: ['Agent', 'agent'] } 
    });
    
    if (!agent) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { 
        assignedTo: agentId,
        status: 'In Progress' 
      },
      { new: true }
    ).populate("createdBy assignedTo category");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Send notification to the assigned agent
    await sendNotification(
      agentId,
      `You have been assigned ticket: ${ticket.title}`,
      'assignment'
    );

    res.json(ticket);
  } catch (err) {
    console.error("Error assigning ticket:", err);
    res.status(500).json({ 
      message: "Failed to assign ticket",
      error: err.message 
    });
  }
};

// Get priority users for a ticket using Flask server
exports.getPriorityUsers = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findById(ticketId).populate("createdBy", "name email");
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Get all agents
    const agents = await User.find({ role: "Agent" }).select("name email expertise skills");
    
    if (agents.length === 0) {
      return res.status(404).json({ message: "No agents available" });
    }

    // Format users for Flask server
    const usersData = agents.map(agent => ({
      id: agent._id,
      name: agent.name,
      email: agent.email,
      expertise: agent.expertise || [],
      skills: agent.skills || []
    }));

    try {
      const response = await axios.post(`${FLASK_SERVER_URL}/priority-users`, {
        question: `${ticket.title}: ${ticket.description}`,
        users: usersData,
        top_n: 5
      });

      res.json({
        ticket: {
          id: ticket._id,
          title: ticket.title,
          description: ticket.description
        },
        priorityUsers: response.data
      });
    } catch (error) {
      console.error("Flask server error:", error.message);
      res.status(500).json({ 
        message: "Failed to get priority users from AI service",
        error: error.message,
        availableAgents: usersData
      });
    }
  } catch (err) {
    console.error("Error getting priority users:", err);
    res.status(500).json({ 
      message: "Failed to get priority users",
      error: err.message 
    });
  }
};

// Get ticket summary using Flask server
exports.getTicketSummary = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findById(ticketId).populate("createdBy", "name email");
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    try {
      const response = await axios.post(`${FLASK_SERVER_URL}/summarize`, {
        text: `Title: ${ticket.title}\nDescription: ${ticket.description}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}`
      });

      res.json({
        ticket: {
          id: ticket._id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority
        },
        summary: response.data.summary
      });
    } catch (error) {
      console.error("Flask server error:", error.message);
      res.status(500).json({ 
        message: "Failed to generate summary",
        error: error.message
      });
    }
  } catch (err) {
    console.error("Error getting ticket summary:", err);
    res.status(500).json({ 
      message: "Failed to get ticket summary",
      error: err.message 
    });
  }
};

// Search similar complaints using Flask server
exports.searchSimilarComplaints = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    try {
      const response = await axios.post(`${FLASK_SERVER_URL}/search_similar_complaints`, {
        query: query,
        max_results: maxResults,
        similarity_threshold: 1.2
      });

      res.json(response.data);
    } catch (error) {
      console.error("Flask server error:", error.message);
      res.status(500).json({ 
        message: "Failed to search similar complaints",
        error: error.message
      });
    }
  } catch (err) {
    console.error("Error searching complaints:", err);
    res.status(500).json({ 
      message: "Failed to search complaints",
      error: err.message 
    });
  }
};

// Get enhanced search results
exports.enhancedSearchComplaints = async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    try {
      const response = await axios.post(`${FLASK_SERVER_URL}/enhanced_search_complaints`, {
        query: query,
        max_results: maxResults
      });

      res.json(response.data);
    } catch (error) {
      console.error("Flask server error:", error.message);
      res.status(500).json({ 
        message: "Failed to perform enhanced search",
        error: error.message
      });
    }
  } catch (err) {
    console.error("Error in enhanced search:", err);
    res.status(500).json({ 
      message: "Failed to perform enhanced search",
      error: err.message 
    });
  }
};