const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/families', require('./routes/families'));
app.use('/api/families', require('./routes/recipes')); // Family-scoped recipe routes (GET/POST /api/families/:familyId/recipes)
app.use('/api/recipes', require('./routes/recipes')); // Recipe routes (GET/PATCH/DELETE /api/recipes/:recipeId, GET /api/recipes/search, GET /api/recipes/public/:slug)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Grandma\'s Table API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      details: err.details || {}
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

