const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: String,
  members: Array,
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
