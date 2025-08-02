const Ticket = require("../models/Ticket");
const mongoose = require("mongoose");

exports.createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      createdBy: req.user.userId,
      status: "Open"
    };

    // Add attachment if file was uploaded
    if (req.file) {
      ticketData.attachment = `/uploads/${req.file.filename}`;
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

    // Allow access if user is admin, agent assigned to the ticket, or ticket creator
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
    // Allow agents and admins to update ticket status and add comments
    if (userRole !== 'agent' && userRole !== 'admin' && ticket.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this ticket" });
    }

    // Define allowed updates based on role
    const allowedUpdates = ['status'];
    if (userRole === 'agent' || userRole === 'admin') {
      // If agent or admin is updating status, automatically assign the ticket
      if (req.body.status === 'In Progress') {
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
      .populate("comments.author", "name email");

    res.json(updatedTicket);
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ 
      message: "Failed to update ticket",
      error: err.message 
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check user authorization - more permissive approach
    const userRole = req.user.role.toLowerCase();
    const isCreator = ticket.createdBy && ticket.createdBy.toString() === req.user.userId;
    const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === req.user.userId;
    const isAdmin = userRole === 'admin';
    const isAgent = userRole === 'agent';
    
    // Allow comments from:
    // 1. Ticket creator
    // 2. Assigned agent
    // 3. Any admin
    // 4. Any agent (can comment on any ticket)
    if (!isCreator && !isAssigned && !isAdmin && !isAgent) {
      return res.status(403).json({ message: "Not authorized to comment on this ticket" });
    }

    const comment = {
      text: req.body.text,
      author: req.user.userId
    };

    ticket.comments.push(comment);
    await ticket.save();

    // Create notification for the other party
    const Notification = require('../models/Notification');
    let notificationRecipient = null;
    
    if (isCreator && ticket.assignedTo) {
      // If creator is commenting, notify assigned agent
      notificationRecipient = ticket.assignedTo;
    } else if ((isAssigned || isAgent || isAdmin) && ticket.createdBy) {
      // If agent/admin is commenting, notify ticket creator
      notificationRecipient = ticket.createdBy;
    }
    
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
      .populate("comments.author", "name email");

    res.json(updatedTicket);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ 
      message: "Failed to add comment",
      error: err.message 
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
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(tickets);
  } catch (err) {
    console.error("Error fetching recent tickets:", err);
    res.status(500).json({ 
      message: "Error fetching recent tickets",
      error: err.message 
    });
  }
};
