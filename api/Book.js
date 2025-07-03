const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
  title: String,
  price: Number,
  studentInfo: {
    fullName: String,
    phone: String,
    address: String
  },
  confirmed: { type: Boolean, default: false }
});
module.exports = mongoose.model('Book', bookSchema);