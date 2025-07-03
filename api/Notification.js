const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  to: String,
  title: String,
  message: String,
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);