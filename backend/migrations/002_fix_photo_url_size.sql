-- Migration: Fix photo_url column size to support base64 images
-- Date: 2024-12-19
-- Description: Change photo_url from VARCHAR(500) to TEXT to support base64-encoded images

ALTER TABLE recipe_photos MODIFY COLUMN photo_url TEXT NOT NULL;

