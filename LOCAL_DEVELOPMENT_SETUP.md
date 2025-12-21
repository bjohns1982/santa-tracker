# Local Development Setup

## Backend Setup

### 1. Create `.env` file in `backend/` directory

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/santa_tracker?schema=public"
JWT_SECRET="your-local-development-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Admin credentials for local development
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD="your-password"
ADMIN_NAME="Your Name"
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

## Frontend Setup

### 1. Create `.env` file in `frontend/` directory

```env
VITE_API_URL=http://localhost:3001/api
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

## Login Locally

Use the credentials from your `backend/.env` file:
- **Email**: The value of `ADMIN_EMAIL`
- **Password**: The value of `ADMIN_PASSWORD`

## Important Notes

- The admin credentials in `backend/.env` are only for local development
- Production uses environment variables set in ECS task definition
- Socket.io will automatically connect to the correct URL based on `VITE_API_URL`

