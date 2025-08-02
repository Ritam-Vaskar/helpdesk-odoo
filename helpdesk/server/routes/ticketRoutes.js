const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  getTicketStats,
  getRecentTickets,
  getTicketsByAgent,
  assignTicketToAgent,
} = require("../controllers/ticketController");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes

// Get ticket statistics
router.get("/stats", authMiddleware, getTicketStats);

// Get recent tickets
router.get("/recent", authMiddleware, getRecentTickets);

// Create a new ticket
router.post("/", authMiddleware, upload.single("attachment"), createTicket);

// Get all tickets
router.get("/", authMiddleware, getTickets);

// Get tickets by agent
router.get(
  "/agent/:agentId",
  authMiddleware,
  roleMiddleware(["Admin"]),
  getTicketsByAgent
);

// Get ticket by ID
router.get("/:id", authMiddleware, getTicketById);

// Update ticket
router.put("/:id", authMiddleware, updateTicket);

// Add comment to ticket
router.post("/:id/comments", authMiddleware, addComment);

// Assign ticket to agent
router.post(
  "/:ticketId/assign",
  authMiddleware,
  roleMiddleware(["Admin"]),
  assignTicketToAgent
);

module.exports = router;
