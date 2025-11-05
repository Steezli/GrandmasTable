const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and name are required',
          details: {}
        }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
          details: { password: 'Password too short' }
        }
      });
    }

    if (name.length < 1 || name.length > 255) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name must be between 1 and 255 characters',
          details: { name: 'Invalid name length' }
        }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          details: { email: 'Invalid email format' }
        }
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Email already in use'
        }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get created user
    const [users] = await pool.execute(
      'SELECT id, email, name, profile_photo_url FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      user: users[0],
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          details: {}
        }
      });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, name, profile_photo_url FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password_hash from response
    delete user.password_hash;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_photo_url: user.profile_photo_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal, but keeping for consistency)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // Token removal is handled client-side
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, profile_photo_url FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({ user: users[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

