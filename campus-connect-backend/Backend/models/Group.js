const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  members: [{ regNumber: String, name: String }]
});

module.exports = mongoose.model('Group', GroupSchema);
