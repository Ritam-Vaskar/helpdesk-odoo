const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getUserNotifications, markAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authMiddleware, getUserNotifications);
router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;
