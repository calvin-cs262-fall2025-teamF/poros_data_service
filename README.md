# Poros Data Service

This repository contains the complete backend for the Poros application:
- PostgreSQL database schema and seed data
- RESTful API service (Node.js/Express/TypeScript)

## Project Structure

```
poros_data_service/
├── sql/
│   ├── poros.sql              # Database schema and seed data
│   └── poros-queries.sql      # Example queries
├── src/                       # API source code
│   ├── config/                # Database configuration
│   ├── middleware/            # Auth and error handling
│   ├── routes/                # API route handlers
│   ├── utils/                 # Utilities (transform, auth)
│   └── index.ts               # Main server file
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
└── API_README.md              # Detailed API documentation
```

## Quick Start

### 1. Set Up Database

```bash
# Create database
createdb poros

# Load schema and seed data
psql poros < sql/poros.sql
```

### 2. Set Up API

```bash
# Install dependencies
npm install

# Create .env file (see API_README.md for details)
cp .env.example .env
# Edit .env with your database credentials

# Start the API server
npm run dev
```

The API will be available at `http://localhost:3000`

## Documentation

- **[API_README.md](./API_README.md)** - Complete API documentation with all endpoints
- **[SETUP.md](./SETUP.md)** - Setup instructions

## Features

✅ PostgreSQL database schema  
✅ RESTful API with TypeScript  
✅ JWT authentication  
✅ Automatic data transformation (snake_case ↔ camelCase)  
✅ Input validation  
✅ Error handling  
✅ CORS and security headers  

## API Endpoints Overview

- **Authentication**: `/api/auth/signup`, `/api/auth/login`
- **Users**: `/api/users/:id` (profile, targets, stats)
- **Companies**: `/api/companies` (list, details with events/courses/checklist)
- **Applications**: `/api/applications` (CRUD operations)
- **Resumes**: `/api/resumes` (upload, manage, tailor)
- **Checklist**: `/api/checklist` (user-specific checklist items)

See [API_README.md](./API_README.md) for complete documentation.

## Testing

Test the database schema:
```bash
./test_sql.sh
```

Test the API:
```bash
# Start the server
npm run dev

# In another terminal, test endpoints
curl http://localhost:3000/health
```

## Development

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Start production server
npm start
```

## Deployment

The service is configured to work with **Supabase** for the database and **Vercel** for hosting.

### Quick Start 🚀

**Database Setup:** See [SUPABASE_QUICKSTART.md](./SUPABASE_QUICKSTART.md) for Supabase setup.

**API Deployment:** See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for deploying to Vercel.

**Client Integration:** See [CLIENT_INTEGRATION_SUPABASE.md](./CLIENT_INTEGRATION_SUPABASE.md) for connecting your client.

### Detailed Guides

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup guide
- **[CLIENT_INTEGRATION_SUPABASE.md](./CLIENT_INTEGRATION_SUPABASE.md)** - Client app integration

## Next Steps

1. ✅ Database schema - **DONE**
2. ✅ Backend API service - **DONE**
3. ✅ Supabase configuration - **DONE**
4. ⚠️ Set up Supabase project - **TODO** (follow SUPABASE_QUICKSTART.md)
5. ⚠️ Deploy API service - **TODO** (Vercel/Railway/Render)
6. ⚠️ Connect Client to API - **TODO** (follow CLIENT_INTEGRATION_SUPABASE.md)
