const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { initBlobService } = require('./utils/blobService');

const app = express();

// Most permissive CORS setup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
})
// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Initialize Azure Blob Service
initBlobService()
  .then(() => console.log('Azure Blob Storage initialized'))
  .catch(err => console.error('Failed to initialize Azure Blob Storage:', err));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
