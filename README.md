# Poros Data Service (Backend)

The backend API for the Poros application, built with Node.js, Express, and PostgreSQL (Supabase).

## 🚀 Quick Start (Team Onboarding)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
You need a `.env` file in this directory. Ask the project lead for the current keys.

**Required Variables:**
```env
PORT=3000
DATABASE_URL=postgres://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=[secret]
# ... any other backend keys
```

### 3. Run the Server
Since we use a **Shared Database**, you do **NOT** need to run any migrations. The database is already set up.

```bash
npm run dev
```
The server will start at `http://localhost:3000`.

---

## Database Schema
We rely on a cloud Supabase database.
- **Shared Database:** We all use the same `DATABASE_URL`. You will see the same users and data. **Be careful:** deleting data here affects everyone.

## Features
- RESTful API with TypeScript
- JWT Authentication
- PostgreSQL Database (Supabase)
- File Storage (BYTEA) for Resumes

## API Endpoints
- **Auth**: `/api/auth/signup`, `/api/auth/login`
- **Users**: `/api/users/:id`
- **Resumes**: `/api/resumes` (Cloud storage enabled)
- **Companies**: `/api/companies`
- **Applications**: `/api/applications`
