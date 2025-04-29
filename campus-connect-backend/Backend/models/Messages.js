const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  group: { type: String, required: true },
  sender: { type: String, required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
