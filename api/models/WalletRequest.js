const mongoose = require('mongoose');
const walletRequestSchema = new mongoose.Schema({
  studentId: String,
  amount: Number,
  paymentMethod: String,
  phone: String,
  transferCode: String,
  imageUrl: String,
  confirmed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('WalletRequest', walletRequestSchema);
