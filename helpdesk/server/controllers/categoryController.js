const Category = require("../models/Category");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: "Failed to create category" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('assignedAgents', 'name email role')
      .sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ 
      message: "Error fetching categories",
      error: err.message 
    });
  }
};

// ADDED MISSING DELETE FUNCTION
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has any tickets assigned
    const ticketCount = await Ticket.countDocuments({ category: categoryId });
    if (ticketCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${ticketCount} ticket(s) assigned to it.` 
      });
    }

    await Category.findByIdAndDelete(categoryId);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

exports.assignAgentsToCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { agentIds } = req.body;

    // Verify all agents exist and are agents (case-sensitive fix)
    const agents = await User.find({ _id: { $in: agentIds }, role: 'Agent' }); // Changed from 'agent' to 'Agent'
    if (agents.length !== agentIds.length) {
      return res.status(400).json({ message: "Some agent IDs are invalid or not agents" });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { assignedAgents: agentIds },
      { new: true }
    ).populate('assignedAgents', 'name email role');

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error("Error assigning agents to category:", err);
    res.status(500).json({ message: "Failed to assign agents to category" });
  }
};

exports.getCategoryTickets = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const tickets = await Ticket.find({ category: categoryId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error("Error fetching category tickets:", err);
    res.status(500).json({ message: "Failed to fetch category tickets" });
  }
};