const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: String,
  description: { type: String, default: "" },
  type: { type: String, default: "class" }, // 👈 "class", "school", "club", etc.
  admin: { type: String, default: "" }, // 👑 Usually regNumber of the first student
  members: [String], // 👈 Changed from Array to [String] for clarity
  messages: [
    {
      sender: {
        regNumber: String,
        name: String,
      },
      message: String,
      timestamp: String,
    },
  ],
});

module.exports = mongoose.model('Group', GroupSchema);
