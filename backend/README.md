# Grandma's Table Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
```bash
mysql -u root -p < migrations/001_initial_schema.sql
```

3. Create `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=grandmas_table
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

4. Run the server:
```bash
npm start
```

## API Documentation

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

### Family Routes

- `GET /api/families` - Get all families for current user (requires auth)
- `POST /api/families` - Create a new family (requires auth)
- `GET /api/families/:familyId` - Get family details (requires auth)
- `PATCH /api/families/:familyId` - Update family (requires auth, admin only)
- `POST /api/families/:familyId/invite` - Invite member via email (requires auth, admin only)
- `POST /api/families/join` - Join family with invite code (requires auth)
- `DELETE /api/families/:familyId/members/:userId` - Remove member (requires auth, admin or self)

### Recipe Routes

- `GET /api/families/:familyId/recipes` - Get recipes for a family (requires auth, family membership)
- `POST /api/families/:familyId/recipes` - Create a new recipe (requires auth, family membership)
- `GET /api/recipes/:recipeId` - Get recipe details (requires auth if private)
- `GET /api/recipes/public/:slug` - Get public recipe by slug (no auth required)
- `PATCH /api/recipes/:recipeId` - Update recipe (requires auth, creator only)
- `DELETE /api/recipes/:recipeId` - Delete recipe (requires auth, creator only)
- `GET /api/recipes/search` - Search recipes (requires auth)

## Photo Upload

**Current Implementation (MVP):**
- Photos are uploaded as base64-encoded strings in the recipe creation/update payload
- The `photos` array in the recipe payload contains objects with `photo_url` (base64 data URL), `is_primary`, and `order`
- Photos are stored directly in the `recipe_photos` table with the base64 data URL as the `photo_url`

**Future Implementation (v2):**
- Implement separate photo upload route: `POST /api/recipes/:recipeId/photos`
- Upload photos to file storage (S3, local filesystem, or CDN)
- Store photo URLs (not base64) in the database
- Support multipart/form-data uploads with proper file validation

**Why Base64 for MVP:**
- Simpler implementation
- No need for file storage infrastructure
- Works for MVP with reasonable file sizes
- Can be migrated to file uploads in v2 without breaking changes

## Database Schema

See `migrations/001_initial_schema.sql` for the complete database schema.

## Error Handling

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained via `/api/auth/login` or `/api/auth/register`.
