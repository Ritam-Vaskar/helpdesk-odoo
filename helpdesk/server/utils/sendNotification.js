const Notification = require("../models/Notification");

const sendNotification = async (userId, message) => {
  try {
    const notification = new Notification({
      user: userId,
      message,
    });

    await notification.save();
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};

module.exports = sendNotification;
