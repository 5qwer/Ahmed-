const mongoose = require('mongoose');
const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  videoUrl: String,
  pdfUrl: String,
  homeworkPdf: String,
  solutionPdf: String,
  coverImage: String,
  questions: Array,
  grade: String
});
module.exports = mongoose.model('Lesson', lessonSchema);
