# Grandma's Table - Backend API

Backend API for Grandma's Table recipe sharing application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=grandmas_table
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
```

4. Create database and run migrations:
```bash
mysql -u root -p < migrations/001_initial_schema.sql
```

Or import the SQL file manually in your MySQL client.

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Families
- `GET /api/families` - Get all families for current user
- `POST /api/families` - Create a new family
- `GET /api/families/:familyId` - Get family details
- `PATCH /api/families/:familyId` - Update family (admin only)
- `POST /api/families/:familyId/invite` - Generate invite code/link (admin only)
- `POST /api/families/join` - Join family using invite code
- `DELETE /api/families/:familyId/members/:userId` - Remove member (admin or self)

### Recipes
- `GET /api/families/:familyId/recipes` - Get recipes for a family (with pagination, search, filters)
- `GET /api/recipes/:recipeId` - Get recipe by ID (requires family membership or public)
- `GET /api/recipes/public/:slug` - Get public recipe by slug (no auth required)
- `POST /api/families/:familyId/recipes` - Create recipe (requires family membership)
- `PATCH /api/recipes/:recipeId` - Update recipe (creator only)
- `DELETE /api/recipes/:recipeId` - Soft delete recipe (creator only)
- `GET /api/recipes/search` - Search recipes (family member or public)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `MAX_FILE_SIZE` - Max file upload size in bytes (default: 5242880 = 5MB)
- `UPLOAD_DIR` - Upload directory (default: ./uploads)

