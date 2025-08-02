const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["User", "Agent", "Admin"],
    default: "User"
  },
  expertise: [String], // Areas of expertise for agents
  skills: [String],    // Technical skills for agents
  expertiseDomain: { type: String }, // Main expertise domain
  solvedQueries: [String] // List of previously solved queries/issues
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
