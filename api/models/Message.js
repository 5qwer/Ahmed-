const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  imageUrl: String,
  reply: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema);
