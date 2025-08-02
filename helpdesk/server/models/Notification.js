const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      "TICKET_ASSIGNED",
      "TICKET_COMMENT",
      "TICKET_STATUS_CHANGE",
      "AGENT_ASSIGNED"
    ],
    required: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket"
  },
  read: {
    type: Boolean,
    default: false
  }
},
{ timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
