# 🎅 Santa Tracker

A whimsical, real-time Santa Tracker web application for neighborhood Christmas tours. Track Santa's location in real-time, manage tour routes, and let families see when Santa is coming to visit!

## Features

- **Tour Guide Dashboard**: Create and manage multiple neighborhood tours
- **Family Sign-Up**: Easy sign-up form via invite links
- **Real-Time Tracking**: See Santa's location on a live map with 🎅 emoji
- **Cookie Collection**: Visual cookie tracker as Santa visits each house 🍪
- **Route Management**: Drag-and-drop reordering of families
- **ETA Calculation**: Estimated arrival times (5 minutes per visit)
- **Schedule Tracker**: See if Santa is ahead or behind schedule
- **Holiday Entertainment**: Rotating jokes and riddles for families
- **Background Music**: Optional holiday music with mute toggle
- **Multi-Tenant**: Support for multiple neighborhoods and tour guides

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (with Prisma ORM)
- **Real-Time**: Socket.io
- **Maps**: Leaflet + OpenStreetMap
- **Deployment**: Docker + AWS (ECS/Fargate + RDS)

## Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker Compose)
- Docker & Docker Compose (for containerized deployment)

## Local Development Setup

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the project**:
   ```bash
   cd santa-tracker
   ```

2. **Set up environment variables**:
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**:
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Option 2: Manual Setup

1. **Set up PostgreSQL database**:
   ```bash
   # Using your Postgres app or:
   createdb santa_tracker
   ```

2. **Backend setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend setup** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/santa_tracker?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## Usage

### For Tour Guides

1. **Register/Login**: Create an account at `/register` or login at `/login`
2. **Create a Tour**: Enter a tour name (e.g., "Maple Street 2024")
3. **Share Invite Link**: Copy or share the invite link with families
4. **Organize Route**: Drag and drop families to reorder the route
5. **Start Tour**: Click "Start Tour" when ready to begin
6. **Track Progress**: 
   - Click "Arrive" when you reach a house
   - Click "Complete Visit" when finished
   - The app automatically advances to the next family

### For Families

1. **Sign Up**: Use the invite link shared by your tour guide
2. **Enter Information**: 
   - Street address
   - Family name
   - Children's names
   - Special instructions for Santa (optional)
3. **Track Santa**: View the family view page to see:
   - Santa's real-time location on the map
   - Your position in the queue
   - Estimated arrival time
   - Cookie collection progress
   - Holiday jokes and riddles

## Deployment

### AWS Deployment

#### 1. Database (RDS)

Create a PostgreSQL RDS instance:
- Engine: PostgreSQL
- Instance class: db.t3.micro (or larger)
- Storage: 20GB (or as needed)
- Note the endpoint and credentials

#### 2. Backend (ECS/Fargate)

1. **Build and push Docker image**:
   ```bash
   cd backend
   docker build -t santa-tracker-backend .
   # Tag and push to ECR
   ```

2. **Create ECS Task Definition**:
   - Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
   - Use the RDS endpoint for DATABASE_URL
   - Configure health checks

3. **Run migrations**:
   ```bash
   # In ECS task or locally with RDS connection
   npx prisma migrate deploy
   ```

#### 3. Frontend

1. **Build and push Docker image**:
   ```bash
   cd frontend
   docker build -t santa-tracker-frontend .
   # Tag and push to ECR
   ```

2. **Update nginx.conf** with backend URL

3. **Deploy to ECS** or use CloudFront + S3 for static hosting

### Environment Variables for Production

- `DATABASE_URL`: RDS PostgreSQL connection string
- `JWT_SECRET`: Strong, random secret key
- `FRONTEND_URL`: Your frontend domain
- `NODE_ENV`: production

## Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Project Structure

```
santa-tracker/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth middleware
│   │   └── server.ts      # Express server
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── contexts/      # React contexts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register tour guide
- `POST /api/auth/login` - Login tour guide

### Tours
- `GET /api/tours` - Get all tours (authenticated)
- `POST /api/tours` - Create tour (authenticated)
- `GET /api/tours/:id` - Get tour by ID (authenticated)
- `GET /api/tours/invite/:inviteCode` - Get tour by invite code (public)
- `PATCH /api/tours/:id/status` - Update tour status
- `PATCH /api/tours/:id/families/order` - Reorder families

### Families
- `POST /api/families/invite/:inviteCode` - Sign up family (public)
- `GET /api/families/:id` - Get family (public)
- `PUT /api/families/:id` - Update family (public)
- `DELETE /api/families/:id` - Remove family (public)

### Visits
- `POST /api/visits/:tourId/start` - Start tour (authenticated)
- `PATCH /api/visits/:visitId/status` - Update visit status
- `POST /api/visits/:tourId/location` - Update Santa location (authenticated)
- `GET /api/visits/tour/:tourId/current` - Get current visit status

### Jokes
- `GET /api/jokes/random` - Get random joke/riddle
- `GET /api/jokes/next` - Get next joke/riddle (rotating)

## Socket.io Events

### Client → Server
- `join-tour` - Join a tour room
- `leave-tour` - Leave a tour room

### Server → Client
- `santa-location` - Santa's location update
- `visit-updated` - Visit status changed
- `tour-started` - Tour has started
- `family-added` - New family signed up
- `family-updated` - Family info updated
- `family-removed` - Family removed
- `families-reordered` - Family order changed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ and 🎅 for spreading holiday joy!

