const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  getTicketStats,
  getRecentTickets,
} = require("../controllers/ticketController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get ticket statistics (specific route before dynamic routes)
router.get("/stats", authMiddleware, getTicketStats);

// Get recent tickets (specific route before dynamic routes)
router.get("/recent", authMiddleware, getRecentTickets);

// Create a new ticket (any logged-in user)
router.post("/", authMiddleware, upload.single("attachment"), createTicket);

// Get tickets (users only see their own)
router.get("/", authMiddleware, getTickets);

// Get ticket by id (dynamic route after specific routes)
router.get("/:id", authMiddleware, getTicketById);

// Update ticket
router.put("/:id", authMiddleware, updateTicket);

// Add comment to ticket
router.post("/:id/comments", authMiddleware, addComment);

module.exports = router;
