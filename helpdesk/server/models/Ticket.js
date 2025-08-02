const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comments: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now },
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }
  ],
  attachment: String
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);
