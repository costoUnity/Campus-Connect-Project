// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String,
  name: String,
  group: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },       // 🆕 added
  deletedAt: { type: Date }                         // optional
});

module.exports = mongoose.model("Message", messageSchema);

