const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema({
  username: String,
  code: String,
  phone: String
});
module.exports = mongoose.model('Teacher', teacherSchema);
