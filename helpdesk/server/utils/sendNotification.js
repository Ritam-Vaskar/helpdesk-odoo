const Notification = require("../models/Notification");

const sendNotification = async (userId, message, type = 'system') => {
  try {
    const notification = new Notification({
      user: userId,
      message,
      type
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error("Notification Error:", err.message);
    throw err;
  }
};

module.exports = sendNotification;
