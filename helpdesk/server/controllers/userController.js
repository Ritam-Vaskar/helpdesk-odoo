const User = require("../models/User");
const Ticket = require("../models/Ticket"); // Assuming Ticket model is in the same directory

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