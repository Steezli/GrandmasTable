# Grandma's Table

A family recipe sharing application for preserving and sharing generational recipes privately within families, with optional public sharing.

## Tech Stack

- **Frontend:** Vue.js 3 (Options API), Vite, Vue Router
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** (comes with Node.js) or **yarn**

### Verify Installation

```bash
node --version  # Should be v16+
npm --version  # Should be 6+
mysql --version  # Should be 8.0+
```

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd GrandmasTable
```

### Step 2: Set Up MySQL Database

1. **Start MySQL Server**

   - **macOS:** `brew services start mysql` or start MySQL from System Preferences
   - **Linux:** `sudo systemctl start mysql`
   - **Windows:** Start MySQL from Services or MySQL Workbench

2. **Create Database**

   ```bash
   mysql -u root -p
   ```

   Then in MySQL prompt:

   ```sql
   CREATE DATABASE grandmas_table;
   EXIT;
   ```

3. **Run Migration**

   ```bash
   mysql -u root -p grandmas_table < backend/migrations/001_initial_schema.sql
   ```

   Or if you're already in MySQL:

   ```sql
   USE grandmas_table;
   SOURCE backend/migrations/001_initial_schema.sql;
   ```

### Step 3: Configure Backend Environment

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create `.env` file**

   ```bash
   # Create .env file manually:
   touch .env
   ```

   **Note:** If you see `.env.example`, you can copy it: `cp .env.example .env`

3. **Edit `.env` file** with your database credentials:

   ```env
   DB_HOST=localhost
   DB_USER=
   DB_PASSWORD=
   DB_NAME=grandmas_table
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=3000
   ```

   **Important:** 
   - Set `DB_USER` to your MySQL username (leave empty for default user)
   - Set `DB_PASSWORD` to your MySQL password (leave empty if no password)
   - Generate a secure JWT_SECRET (see below)

4. **Generate JWT_SECRET**

   You need a secure random string for JWT_SECRET. Here are several ways to generate one:

   **Option 1: Using Node.js (recommended)**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   **Option 2: Using OpenSSL**
   ```bash
   openssl rand -hex 64
   ```

   **Option 3: Using Python**
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(64))"
   ```

   **Option 4: Using online generator**
   - Visit https://generate-secret.vercel.app/64 (or similar)
   - Copy the generated string

   Copy the generated string and paste it as the value for `JWT_SECRET` in your `.env` file.

5. **Install backend dependencies**

   ```bash
   npm install
   ```

### Step 4: Configure Frontend Environment

1. **Navigate to frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

   **Note:** The frontend is configured to proxy API requests to `http://localhost:3000` (see `vite.config.js`). No environment configuration needed for development.

### Step 5: Start the Development Servers

You'll need **two terminal windows/tabs** - one for backend, one for frontend.

#### Terminal 1: Backend Server

```bash
cd backend
npm start
```

You should see:
```
Server running on port 3000
```

**Test the backend:**
- Open `http://localhost:3000/api/health` in your browser
- You should see: `{"status":"ok","message":"Grandma's Table API is running"}`

#### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

**Open the application:**
- Open `http://localhost:8080` in your browser
- You should see the landing page

## First Time Setup

1. **Register a new account**
   - Click "Sign Up" on the landing page
   - Enter your name, email, and password
   - Click "Create Account"

2. **Create or join a family**
   - After registration, you'll be prompted to create or join a family
   - Create your first family with a name (e.g., "Smith Family Recipes")
   - Or join an existing family using an invite code

3. **Start adding recipes!**
   - Click "Add Recipe" on the dashboard
   - Fill in recipe details, ingredients, instructions
   - Upload photos (base64 for MVP)
   - Save and share with your family

## Project Structure

