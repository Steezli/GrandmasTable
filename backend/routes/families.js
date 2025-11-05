const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { generateInviteCode } = require('../utils/crypto');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/families
 * Get all families for current user
 */
router.get('/', async (req, res, next) => {
  try {
    const [families] = await pool.execute(
      `SELECT 
        f.id, 
        f.name, 
        f.created_by, 
        f.invite_code,
        COUNT(DISTINCT fm.user_id) as member_count,
        COUNT(DISTINCT r.id) as recipe_count,
        fm.role
      FROM families f
      INNER JOIN family_members fm ON f.id = fm.family_id
      LEFT JOIN family_members fm2 ON f.id = fm2.family_id
      LEFT JOIN recipes r ON f.id = r.family_id AND r.deleted_at IS NULL
      WHERE fm.user_id = ?
      GROUP BY f.id, f.name, f.created_by, f.invite_code, fm.role`,
      [req.user.id]
    );

    res.json(families);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/families
 * Create a new family
 */
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Family name is required',
          details: { name: 'Family name cannot be empty' }
        }
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Family name must be 255 characters or less',
          details: { name: 'Family name too long' }
        }
      });
    }

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      inviteCode = generateInviteCode();
      const [existing] = await pool.execute(
        'SELECT id FROM families WHERE invite_code = ?',
        [inviteCode]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate unique invite code'
        }
      });
    }

    // Create family
    const [result] = await pool.execute(
      'INSERT INTO families (name, created_by, invite_code) VALUES (?, ?, ?)',
      [name.trim(), req.user.id, inviteCode]
    );

    const familyId = result.insertId;

    // Add creator as admin
    await pool.execute(
      'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)',
      [familyId, req.user.id, 'admin']
    );

    // Get created family
    const [families] = await pool.execute(
      'SELECT id, name, created_by, invite_code FROM families WHERE id = ?',
      [familyId]
    );

    res.status(201).json(families[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/families/:familyId
 * Get family details
 */
router.get('/:familyId', async (req, res, next) => {
  try {
    const { familyId } = req.params;

    // Check if user is a member
    const [memberships] = await pool.execute(
      'SELECT role FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, req.user.id]
    );

    if (memberships.length === 0) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not a member of this family'
        }
      });
    }

    // Get family with members
    const [families] = await pool.execute(
      'SELECT id, name, created_by, invite_code FROM families WHERE id = ?',
      [familyId]
    );

    if (families.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Family not found'
        }
      });
    }

    const family = families[0];

    // Get family members
    const [members] = await pool.execute(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.profile_photo_url,
        fm.role
      FROM family_members fm
      INNER JOIN users u ON fm.user_id = u.id
      WHERE fm.family_id = ?
      ORDER BY fm.role DESC, fm.joined_at ASC`,
      [familyId]
    );

    // Get recipe count
    const [recipeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM recipes WHERE family_id = ? AND deleted_at IS NULL',
      [familyId]
    );

    res.json({
      ...family,
      members,
      recipe_count: recipeCount[0].count
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/families/:familyId
 * Update family (admin only)
 */
router.patch('/:familyId', async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const { name } = req.body;

    // Check if user is admin
    const [memberships] = await pool.execute(
      'SELECT role FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, req.user.id]
    );

    if (memberships.length === 0 || memberships[0].role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only family admins can update family'
        }
      });
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Family name is required',
          details: { name: 'Family name cannot be empty' }
        }
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Family name must be 255 characters or less',
          details: { name: 'Family name too long' }
        }
      });
    }

    // Update family
    await pool.execute(
      'UPDATE families SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), familyId]
    );

    // Get updated family
    const [families] = await pool.execute(
      'SELECT id, name, created_by, invite_code FROM families WHERE id = ?',
      [familyId]
    );

    res.json(families[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/families/:familyId/invite
 * Generate invite code/link (admin only)
 */
router.post('/:familyId/invite', async (req, res, next) => {
  try {
    const { familyId } = req.params;

    // Check if user is admin
    const [memberships] = await pool.execute(
      'SELECT role FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, req.user.id]
    );

    if (memberships.length === 0 || memberships[0].role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only family admins can generate invites'
        }
      });
    }

    // Get family invite code
    const [families] = await pool.execute(
      'SELECT invite_code FROM families WHERE id = ?',
      [familyId]
    );

    if (families.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Family not found'
        }
      });
    }

    const inviteCode = families[0].invite_code;
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/join?code=${inviteCode}`;

    res.json({
      invite_code: inviteCode,
      invite_link: inviteLink
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/families/join
 * Join a family using invite code
 */
router.post('/join', async (req, res, next) => {
  try {
    const { invite_code } = req.body;

    // Validation
    if (!invite_code) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invite code is required',
          details: { invite_code: 'Invite code cannot be empty' }
        }
      });
    }

    // Find family by invite code
    const [families] = await pool.execute(
      'SELECT id, name FROM families WHERE invite_code = ?',
      [invite_code]
    );

    if (families.length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid invite code'
        }
      });
    }

    const family = families[0];

    // Check if already a member
    const [existingMembership] = await pool.execute(
      'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
      [family.id, req.user.id]
    );

    if (existingMembership.length > 0) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'You are already a member of this family'
        }
      });
    }

    // Add user as member
    await pool.execute(
      'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)',
      [family.id, req.user.id, 'member']
    );

    res.json({
      family: {
        id: family.id,
        name: family.name
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/families/:familyId/members/:userId
 * Remove member from family (admin only, or self)
 */
router.delete('/:familyId/members/:userId', async (req, res, next) => {
  try {
    const { familyId, userId } = req.params;

    // Check if user is admin or removing themselves
    const [memberships] = await pool.execute(
      'SELECT role FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, req.user.id]
    );

    if (memberships.length === 0) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not a member of this family'
        }
      });
    }

    const isAdmin = memberships[0].role === 'admin';
    const isSelf = parseInt(userId) === req.user.id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only family admins can remove members, or you can remove yourself'
        }
      });
    }

    // Check if removing member exists
    const [memberExists] = await pool.execute(
      'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, userId]
    );

    if (memberExists.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Member not found'
        }
      });
    }

    // Remove member
    await pool.execute(
      'DELETE FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, userId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

