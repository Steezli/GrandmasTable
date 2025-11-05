const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { generatePublicSlug } = require('../utils/crypto');

const router = express.Router();

/**
 * GET /api/families/:familyId/recipes
 * Get recipes for a family (requires family membership)
 */
router.get('/:familyId/recipes', authenticateToken, async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const { search, category, tag, creator_id, page = 1, limit = 20 } = req.query;

    // Check if user is family member
    const [memberships] = await pool.execute(
      'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
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

    // Build query
    let query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_by,
        r.created_at,
        r.updated_at,
        r.is_public,
        (SELECT photo_url FROM recipe_photos WHERE recipe_id = r.id AND is_primary = TRUE LIMIT 1) as primary_photo_url
      FROM recipes r
      WHERE r.family_id = ? AND r.deleted_at IS NULL
    `;

    const params = [familyId];

    // Add filters
    if (search) {
      query += ` AND (MATCH(r.name, r.description, r.notes) AGAINST(? IN NATURAL LANGUAGE MODE) OR r.name LIKE ? OR r.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(search, searchTerm, searchTerm);
    }

    if (category) {
      query += ` AND EXISTS (SELECT 1 FROM recipe_categories WHERE recipe_id = r.id AND category = ?)`;
      params.push(category);
    }

    if (tag) {
      query += ` AND EXISTS (SELECT 1 FROM recipe_tags WHERE recipe_id = r.id AND tag = ?)`;
      params.push(tag);
    }

    if (creator_id) {
      query += ` AND r.created_by = ?`;
      params.push(creator_id);
    }

    query += ` ORDER BY r.updated_at DESC`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [recipes] = await pool.execute(query, params);

    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recipes/:recipeId
 * Get recipe by ID (requires family membership or public access)
 */
router.get('/:recipeId', async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    // Get recipe
    const [recipes] = await pool.execute(
      `SELECT 
        r.*,
        f.name as family_name,
        f.id as family_id
      FROM recipes r
      INNER JOIN families f ON r.family_id = f.id
      WHERE r.id = ? AND r.deleted_at IS NULL`,
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Recipe not found'
        }
      });
    }

    const recipe = recipes[0];

    // Check access
    // If public, allow access
    if (recipe.is_public) {
      // Continue to fetch full recipe
    } else {
      // If not public, require authentication and family membership
      if (!token) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
      }

      // Verify token and check membership
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [memberships] = await pool.execute(
          'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
          [recipe.family_id, decoded.userId]
        );

        if (memberships.length === 0) {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'You are not a member of this family'
            }
          });
        }
      } catch (err) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid token'
          }
        });
      }
    }

    // Get ingredients
    const [ingredients] = await pool.execute(
      'SELECT quantity, ingredient, `order` FROM recipe_ingredients WHERE recipe_id = ? ORDER BY `order` ASC',
      [recipeId]
    );

    // Get instructions
    const [instructions] = await pool.execute(
      'SELECT step_number, instruction FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number ASC',
      [recipeId]
    );

    // Get photos
    const [photos] = await pool.execute(
      'SELECT id, photo_url, is_primary, `order` FROM recipe_photos WHERE recipe_id = ? ORDER BY `order` ASC, created_at ASC',
      [recipeId]
    );

    // Get tags
    const [tags] = await pool.execute(
      'SELECT tag FROM recipe_tags WHERE recipe_id = ?',
      [recipeId]
    );

    // Get categories
    const [categories] = await pool.execute(
      'SELECT category FROM recipe_categories WHERE recipe_id = ?',
      [recipeId]
    );

    // Get creator info
    const [creators] = await pool.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [recipe.created_by]
    );

    res.json({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      is_public: recipe.is_public,
      public_slug: recipe.public_slug,
      notes: recipe.notes,
      status: recipe.status,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      family: {
        id: recipe.family_id,
        name: recipe.family_name
      },
      creator: creators[0] ? {
        id: creators[0].id,
        name: creators[0].name
      } : null,
      ingredients: ingredients.map(ing => ({
        quantity: ing.quantity,
        ingredient: ing.ingredient,
        order: ing.order
      })),
      instructions: instructions.map(inst => ({
        step_number: inst.step_number,
        instruction: inst.instruction
      })),
      photos: photos.map(photo => ({
        id: photo.id,
        photo_url: photo.photo_url,
        is_primary: photo.is_primary,
        order: photo.order
      })),
      tags: tags.map(t => t.tag),
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recipes/public/:slug
 * Get public recipe by slug (no auth required)
 */
router.get('/public/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Get recipe by public slug
    const [recipes] = await pool.execute(
      `SELECT 
        r.*,
        f.name as family_name,
        f.id as family_id
      FROM recipes r
      INNER JOIN families f ON r.family_id = f.id
      WHERE r.public_slug = ? AND r.is_public = TRUE AND r.deleted_at IS NULL`,
      [slug]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Recipe not found or not public'
        }
      });
    }

    const recipe = recipes[0];
    const recipeId = recipe.id;

    // Get all recipe details (same as GET /api/recipes/:recipeId)
    const [ingredients] = await pool.execute(
      'SELECT quantity, ingredient, `order` FROM recipe_ingredients WHERE recipe_id = ? ORDER BY `order` ASC',
      [recipeId]
    );

    const [instructions] = await pool.execute(
      'SELECT step_number, instruction FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number ASC',
      [recipeId]
    );

    const [photos] = await pool.execute(
      'SELECT id, photo_url, is_primary, `order` FROM recipe_photos WHERE recipe_id = ? ORDER BY `order` ASC, created_at ASC',
      [recipeId]
    );

    const [tags] = await pool.execute(
      'SELECT tag FROM recipe_tags WHERE recipe_id = ?',
      [recipeId]
    );

    const [categories] = await pool.execute(
      'SELECT category FROM recipe_categories WHERE recipe_id = ?',
      [recipeId]
    );

    const [creators] = await pool.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [recipe.created_by]
    );

    res.json({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      is_public: recipe.is_public,
      public_slug: recipe.public_slug,
      notes: recipe.notes,
      status: recipe.status,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      family: {
        id: recipe.family_id,
        name: recipe.family_name
      },
      creator: creators[0] ? {
        id: creators[0].id,
        name: creators[0].name
      } : null,
      ingredients: ingredients.map(ing => ({
        quantity: ing.quantity,
        ingredient: ing.ingredient,
        order: ing.order
      })),
      instructions: instructions.map(inst => ({
        step_number: inst.step_number,
        instruction: inst.instruction
      })),
      photos: photos.map(photo => ({
        id: photo.id,
        photo_url: photo.photo_url,
        is_primary: photo.is_primary,
        order: photo.order
      })),
      tags: tags.map(t => t.tag),
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/families/:familyId/recipes
 * Create a new recipe (requires family membership)
 */
router.post('/:familyId/recipes', authenticateToken, async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const {
      name,
      description,
      prep_time_minutes,
      cook_time_minutes,
      servings,
      is_public,
      notes,
      status = 'published',
      ingredients = [],
      instructions = [],
      photos = [],
      tags = [],
      categories = []
    } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Recipe name is required',
          details: { name: 'Recipe name cannot be empty' }
        }
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Recipe name must be 255 characters or less',
          details: { name: 'Recipe name too long' }
        }
      });
    }

    // Check if user is family member
    const [memberships] = await pool.execute(
      'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
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

    // Generate public slug if making public
    let publicSlug = null;
    if (is_public) {
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        publicSlug = generatePublicSlug();
        const [existing] = await pool.execute(
          'SELECT id FROM recipes WHERE public_slug = ?',
          [publicSlug]
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
            message: 'Failed to generate unique public slug'
          }
        });
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create recipe
      const [result] = await connection.execute(
        `INSERT INTO recipes (
          family_id, created_by, name, description,
          prep_time_minutes, cook_time_minutes, servings,
          is_public, public_slug, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          familyId, req.user.id, name.trim(), description || null,
          prep_time_minutes || null, cook_time_minutes || null, servings || null,
          is_public || false, publicSlug, notes || null, status
        ]
      );

      const recipeId = result.insertId;

      // Insert ingredients
      if (ingredients.length > 0) {
        const ingredientValues = ingredients.map((ing, index) => [
          recipeId,
          ing.quantity || null,
          ing.ingredient,
          index + 1
        ]);
        await connection.query(
          'INSERT INTO recipe_ingredients (recipe_id, quantity, ingredient, `order`) VALUES ?',
          [ingredientValues]
        );
      }

      // Insert instructions
      if (instructions.length > 0) {
        const instructionValues = instructions.map((inst, index) => [
          recipeId,
          index + 1,
          inst.instruction || inst // Support both {instruction: "..."} and string
        ]);
        await connection.query(
          'INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES ?',
          [instructionValues]
        );
      }

      // Insert photos
      if (photos.length > 0) {
        const photoValues = photos.map((photo, index) => [
          recipeId,
          photo.photo_url,
          photo.is_primary || (index === 0), // First photo is primary by default
          photo.order || index + 1
        ]);
        await connection.query(
          'INSERT INTO recipe_photos (recipe_id, photo_url, is_primary, `order`) VALUES ?',
          [photoValues]
        );
      }

      // Insert tags
      if (tags.length > 0) {
        const tagValues = tags.map(tag => [recipeId, tag]);
        await connection.query(
          'INSERT INTO recipe_tags (recipe_id, tag) VALUES ?',
          [tagValues]
        );
      }

      // Insert categories
      if (categories.length > 0) {
        const categoryValues = categories.map(category => [recipeId, category]);
        await connection.query(
          'INSERT INTO recipe_categories (recipe_id, category) VALUES ?',
          [categoryValues]
        );
      }

      await connection.commit();

      // Fetch created recipe (same structure as GET)
      const [createdRecipes] = await pool.execute(
        `SELECT 
          r.*,
          f.name as family_name,
          f.id as family_id
        FROM recipes r
        INNER JOIN families f ON r.family_id = f.id
        WHERE r.id = ?`,
        [recipeId]
      );

      const recipe = createdRecipes[0];

      // Get all related data
      const [ingredientsData] = await pool.execute(
        'SELECT quantity, ingredient, `order` FROM recipe_ingredients WHERE recipe_id = ? ORDER BY `order` ASC',
        [recipeId]
      );

      const [instructionsData] = await pool.execute(
        'SELECT step_number, instruction FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number ASC',
        [recipeId]
      );

      const [photosData] = await pool.execute(
        'SELECT id, photo_url, is_primary, `order` FROM recipe_photos WHERE recipe_id = ? ORDER BY `order` ASC',
        [recipeId]
      );

      const [tagsData] = await pool.execute(
        'SELECT tag FROM recipe_tags WHERE recipe_id = ?',
        [recipeId]
      );

      const [categoriesData] = await pool.execute(
        'SELECT category FROM recipe_categories WHERE recipe_id = ?',
        [recipeId]
      );

      const [creatorsData] = await pool.execute(
        'SELECT id, name FROM users WHERE id = ?',
        [recipe.created_by]
      );

      res.status(201).json({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        is_public: recipe.is_public,
        public_slug: recipe.public_slug,
        notes: recipe.notes,
        status: recipe.status,
        created_at: recipe.created_at,
        updated_at: recipe.updated_at,
        family: {
          id: recipe.family_id,
          name: recipe.family_name
        },
        creator: creatorsData[0] ? {
          id: creatorsData[0].id,
          name: creatorsData[0].name
        } : null,
        ingredients: ingredientsData.map(ing => ({
          quantity: ing.quantity,
          ingredient: ing.ingredient,
          order: ing.order
        })),
        instructions: instructionsData.map(inst => ({
          step_number: inst.step_number,
          instruction: inst.instruction
        })),
        photos: photosData.map(photo => ({
          id: photo.id,
          photo_url: photo.photo_url,
          is_primary: photo.is_primary,
          order: photo.order
        })),
        tags: tagsData.map(t => t.tag),
        categories: categoriesData.map(c => c.category)
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/recipes/:recipeId
 * Update recipe (creator only)
 */
router.patch('/:recipeId', authenticateToken, async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const {
      name,
      description,
      prep_time_minutes,
      cook_time_minutes,
      servings,
      is_public,
      notes,
      status,
      ingredients,
      instructions,
      photos,
      tags,
      categories
    } = req.body;

    // Check if user is creator
    const [recipes] = await pool.execute(
      'SELECT created_by, family_id, is_public, public_slug FROM recipes WHERE id = ? AND deleted_at IS NULL',
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Recipe not found'
        }
      });
    }

    const recipe = recipes[0];

    if (recipe.created_by !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the recipe creator can update this recipe'
        }
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Handle public slug if privacy changed
      let publicSlug = recipe.public_slug;
      if (is_public !== undefined && is_public !== recipe.is_public) {
        if (is_public && !publicSlug) {
          // Generate new slug if making public
          let isUnique = false;
          let attempts = 0;
          const maxAttempts = 10;

          while (!isUnique && attempts < maxAttempts) {
            publicSlug = generatePublicSlug();
            const [existing] = await connection.execute(
              'SELECT id FROM recipes WHERE public_slug = ?',
              [publicSlug]
            );
            if (existing.length === 0) {
              isUnique = true;
            }
            attempts++;
          }

          if (!isUnique) {
            throw new Error('Failed to generate unique public slug');
          }
        }
      }

      // Update recipe
      const updateFields = [];
      const updateValues = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name.trim());
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description || null);
      }
      if (prep_time_minutes !== undefined) {
        updateFields.push('prep_time_minutes = ?');
        updateValues.push(prep_time_minutes || null);
      }
      if (cook_time_minutes !== undefined) {
        updateFields.push('cook_time_minutes = ?');
        updateValues.push(cook_time_minutes || null);
      }
      if (servings !== undefined) {
        updateFields.push('servings = ?');
        updateValues.push(servings || null);
      }
      if (is_public !== undefined) {
        updateFields.push('is_public = ?');
        updateValues.push(is_public);
      }
      if (publicSlug !== undefined) {
        updateFields.push('public_slug = ?');
        updateValues.push(publicSlug);
      }
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes || null);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(recipeId);

        await connection.execute(
          `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Update ingredients if provided
      if (ingredients !== undefined) {
        await connection.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);
        if (ingredients.length > 0) {
          const ingredientValues = ingredients.map((ing, index) => [
            recipeId,
            ing.quantity || null,
            ing.ingredient,
            index + 1
          ]);
          await connection.query(
            'INSERT INTO recipe_ingredients (recipe_id, quantity, ingredient, `order`) VALUES ?',
            [ingredientValues]
          );
        }
      }

      // Update instructions if provided
      if (instructions !== undefined) {
        await connection.execute('DELETE FROM recipe_instructions WHERE recipe_id = ?', [recipeId]);
        if (instructions.length > 0) {
          const instructionValues = instructions.map((inst, index) => [
            recipeId,
            index + 1,
            inst.instruction || inst
          ]);
          await connection.query(
            'INSERT INTO recipe_instructions (recipe_id, step_number, instruction) VALUES ?',
            [instructionValues]
          );
        }
      }

      // Update photos if provided
      if (photos !== undefined) {
        await connection.execute('DELETE FROM recipe_photos WHERE recipe_id = ?', [recipeId]);
        if (photos.length > 0) {
          const photoValues = photos.map((photo, index) => [
            recipeId,
            photo.photo_url,
            photo.is_primary || (index === 0),
            photo.order || index + 1
          ]);
          await connection.query(
            'INSERT INTO recipe_photos (recipe_id, photo_url, is_primary, `order`) VALUES ?',
            [photoValues]
          );
        }
      }

      // Update tags if provided
      if (tags !== undefined) {
        await connection.execute('DELETE FROM recipe_tags WHERE recipe_id = ?', [recipeId]);
        if (tags.length > 0) {
          const tagValues = tags.map(tag => [recipeId, tag]);
          await connection.query(
            'INSERT INTO recipe_tags (recipe_id, tag) VALUES ?',
            [tagValues]
          );
        }
      }

      // Update categories if provided
      if (categories !== undefined) {
        await connection.execute('DELETE FROM recipe_categories WHERE recipe_id = ?', [recipeId]);
        if (categories.length > 0) {
          const categoryValues = categories.map(category => [recipeId, category]);
          await connection.query(
            'INSERT INTO recipe_categories (recipe_id, category) VALUES ?',
            [categoryValues]
          );
        }
      }

      await connection.commit();

      // Fetch updated recipe (same as GET)
      const [updatedRecipes] = await pool.execute(
        `SELECT 
          r.*,
          f.name as family_name,
          f.id as family_id
        FROM recipes r
        INNER JOIN families f ON r.family_id = f.id
        WHERE r.id = ?`,
        [recipeId]
      );

      const recipe = updatedRecipes[0];

      // Get all related data
      const [ingredientsData] = await pool.execute(
        'SELECT quantity, ingredient, `order` FROM recipe_ingredients WHERE recipe_id = ? ORDER BY `order` ASC',
        [recipeId]
      );

      const [instructionsData] = await pool.execute(
        'SELECT step_number, instruction FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number ASC',
        [recipeId]
      );

      const [photosData] = await pool.execute(
        'SELECT id, photo_url, is_primary, `order` FROM recipe_photos WHERE recipe_id = ? ORDER BY `order` ASC',
        [recipeId]
      );

      const [tagsData] = await pool.execute(
        'SELECT tag FROM recipe_tags WHERE recipe_id = ?',
        [recipeId]
      );

      const [categoriesData] = await pool.execute(
        'SELECT category FROM recipe_categories WHERE recipe_id = ?',
        [recipeId]
      );

      const [creatorsData] = await pool.execute(
        'SELECT id, name FROM users WHERE id = ?',
        [recipe.created_by]
      );

      res.json({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        is_public: recipe.is_public,
        public_slug: recipe.public_slug,
        notes: recipe.notes,
        status: recipe.status,
        created_at: recipe.created_at,
        updated_at: recipe.updated_at,
        family: {
          id: recipe.family_id,
          name: recipe.family_name
        },
        creator: creatorsData[0] ? {
          id: creatorsData[0].id,
          name: creatorsData[0].name
        } : null,
        ingredients: ingredientsData.map(ing => ({
          quantity: ing.quantity,
          ingredient: ing.ingredient,
          order: ing.order
        })),
        instructions: instructionsData.map(inst => ({
          step_number: inst.step_number,
          instruction: inst.instruction
        })),
        photos: photosData.map(photo => ({
          id: photo.id,
          photo_url: photo.photo_url,
          is_primary: photo.is_primary,
          order: photo.order
        })),
        tags: tagsData.map(t => t.tag),
        categories: categoriesData.map(c => c.category)
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/recipes/:recipeId
 * Soft delete recipe (creator only)
 */
router.delete('/:recipeId', authenticateToken, async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    // Check if user is creator
    const [recipes] = await pool.execute(
      'SELECT created_by FROM recipes WHERE id = ? AND deleted_at IS NULL',
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Recipe not found'
        }
      });
    }

    if (recipes[0].created_by !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the recipe creator can delete this recipe'
        }
      });
    }

    // Soft delete
    await pool.execute(
      'UPDATE recipes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [recipeId]
    );

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recipes/search
 * Search recipes (family member or public)
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, family_id, category, tag, page = 1, limit = 20 } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    let query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        r.created_by,
        r.created_at,
        r.updated_at,
        r.is_public,
        (SELECT photo_url FROM recipe_photos WHERE recipe_id = r.id AND is_primary = TRUE LIMIT 1) as primary_photo_url
      FROM recipes r
      WHERE r.deleted_at IS NULL
    `;

    const params = [];

    // Filter by family if provided
    if (family_id) {
      query += ` AND r.family_id = ?`;
      params.push(family_id);
    } else {
      // If no family_id, only show public recipes or user's family recipes
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          // Get user's families
          const [userFamilies] = await pool.execute(
            'SELECT family_id FROM family_members WHERE user_id = ?',
            [decoded.userId]
          );
          
          const familyIds = userFamilies.map(f => f.family_id);
          
          if (familyIds.length > 0) {
            query += ` AND (r.is_public = TRUE OR r.family_id IN (${familyIds.map(() => '?').join(',')}))`;
            params.push(...familyIds);
          } else {
            query += ` AND r.is_public = TRUE`;
          }
        } catch (err) {
          // Invalid token, only show public
          query += ` AND r.is_public = TRUE`;
        }
      } else {
        // No token, only public
        query += ` AND r.is_public = TRUE`;
      }
    }

    // Search term
    if (q) {
      query += ` AND (MATCH(r.name, r.description, r.notes) AGAINST(? IN NATURAL LANGUAGE MODE) OR r.name LIKE ? OR r.description LIKE ?)`;
      const searchTerm = `%${q}%`;
      params.push(q, searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      query += ` AND EXISTS (SELECT 1 FROM recipe_categories WHERE recipe_id = r.id AND category = ?)`;
      params.push(category);
    }

    // Tag filter
    if (tag) {
      query += ` AND EXISTS (SELECT 1 FROM recipe_tags WHERE recipe_id = r.id AND tag = ?)`;
      params.push(tag);
    }

    query += ` ORDER BY r.updated_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [recipes] = await pool.execute(query, params);

    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