```
GrandmasTable/
├── backend/              # Node.js/Express backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Authentication middleware
│   ├── migrations/       # Database schema migrations
│   ├── routes/           # API routes (auth, families, recipes)
│   ├── utils/            # Utility functions (crypto, etc.)
│   ├── server.js         # Express server entry point
│   └── package.json      # Backend dependencies
│
├── frontend/             # Vue.js frontend
│   ├── src/
│   │   ├── components/  # Vue components
│   │   │   ├── common/   # Reusable components (Button, Input, etc.)
│   │   │   ├── family/   # Family-related components
│   │   │   ├── layout/   # Layout components (Header, Sidebar, etc.)
│   │   │   └── recipe/   # Recipe-related components
│   │   ├── services/     # API service layer
│   │   ├── store/         # State management (auth, family)
│   │   ├── views/         # Page views (Dashboard, Login, etc.)
│   │   ├── router/        # Vue Router configuration
│   │   ├── styles/        # Global styles
│   │   └── utils/         # Utility functions
│   ├── index.html         # HTML entry point
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

### Families
- `GET /api/families` - Get all families for current user
- `POST /api/families` - Create a new family
- `GET /api/families/:familyId` - Get family details
- `PATCH /api/families/:familyId` - Update family (admin only)
- `POST /api/families/:familyId/invite` - Invite member via email
- `POST /api/families/join` - Join family with invite code
- `DELETE /api/families/:familyId/members/:userId` - Remove member

### Recipes
- `GET /api/families/:familyId/recipes` - Get recipes for a family
- `POST /api/families/:familyId/recipes` - Create a new recipe
- `GET /api/recipes/:recipeId` - Get recipe details
- `GET /api/recipes/public/:slug` - Get public recipe by slug
- `PATCH /api/recipes/:recipeId` - Update recipe (creator only)
- `DELETE /api/recipes/:recipeId` - Delete recipe (creator only)
- `GET /api/recipes/search` - Search recipes

See `backend/README.md` for detailed API documentation.

## Troubleshooting

### Backend Issues

**Error: "Cannot connect to MySQL"**
- Check MySQL server is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
- Verify database credentials in `backend/.env`
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**Error: "Port 3000 already in use"**
- Change `PORT` in `backend/.env` to a different port (e.g., `3001`)
- Update frontend proxy in `frontend/vite.config.js` to match new port

   **Error: "JWT_SECRET is required" or "secretOrPrivateKey must have a value"**
   - Ensure `.env` file exists in `backend/` directory
   - Check that `JWT_SECRET` is set in `.env` (not empty)
   - Generate a JWT_SECRET using one of the methods in Step 3
   - Restart the backend server after updating `.env`

### Frontend Issues

**Error: "Cannot connect to API"**
- Ensure backend server is running on port 3000
- Check `frontend/vite.config.js` proxy configuration
- Verify backend health endpoint: `http://localhost:3000/api/health`

**Error: "Module not found"**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Port 8080 already in use**
- Change port in `frontend/vite.config.js`: `port: 8081`
- Or specify a port: `npm run dev -- --port 8081`

### Database Issues

**Error: "Table doesn't exist"**
- Run migration: `mysql -u root -p grandmas_table < backend/migrations/001_initial_schema.sql`

**Error: "Access denied for user"**
- Verify MySQL user and password in `backend/.env`
- Ensure MySQL user has privileges: `GRANT ALL PRIVILEGES ON grandmas_table.* TO 'root'@'localhost';`

### General Issues

**Dependencies not installing**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Changes not reflecting**
- Stop and restart both servers
- Clear browser cache
- Hard refresh: `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux)

## Development Scripts

### Backend

```bash
cd backend
npm start          # Start development server
npm run dev        # Start with nodemon (if installed)
```

### Frontend

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL host | Yes |
| `DB_USER` | MySQL username (leave empty for default user) | No |
| `DB_PASSWORD` | MySQL password (leave empty if no password) | No |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret key for JWT tokens (generate using methods in Step 3) | Yes |
| `PORT` | Server port | No (default: 3000) |

## Next Steps

- **Testing:** Set up test database and write tests
- **Deployment:** Configure production environment
- **Features:** Add new features based on user feedback
- **Performance:** Optimize queries and add caching
- **Security:** Review and enhance security measures

## Support

For issues or questions, please refer to:
- `backend/README.md` - Backend documentation
- `features/grandmas-table-app-scaffold.md` - Feature documentation and planning

## License

[Add your license here]
