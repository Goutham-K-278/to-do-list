# Mini Todo App — Complete Setup & Deployment Guide

A full-stack MERN application with production-ready Docker setup, featuring a React frontend with glassmorphism design, Express backend, and MongoDB Atlas integration.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Local Development Setup](#local-development-setup)
5. [Docker Deployment](#docker-deployment)
6. [API Endpoints](#api-endpoints)
7. [Environment Configuration](#environment-configuration)
8. [Fixes Applied](#fixes-applied)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Mini Todo App** is a production-grade task management system built with the MERN stack. The application demonstrates:

- Full-stack JavaScript development with modern tooling
- Component-based React UI with advanced CSS (glassmorphism design system)
- RESTful API with Express.js
- MongoDB Atlas cloud database integration
- Docker containerization with multi-stage builds
- Docker Compose orchestration for multi-service deployment
- Production-ready Nginx reverse proxy setup

### Key Features
✅ Add, complete, delete, and filter tasks  
✅ Priority-based organization (High, Medium, Low)  
✅ Real-time UI updates with toast notifications  
✅ Responsive design with glassmorphism effects  
✅ Cross-origin API calls with CORS support  
✅ Environment-based configuration  
✅ Containerized deployment ready  

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React, Vite, Axios | 19.2.4, 8.0.4, 1.15.0 |
| **Styling** | Vanilla CSS (Glassmorphism) | — |
| **Backend** | Node.js, Express.js | 20 (Alpine), 4.18.2 |
| **Database** | MongoDB Atlas | Cloud (m0 cluster) |
| **Containerization** | Docker, Docker Compose | 29.3.1, v5.1.1 |
| **Reverse Proxy** | Nginx | 1.27 (Alpine) |
| **Package Manager** | npm | — |
| **Dev Tools** | Nodemon, ESLint, Vite | — |

---

## Project Structure

```
Task/
├── backend/                    # Express API server
│   ├── Dockerfile              # Backend image recipe
│   ├── .dockerignore           # Files to exclude from build
│   ├── .env                    # Environment variables (MongoDB URI, PORT)
│   ├── server.js               # Entry point (IPv4 DNS fix + Express setup)
│   ├── package.json            # Backend dependencies
│   ├── models/
│   │   └── Task.js             # Mongoose schema (title, completed, priority, timestamps)
│   └── routes/
│       └── tasks.js            # CRUD endpoints (GET, POST, PUT, DELETE)
│
├── frontend/                   # React + Vite SPA
│   ├── Dockerfile              # Multi-stage build (Node build → Nginx serve)
│   ├── .dockerignore           # Files to exclude from build
│   ├── nginx.conf              # Nginx config (SPA routing + API proxy)
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite dev server (proxy to backend on 5000)
│   ├── index.html              # HTML entry point
│   ├── src/
│   │   ├── main.jsx            # React DOM render
│   │   ├── App.jsx             # Root component (state management, handlers)
│   │   ├── index.css           # Global styles (glassmorphism design system)
│   │   ├── components/
│   │   │   ├── AddTask.jsx      # Form to create tasks
│   │   │   ├── TaskList.jsx     # Container for task display
│   │   │   ├── TaskItem.jsx     # Individual task card
│   │   │   └── Toast.jsx        # Notification system
│   │   └── assets/
│   └── public/
│       └── (static files)
│
├── docker-compose.yml          # Orchestration: both services + networking
├── package.json                # Root scripts (dev, docker:up, docker:down, etc.)
├── PROJECT.md                  # Detailed technical documentation
└── README.md                   # This file

```

---

## Local Development Setup

### Prerequisites
- Node.js 20+ and npm
- MongoDB Atlas account (free tier available)
- Vite (bundled in frontend dependencies)

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install                          # Root scripts
npm install --prefix backend         # Backend packages
npm install --prefix frontend        # Frontend packages
```

### Step 2: Configure Environment Variables

Create `backend/.env`:
```env
# MongoDB Atlas direct connection (bypasses SRV DNS on restricted networks)
MONGO_URI=mongodb://username:password@host1:27017,host2:27017,host3:27017/mini-todo?ssl=true&replicaSet=atlas-xxxxx&authSource=admin

# Server configuration
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Step 3: Run Local Dev Stack

```bash
# Terminal 1: Backend + Frontend (concurrently)
npm run dev

# Or separately:
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend  
npm run frontend
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/tasks

### Individual Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run both backend & frontend with concurrently |
| `npm run backend` | Backend dev (nodemon on port 5000) |
| `npm run frontend` | Frontend dev (Vite on port 5173) |
| `npm run install:all` | Install all dependencies |

---

## Docker Deployment

### Prerequisites
- Docker Desktop installed and running
- Docker context set to `desktop-linux` (automatic on Docker Desktop)

### Quick Start

```bash
# 1. Build images
docker compose build

# 2. Start containers
docker compose up -d

# 3. View status
docker compose ps

# 4. View logs
docker compose logs -f

# 5. Stop services
docker compose down
```

### What Happens

1. **Backend Service** (`todo-backend`):
   - Builds from `backend/Dockerfile` (Node 20 Alpine base)
   - Installs production dependencies only
   - Runs `npm start` (port 5000 internal, not exposed to host)
   - Connected to MongoDB Atlas via `MONGO_URI` from `.env`
   - Accessible to frontend via Docker internal network at `http://backend:5000`

2. **Frontend Service** (`todo-frontend`):
   - Multi-stage build: Node 20 Alpine (build stage) → Nginx 1.27 Alpine (serve stage)
   - Builds React app: `npm run build` produces optimized dist/
   - Nginx serves static files and proxies `/tasks` → backend service
   - Published on host at `http://localhost:8082` (port mapping: 8082:80)
   - SPA routing handled by Nginx `try_files` directive

3. **Network**:
   - Services communicate on internal Docker network `todo-net`
   - Backend not exposed to host (no port collision risk)
   - Frontend exposes port 8082 to host

### Docker Files Explained

**backend/Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev          # Install only production deps
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
```
✅ Lightweight (Alpine)  
✅ Production-only dependencies  
✅ Predictable build  

**frontend/Dockerfile (multi-stage):**
```dockerfile
FROM node:20-alpine AS build   # Stage 1: Build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build              # Produces dist/

FROM nginx:1.27-alpine         # Stage 2: Serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
✅ Smaller final image (build artifacts discarded)  
✅ Pure static serve + proxy  
✅ No Node runtime in production image  

**frontend/nginx.conf:**
- Serves React SPA from `/usr/share/nginx/html`
- Proxies `/tasks` → `http://backend:5000` (Docker internal network)
- SPA routing: `try_files $uri /index.html` (single-page app support)

**docker-compose.yml:**
- Defines backend and frontend services
- Sets `depends_on` so frontend waits for backend
- Loads backend `.env` automatically
- Configures restart policy: `unless-stopped`
- Names network `todo-net` for service discovery

### Port Configuration

Due to host port availability:
- **Frontend**: Published on `http://localhost:8082` (mapped from container port 80)
- **Backend**: Internal only (port 5000 accessible via service name `backend` in network)
- **MongoDB**: Accessed externally via Atlas URI in `.env`

If ports 8080 or 5000 become available, update `docker-compose.yml`:
```yaml
# Frontend
ports:
  - "8080:80"  # Change 8080 to your desired port

# Backend (if needed for debugging)
ports:
  - "5000:5000"  # Uncomment to expose backend
```

### NPM Scripts for Docker

```bash
npm run docker:build      # Build images (docker compose build)
npm run docker:up         # Start services (docker compose up -d)
npm run docker:down       # Stop services (docker compose down)
npm run docker:logs       # View logs (docker compose logs -f)
```

---

## API Endpoints

**Base URL:** `http://localhost:5000` (local dev) or proxied via `http://localhost:8082` (Docker)

### GET /tasks
Retrieve all tasks (sorted by createdAt descending)
```bash
curl http://localhost:5000/tasks
```
Response:
```json
[
  {
    "_id": "69dd9b1ed506ffd265c015f1",
    "title": "Test Task",
    "completed": true,
    "priority": "low",
    "createdAt": "2026-04-14T01:40:46.568Z",
    "updatedAt": "2026-04-14T01:40:53.104Z"
  }
]
```

### POST /tasks
Create a new task
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","priority":"high"}'
```
Request body:
```json
{
  "title": "New Task",
  "priority": "high"  // or "medium" or "low"
}
```
Response: Created task object with `_id`

### PUT /tasks/:id
Update a task (partial update allowed)
```bash
curl -X PUT http://localhost:5000/tasks/69dd9b1ed506ffd265c015f1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### DELETE /tasks/:id
Delete a task
```bash
curl -X DELETE http://localhost:5000/tasks/69dd9b1ed506ffd265c015f1
```

---

## Environment Configuration

### backend/.env

```env
# MongoDB Atlas Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/dbname?options
# Or direct: mongodb://username:password@host1:port,host2:port/dbname?options
MONGO_URI=mongodb://gouthamkamal27_db_user:69uHgFgPLzqp0LgB@ac-lfyl6xm-shard-00-00.wfxq2ec.mongodb.net:27017,ac-lfyl6xm-shard-00-01.wfxq2ec.mongodb.net:27017,ac-lfyl6xm-shard-00-02.wfxq2ec.mongodb.net:27017/mini-todo?ssl=true&replicaSet=atlas-4vl0k7-shard-0&authSource=admin&retryWrites=true&w=majority

# Server Port
PORT=5000

# Frontend Origin (CORS whitelist)
CLIENT_ORIGIN=http://localhost:5173
```

When running with Docker Compose, `CLIENT_ORIGIN` is overridden to `http://localhost:8082` in compose config.

---

## Fixes Applied

### 1. CSS Vendor Prefix Ordering
**File:** `frontend/src/index.css`

**Problem:** ESLint warnings for `-webkit-` vendor prefixes appearing after standard properties.

**Fix:** Reordered all 11 instances to place vendor prefixes before standard properties:
```css
/* Before */
backdrop-filter: var(--glass-blur);
-webkit-backdrop-filter: var(--glass-blur);

/* After */
-webkit-backdrop-filter: var(--glass-blur);
backdrop-filter: var(--glass-blur);
```

**Also added missing prefixes:**
- `.priority-badge` now has `-webkit-backdrop-filter` for Safari support

**Impact:** CSS linter passes, better cross-browser compatibility.

---

### 2. Missing `list-style: none` on Task List
**File:** `frontend/src/index.css` (`.task-list`)

**Problem:** Task list was displaying bullet points because it's a `<ul>` element without explicit list-style reset.

**Fix:** Added `list-style: none;` to `.task-list` class.

**Impact:** Clean task list display without bullets.

---

### 3. Package Name Mismatch
**File:** `frontend/package.json`

**Problem:** Frontend folder was renamed from `client` to `frontend`, but `package.json` still had `"name": "client"`, causing red folder highlighting in VS Code.

**Fix:** Updated `"name": "client"` → `"name": "frontend"` to match folder structure.

**Impact:** VS Code explorer displays correctly, consistent naming throughout project.

---

### 4. Docker Setup Complete
**Files:** 
- `backend/Dockerfile` (corrected invalid syntax)
- `backend/.dockerignore` (created)
- `frontend/Dockerfile` (corrected invalid syntax)
- `frontend/.dockerignore` (fixed)
- `frontend/nginx.conf` (created)
- `docker-compose.yml` (created)
- `package.json` (added docker scripts)

**Problem:** Docker files contained pasted PowerShell commands instead of valid Docker syntax, missing Nginx config and Compose setup.

**Fixes Applied:**
- Corrected all Dockerfiles to valid syntax
- Created `.dockerignore` files to optimize build context
- Added multi-stage build for frontend (Node → Nginx)
- Created Nginx config for SPA routing and API proxying
- Built complete Docker Compose orchestration
- Added npm convenience scripts

**Impact:** Full containerization for production deployment.

---

### 5. Port Conflict Resolution
**Docker Compose Configuration.**

**Problem:** Initial deployment failed with:
- Port 5000 already in use by `call-booking-user-api` container
- Port 8080 already in use by Java process (PID 5508)

**Fix:**
- Removed backend port exposure (uses Docker internal network instead)
- Changed frontend port from 8080 → 8082
- Updated `CLIENT_ORIGIN` to `http://localhost:8082`

**Impact:** Services start successfully without host port conflicts.

---

## Troubleshooting

### Docker won't start

**Error:** `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

**Solution:**
```bash
# 1. Ensure Docker Desktop is running
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 2. Verify daemon is reachable
docker info

# 3. Check context
docker context ls

# 4. Switch to desktop-linux if needed
docker context use desktop-linux
```

---

### Port already in use

**Error:** `Bind for 0.0.0.0:XXXX failed: port is already allocated`

**Solution:**
```bash
# Find what's using the port
Get-NetTCPConnection -LocalPort 8082

# Option 1: Use different port
# Edit docker-compose.yml and change port mapping

# Option 2: Stop the conflicting container
docker stop <container-id>
```

---

### Tasks endpoint returns empty

**Check MongoDB connection:**
```bash
# View backend logs
docker compose logs backend

# Verify MONGO_URI in backend/.env
# Test directly from container
docker exec todo-backend npm run dev
```

---

### Frontend cannot reach backend

**If running with Docker:**
Ensure nginx.conf has correct proxy:
```nginx
location /tasks {
  proxy_pass http://backend:5000;  # Docker service name
}
```

**If running locally (dev mode):**
Verify `vite.config.js` has proxy:
```javascript
server: {
  proxy: {
    '/tasks': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

### Restart and reset everything

```bash
# Stop all containers and remove network
docker compose down

# Remove images to rebuild
docker compose down --rmi local

# Rebuild from scratch
docker compose build --no-cache

# Start fresh
docker compose up -d
```

---

## Development Workflow

### Local Development (npm scripts)
```bash
# Install deps for all layers
npm run install:all

# Run frontend + backend in one terminal
npm run dev

# Open http://localhost:5173
```

### Docker Development
```bash
# Build images
npm run docker:build

# Start services
npm run docker:up

# View logs
npm run docker:logs

# Open http://localhost:8082
```

### Git Workflow
```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "feat: descriptive message"

# Push to GitHub
git push origin main
```

---

## Learning Resources

- **React Hooks**: State management with `useState`, `useEffect`, `useCallback`
- **Express.js CORS**: Cross-origin requests with middleware
- **Mongoose Schemas**: MongoDB document structure and validation
- **Vite Dev Proxy**: Proxying API calls during development
- **Docker Multi-Stage**: Optimizing image size
- **Nginx SPA Routing**: Single-page app deployment
- **Docker Compose Networking**: Service-to-service communication

---

## Summary

This project demonstrates:
1. ✅ Full MERN stack implementation
2. ✅ Production CSS practices (vendor prefixes, accessibility)
3. ✅ Docker containerization with best practices
4. ✅ Multi-stage builds for optimization
5. ✅ Reverse proxy configuration
6. ✅ Environment-based configuration
7. ✅ Error handling and logging

**Current Status:**
- ✅ Local dev mode: Fully functional
- ✅ Docker mode: Fully functional on `http://localhost:8082`
- ✅ API endpoints: All working
- ✅ Database: Connected to MongoDB Atlas
- ✅ Linting: All CSS rules pass

---

**Last Updated:** April 14, 2026  
**Version:** 1.0.0  
**Author:** Development Team
