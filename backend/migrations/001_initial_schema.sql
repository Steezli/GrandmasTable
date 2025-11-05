-- Create database if not exists
CREATE DATABASE IF NOT EXISTS grandmas_table;
USE grandmas_table;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_photo_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Families table
CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_by INTEGER NOT NULL,
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Family members table
CREATE TABLE IF NOT EXISTS family_members (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  family_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_family_user (family_id, user_id),
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  family_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  prep_time_minutes INTEGER NULL,
  cook_time_minutes INTEGER NULL,
  servings INTEGER NULL,
  is_public BOOLEAN DEFAULT FALSE,
  public_slug VARCHAR(100) UNIQUE NULL,
  notes TEXT NULL,
  status ENUM('draft', 'published') DEFAULT 'published',
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_family_id (family_id),
  INDEX idx_created_by (created_by),
  INDEX idx_is_public (is_public),
  INDEX idx_public_slug (public_slug),
  FULLTEXT INDEX idx_search (name, description, notes),
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  recipe_id INTEGER NOT NULL,
  quantity VARCHAR(50) NULL,
  ingredient VARCHAR(255) NOT NULL,
  `order` INTEGER NOT NULL,
  INDEX idx_recipe_id (recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Recipe instructions table
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  recipe_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  INDEX idx_recipe_id (recipe_id),
  UNIQUE KEY unique_recipe_step (recipe_id, step_number),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Recipe photos table
CREATE TABLE IF NOT EXISTS recipe_photos (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  recipe_id INTEGER NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  `order` INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipe_id (recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Recipe tags table
CREATE TABLE IF NOT EXISTS recipe_tags (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  recipe_id INTEGER NOT NULL,
  tag VARCHAR(50) NOT NULL,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_tag (tag),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Recipe categories table
CREATE TABLE IF NOT EXISTS recipe_categories (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  recipe_id INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_category (category),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

