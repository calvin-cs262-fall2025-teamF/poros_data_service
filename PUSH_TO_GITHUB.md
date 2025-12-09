# How to Push Changes to GitHub

## Quick Steps

### 1. Stage All Changes

```bash
git add .
```

This adds all modified and new files to staging.

### 2. Commit Changes

```bash
git commit -m "Add backend API service with Supabase integration"
```

Or use a more descriptive message:
```bash
git commit -m "Add complete backend API service

- Express/TypeScript API with authentication
- Supabase database integration
- All API endpoints (auth, users, companies, applications, resumes, checklist)
- GitHub Actions CI workflow
- Deployment configuration for Vercel"
```

### 3. Push to GitHub

```bash
git push origin Azurebranch
```

Or if you want to push to main:
```bash
git checkout -b main  # Create main branch
git push origin main
```

## For Team Collaboration

### Option 1: Push to Current Branch (Azurebranch)

```bash
git add .
git commit -m "Add backend API service"
git push origin Azurebranch
```

Team members can then:
```bash
git fetch origin
git checkout Azurebranch
git pull origin Azurebranch
```

### Option 2: Create a New Branch for This Feature

```bash
# Create and switch to new branch
git checkout -b feature/backend-api

# Add and commit
git add .
git commit -m "Add backend API service"

# Push new branch
git push origin feature/backend-api
```

Then create a Pull Request on GitHub for team review.

### Option 3: Push to Main Branch

```bash
# Switch to main (or create it)
git checkout -b main

# Add and commit
git add .
git commit -m "Add backend API service"

# Push to main
git push origin main
```

## Recommended: Use Pull Requests

For team collaboration, it's best to:

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/backend-api
   ```

2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add backend API service"
   ```

3. **Push the branch:**
   ```bash
   git push origin feature/backend-api
   ```

4. **Create a Pull Request on GitHub:**
   - Go to your GitHub repository
   - Click "Pull Requests" → "New Pull Request"
   - Select your branch
   - Add description
   - Request reviews from team members
   - Merge after approval

## What Will Be Pushed

- ✅ All source code (`src/`)
- ✅ API routes and middleware
- ✅ Database schema (`sql/`)
- ✅ Configuration files (`package.json`, `tsconfig.json`, `vercel.json`)
- ✅ Documentation (README, API_README, SETUP guides)
- ✅ GitHub Actions workflow
- ✅ Test scripts

## What Won't Be Pushed (Thanks to .gitignore)

- ❌ `node_modules/` - Dependencies (team will run `npm install`)
- ❌ `.env` - Environment variables (team creates their own)
- ❌ `dist/` - Build output (generated)
- ❌ `.DS_Store` - macOS system files

## After Pushing

Your team members can:

1. **Pull your changes:**
   ```bash
   git pull origin Azurebranch
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Create .env file with their own credentials
   cp .env.example .env
   # Edit .env
   ```

4. **Run the API:**
   ```bash
   npm run dev
   ```

## Quick Command Summary

```bash
# Add all changes
git add .

# Commit with message
git commit -m "Add backend API service"

# Push to current branch
git push origin Azurebranch

# Or push to new branch
git push origin feature/backend-api
```

That's it! Your team will be able to see and test your changes.



