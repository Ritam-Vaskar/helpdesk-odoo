const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getUsersByRole,
  updateUserRole,
  deleteUser,
  getUserProfile,
  getUserByExperties,
  getPriorityUsersByExpertise
} = require("../controllers/userController");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

// Get users by role
router.get("/role/:role", getUsersByRole);

// Get users formatted for Flask expertise analysis
router.post("/expertise", getUserByExperties);

// Get priority users from Flask AI analysis
router.post("/priority-analysis", getPriorityUsersByExpertise);

// Update user role
router.put("/:userId/role", updateUserRole);

// Delete user
router.delete("/:userId", deleteUser);

// Get user profile - available to authenticated users
router.get("/profile", authMiddleware, getUserProfile);

// /api/users/role/Agent

module.exports = router;