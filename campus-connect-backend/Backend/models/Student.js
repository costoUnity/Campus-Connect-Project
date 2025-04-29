const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  group: {
    name: String,
    department: String,
    faculty: String,
    year: String
  },
  profilePic: { type: String, default: "" } // For profile picture URL (optional for now)
});

module.exports = mongoose.model('Student', StudentSchema, 'students');

//module.exports = mongoose.model('Student', StudentSchema);
