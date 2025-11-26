# Setup Guide - Environment Variables

## Backend Environment Variables

Create a file called `.env` in the `backend/` directory with the following variables:

### Required Variables

```env
# Database Connection
# Replace with your PostgreSQL connection details
# Format: postgresql://username:password@host:port/database?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/santa_tracker?schema=public"

# JWT Authentication Secret
# Generate a strong random secret (minimum 32 characters)
# You can generate one with: openssl rand -base64 32
JWT_SECRET="your-secret-key-change-in-production-minimum-32-characters"

# JWT Token Expiration
JWT_EXPIRES_IN="7d"

# Server Port
PORT=3001

# Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

### Configuration Details

#### DATABASE_URL

- **For local Postgres app**:

  - Default: `postgresql://postgres:postgres@localhost:5432/santa_tracker?schema=public`
  - Replace `postgres:postgres` with your Postgres app username and password
  - Replace `santa_tracker` with your database name if different

- **For Docker Compose**:

  - Use: `postgresql://santa:santa123@postgres:5432/santa_tracker?schema=public`
  - (This is already configured in docker-compose.yml)

- **For AWS RDS**:
  - Format: `postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/santa_tracker?schema=public`
  - Get your RDS endpoint from AWS Console

#### JWT_SECRET

- **Important**: Use a strong, random secret in production
- Generate one with: `openssl rand -base64 32`
- Or use any long random string (minimum 32 characters)
- Example: `"my-super-secret-jwt-key-12345-abcdefghijklmnop"`

#### FRONTEND_URL

- **Local development**: `http://localhost:5173` (Vite default port)
- **Production**: Your frontend domain, e.g., `https://santa-tracker.com`

---

## Frontend Environment Variables

Create a file called `.env` in the `frontend/` directory with the following:

```env
# API Base URL
# For local development:
VITE_API_URL=http://localhost:3001/api

# For production:
# VITE_API_URL=https://api.your-domain.com/api
```

### Configuration Details

#### VITE_API_URL

- **Local development**: `http://localhost:3001/api` (backend default port)
- **Production**: Your backend API domain, e.g., `https://api.santa-tracker.com/api`

---

## Quick Setup Steps

### 1. Backend Setup

```bash
cd backend

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/santa_tracker?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
EOF

# Or manually create .env and paste the content above
```

### 2. Frontend Setup

```bash
cd frontend

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
EOF

# Or manually create .env and paste the content above
```

### 3. Database Setup

Before running the backend, make sure:

1. **PostgreSQL is running** (via Postgres app or Docker)
2. **Database exists**:

   ```bash
   # Connect to PostgreSQL and create database
   createdb santa_tracker

   # Or using psql:
   psql -U postgres
   CREATE DATABASE santa_tracker;
   ```

3. **Run migrations**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

---

## Example .env Files

### backend/.env (Local Development)

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/santa_tracker?schema=public"
JWT_SECRET="my-development-secret-key-at-least-32-characters-long"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### frontend/.env (Local Development)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## Troubleshooting

### Database Connection Issues

- **Check PostgreSQL is running**: Look for the Postgres app icon or check with `pg_isready`
- **Verify credentials**: Make sure username/password in DATABASE_URL match your Postgres setup
- **Check database exists**: Run `psql -l` to list databases
- **Port conflict**: Default PostgreSQL port is 5432, make sure nothing else is using it

### CORS Issues

- **Frontend can't connect**: Make sure `FRONTEND_URL` in backend/.env matches your frontend URL exactly
- **Socket.io issues**: Check that both frontend and backend URLs are correct

### JWT Issues

- **Token errors**: Make sure `JWT_SECRET` is set and is at least 32 characters
- **Token expiration**: Adjust `JWT_EXPIRES_IN` if needed (e.g., "24h", "30d")

---

## Production Configuration

For production deployment, make sure to:

1. **Use strong secrets**: Generate a new JWT_SECRET with `openssl rand -base64 32`
2. **Use environment variables**: Set these in your hosting platform (AWS, Railway, etc.)
3. **Use HTTPS**: Update FRONTEND_URL and VITE_API_URL to use https://
4. **Secure database**: Use AWS RDS or another managed database service
5. **Never commit .env files**: They should be in .gitignore (already configured)
