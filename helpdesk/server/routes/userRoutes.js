const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getUsersByRole,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

// Get users by role
router.get("/role/:role", getUsersByRole);

// Update user role
router.put("/:userId/role", updateUserRole);

// Delete user
router.delete("/:userId", deleteUser);

module.exports = router;