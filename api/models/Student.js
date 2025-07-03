const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  fullName: String,
  studentId: String,
  guardianPhone: String,
  password: String,
  grade: String,
  banned: { type: Boolean, default: false },
  wallet: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  activityLog: Array,
  notifications: Array
});
module.exports = mongoose.model('Student', studentSchema);
