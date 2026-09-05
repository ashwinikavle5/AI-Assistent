require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb } = require('./db/database');

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const pronunciationRoutes = require('./routes/pronunciationRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const streakRoutes = require('./routes/streakRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'SpeakWise AI',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pronunciation', pronunciationRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/progress', progressRoutes);

// Fallback 404 for unmatched API endpoints
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Serve client production build
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // Do not cache index.html so users always receive latest bundle references
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // SPA fallback for all frontend client routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.'
  });
});

// Initialize database schema and start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 SpeakWise AI Backend Server running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Web App: http://localhost:${PORT}`);
    console.log(`========================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database on startup:', err);
});
