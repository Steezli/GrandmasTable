# Grandma's Table

A family recipe sharing application where families can share their recipes with each other, with options for private (family-only) or public sharing.

## Tech Stack

- **Frontend:** Vue.js (Options API)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (SQL)

## Project Structure

```
GrandmasTable/
├── backend/          # Backend API (Node.js, Express)
├── frontend/         # Frontend app (Vue.js)
├── features/         # Feature documentation
└── specialists/      # Specialist role definitions
```

## Getting Started

### Backend Setup

See [backend/README.md](./backend/README.md) for backend setup instructions.

### Frontend Setup

Coming soon...

## Features (MVP)

- ✅ User authentication (register, login, JWT tokens)
- ✅ Family management (create, join, invite members)
- ✅ Recipe CRUD operations
- ✅ Recipe privacy toggle (family-only vs public)
- ⏳ Recipe photos (upload, display)
- ⏳ Search & filtering
- ⏳ User profile & settings

## Development Workflow

This project uses a specialist-based development workflow:
- **PM** - Routes work and makes decisions
- **UI/UX Designer** - Creates designs and interaction specs
- **Backend Developer** - Implements API routes and database
- **Frontend Developer** - Implements UI components
- **Tech Lead** - Reviews architecture and provides feedback

See [features/grandmas-table-app-scaffold.md](./features/grandmas-table-app-scaffold.md) for detailed planning documentation.

