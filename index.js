require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/books', require('./routes/books'));
app.use('/api/support-panel', require('./routes/supportPanel'));
app.use('/api/teacher-panel', require('./routes/teacherPanel'));

app.get('/', (req, res) => {
  res.send('🔥 Wahba Server API is running');
});

module.exports = app;