const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { 
  createCategory, 
  getCategories, 
  deleteCategory,
  assignAgentsToCategory,
  getCategoryTickets
} = require("../controllers/categoryController");

const router = express.Router();

// ✅ Only Admins can create categories
router.post("/", authMiddleware, roleMiddleware(["Admin"]), createCategory);

// ✅ All authenticated users can view categories
router.get("/", authMiddleware, getCategories);

// ✅ Only Admins can delete categories
router.delete("/:categoryId", authMiddleware, roleMiddleware(["Admin"]), deleteCategory);

// ✅ Only Admins can assign agents to categories
router.post("/:categoryId/assign", authMiddleware, roleMiddleware(["Admin"]), assignAgentsToCategory);

// ✅ Get all tickets for a specific category
router.get("/:categoryId/tickets", authMiddleware, getCategoryTickets);

module.exports = router;