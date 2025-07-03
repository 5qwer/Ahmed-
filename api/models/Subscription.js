const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  lessons: Array,
  imageUrl: String
});
module.exports = mongoose.model('Subscription', subscriptionSchema);
