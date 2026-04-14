# Mini Todo App — Production-Ready Deployment

A full-stack MERN (MongoDB, Express, React, Node.js) task management application with **3-layer containerized architecture** and **Kubernetes auto-scaling**.

---

## What We Built

### Architecture (3-Tier System)
- **Layer 1 (Client)**: React.js + Nginx → Port 8082 (Docker) or 8080 (K8s)
- **Layer 2 (API)**: Express.js + Node.js → Port 5000 (internal service)
- **Layer 3 (Database)**: MongoDB 7 → Persistent storage (2Gi)

Each layer is containerized individually with Docker, then orchestrated with Docker Compose (local) or Kubernetes (production).

### Key Features
✅ Task management (add/edit/delete)  
✅ Priority-based organization  
✅ Auto-scaling based on CPU usage  
✅ Health checks & load balancing  
✅ Persistent database storage  
✅ Environment-based configuration  

---

## Quick Start

### Option 1: Docker Compose (Local)

```bash
git clone <repo>
cd Task
docker-compose up -d
# Access: http://localhost:8082
```

### Option 2: Kubernetes with Minikube (Production-Like)

```bash
# Start Minikube
minikube start --cpus=4 --memory=4096
minikube addons enable metrics-server

# Build images
eval $(minikube docker-env)
docker build -t task-backend:latest ./backend
docker build -t task-frontend:latest ./frontend

# Deploy
kubectl apply -f k8s/single/namespace.yaml
kubectl apply -f k8s/single/mongo.yaml
kubectl apply -f k8s/single/backend.yaml
kubectl apply -f k8s/single/frontend.yaml
kubectl apply -f k8s/single/hpa.yaml

# Access
kubectl port-forward -n todo svc/frontend 8080:80
# Access: http://localhost:8080
```

---

## Project Structure

```
Task/
├── backend/              # Express API (Node.js Alpine)
│   ├── Dockerfile        # Container image
│   ├── server.js         # Express setup + MongoDB connection
│   ├── models/Task.js    # Database schema
│   └── routes/tasks.js   # CRUD endpoints
│
├── frontend/             # React SPA (Nginx)
│   ├── Dockerfile        # Multi-stage build (Node → Nginx)
│   ├── nginx.conf        # Reverse proxy + API routing
│   ├── src/              # React components
│   └── vite.config.js    # Dev server config
│
├── k8s/single/           # Kubernetes manifests
│   ├── namespace.yaml    # Create 'todo' namespace
│   ├── mongo.yaml        # MongoDB + persistent storage
│   ├── backend.yaml      # Backend deployment + service
│   ├── frontend.yaml     # Frontend deployment + service
│   └── hpa.yaml          # Auto-scaling rules
│
├── docker-compose.yml    # Local development
└── README.md             # This file
```

---

## Technology Stack

| Component | Tech | Version |
|-----------|------|---------|
| Frontend | React + Vite + Nginx | 19.2.4, 8.0.4, 1.27 |
| Backend | Node.js + Express | 20 Alpine, 4.18.2 |
| Database | MongoDB | 7 |
| Orchestration | Kubernetes / Docker Compose | 1.28+ / v5.1 |

---

## Configuration

### Environment Variables (backend/.env)
```env
MONGO_URI=mongodb://mongo:27017/mini-todo-k8s
PORT=5000
CLIENT_ORIGIN=http://localhost:8082
NODE_ENV=production
```

### Auto-Scaling (HPA)
- **Frontend**: 2-6 replicas (scale at 70% CPU)
- **Backend**: 1-6 replicas (scale at 60% CPU)
- **MongoDB**: 1 replica (stateful)

---

## API Endpoints

**Base URL**: `http://localhost:5000` (local) or `http://backend:5000` (K8s internal)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/` | Health check |

### Example Request
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","priority":"high"}'
```

---

## Common Commands

### Docker Compose
```bash
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
```

### Kubernetes
```bash
kubectl get all -n todo                           # View all resources
kubectl logs -n todo deployment/backend           # Check backend logs
kubectl get hpa -n todo                           # Check auto-scaling
kubectl port-forward -n todo svc/frontend 8080:80 # Access frontend
```

### Useful Kubectl Commands
```bash
# Check running pods
kubectl get pods -n todo

# Check services
kubectl get svc -n todo

# Check events (troubleshooting)
kubectl get events -n todo

# Enter pod shell
kubectl exec -it -n todo deployment/backend -- sh
```

---

## Troubleshooting

### Problem: Pods in CrashLoopBackOff
**Fix**: Check logs → `kubectl logs -n todo deployment/backend --tail=50`  
Common issues: Missing environment variables, port conflicts, image pull failures

### Problem: MongoDB won't connect
**Fix**: Verify service exists → `kubectl get svc -n todo mongo`  
Test from pod: `kubectl exec -it -n todo deployment/backend -- telnet mongo 27017`

### Problem: Frontend can't reach backend
**Fix**: Check service DNS → `kubectl exec -it -n todo deployment/frontend -- nslookup backend`  
Verify CORS: Check logs for CORS errors

### Problem: HPA not scaling
**Fix**: Wait 2-3 minutes for metrics collection  
Check metrics: `kubectl top pods -n todo`  
Verify CPU request is set in deployment

### Problem: Out of memory
**Fix**: Increase Minikube memory → `minikube start --memory=8192`

---

## Local Development (Without K8s)

```bash
# Install dependencies
npm install --prefix backend
npm install --prefix frontend

# Set MongoDB URI
echo "MONGO_URI=mongodb://localhost:27017/mini-todo-local" > backend/.env

# Start MongoDB locally
mongod

# Terminal 1: Start backend
npm run backend

# Terminal 2: Start frontend  
npm run frontend
```

---

## What Was Accomplished

✅ **3-layer architecture** - Frontend, Backend, Database  
✅ **Containerization** - Individual Dockerfiles with optimization  
✅ **Docker Compose** - Local development setup  
✅ **Kubernetes deployment** - Single-cluster with all manifests  
✅ **Auto-scaling** - HPA configured for traffic demand  
✅ **Persistent storage** - MongoDB with PersistentVolumeClaim  
✅ **Health checks** - Liveness & readiness probes configured  
✅ **Service discovery** - Internal DNS for all layers  

---

## Next Steps (Future Enhancements)

- Deploy multi-cluster setup (`k8s/multi/`)
- Add ingress controller for external access
- Configure persistent MongoDB replica set
- Add CI/CD pipeline
- Setup monitoring (Prometheus/Grafana)

---

**Status**: ✅ Task 1 Complete  
**Documentation**: See [PROJECT.md](PROJECT.md) for technical details  
**Last Updated**: April 14, 2026
# Mini Todo App — Production-Ready Kubernetes Deployment

A full-stack MERN (MongoDB, Express, React, Node.js) task management application with **containerized 3-layer architecture**, **Kubernetes orchestration**, and **automatic horizontal scaling** for high-traffic environments.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Local Kubernetes Deployment](#local-kubernetes-deployment)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Configuration](#configuration)
8. [API Reference](#api-reference)
9. [Scaling & Performance](#scaling--performance)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture

This application implements a **3-tier microservice architecture** with containerized deployment:

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                             │
│              React.js Frontend (Nginx Reverse Proxy)         │
│                   Replicas: 2-6 (Auto-scaled)               │
│  • Glassmorphism UI Design                                   │
│  • Vite Build Optimization                                   │
│  • API Proxy to Backend Service                              │
└──────────────────┬───────────────────────────────────────────┘
                   │ Internal K8s Service (http://backend:5000)
┌──────────────────▼───────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│           Express.js API Server (Node.js Alpine)             │
│                   Replicas: 1-6 (Auto-scaled)               │
│  • RESTful API (CRUD operations)                             │
│  • CORS-enabled for frontend                                 │
│  • Health checks for load balancing                          │
│  • Resource limits: CPU 200m-600m, Memory 256Mi-512Mi        │
└──────────────────┬───────────────────────────────────────────┘
                   │ Internal K8s Service (mongodb://mongo:27017)
┌──────────────────▼───────────────────────────────────────────┐
│                    DATABASE TIER                             │
│         MongoDB 7 (Single Replica, Persistent Storage)       │
│  • Persistent Volume Claim: 2Gi                              │
│  • Collection: tasks (title, completed, priority, timestamp) │
│  • Resource limits: CPU 100m-300m, Memory 128Mi-512Mi        │
└──────────────────────────────────────────────────────────────┘
```

### Deployment Options

| Setup | Use Case | Complexity |
|-------|----------|-----------|
| **Docker Compose** | Local development | ⭐ Low |
| **Single-Cluster K8s** | Local testing with auto-scaling | ⭐⭐ Medium |
| **Multi-Cluster K8s** | High availability & disaster recovery | ⭐⭐⭐ High |

---

## Prerequisites

### System Requirements

- **Docker**: v20.10+ with Docker Compose v1.29+
- **Kubernetes**: Minikube (local), Kubernetes 1.28+, or managed K8s cluster
- **kubectl**: v1.28+
- **Node.js**: v18+ (for local development only)
- **Git**: v2.0+

### Verify Installation

```bash
# Check Docker
docker --version
docker-compose --version

# Check Kubernetes
kubectl version --client
minikube version

# Check Node.js (optional)
node --version
npm --version
```

---

## Quick Start

### Option 1: Docker Compose (Fastest)

Ideal for quick testing without Kubernetes overhead.

```bash
# 1. Clone the repository
git clone <repository-url>
cd Task

# 2. Start services (frontend, backend, MongoDB)
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:8082
# API: http://localhost:5000 (from inside container)

# 4. Monitor logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

### Option 2: Local Kubernetes with Minikube

Full containerized deployment with auto-scaling capability.

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=4096

# 2. Build images locally
docker build -t task-backend:latest ./backend
docker build -t task-frontend:latest ./frontend

# 3. Configure Minikube image pull
eval $(minikube docker-env)  # Load Minikube's Docker daemon
docker build -t task-backend:latest ./backend
docker build -t task-frontend:latest ./frontend

# 4. Deploy to Kubernetes
kubectl apply -f k8s/single/namespace.yaml
kubectl apply -f k8s/single/mongo.yaml
kubectl apply -f k8s/single/backend.yaml
kubectl apply -f k8s/single/frontend.yaml
kubectl apply -f k8s/single/hpa.yaml

# 5. Verify deployment
kubectl get pods -n todo
kubectl get svc -n todo
kubectl get hpa -n todo

# 6. Port forward to access
kubectl port-forward -n todo svc/frontend 8080:80
# Access: http://localhost:8080

# 7. Monitor auto-scaling
watch kubectl get hpa -n todo
```

---

## Local Kubernetes Deployment

### Detailed Setup Steps

#### Step 1: Initialize Minikube

```bash
# Start cluster with sufficient resources
minikube start \
  --cpus=4 \
  --memory=4096 \
  --driver=docker \
  --kubernetes-version=v1.28.0

# Enable metrics-server for HPA (auto-scaling)
minikube addons enable metrics-server

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

#### Step 2: Build Container Images

```bash
# Access Minikube's Docker daemon
eval $(minikube docker-env)

# Build backend image
docker build -t task-backend:latest ./backend

# Build frontend image
docker build -t task-frontend:latest ./frontend

# Verify images
docker images | grep task
```

#### Step 3: Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/single/namespace.yaml

# Deploy MongoDB (database layer)
kubectl apply -f k8s/single/mongo.yaml
kubectl get pods -n todo -l app=mongo

# Deploy Backend (application layer)
kubectl apply -f k8s/single/backend.yaml
kubectl get pods -n todo -l app=backend

# Deploy Frontend (client layer)
kubectl apply -f k8s/single/frontend.yaml
kubectl get pods -n todo -l app=frontend

# Apply Auto-scaling policies
kubectl apply -f k8s/single/hpa.yaml
```

#### Step 4: Verify Deployment

```bash
# Check all resources
kubectl get all -n todo

# View service endpoints
kubectl get svc -n todo

# Check pod status
kubectl get pods -n todo -w

# View HPA status
kubectl get hpa -n todo

# Check logs
kubectl logs -n todo deployment/backend
kubectl logs -n todo deployment/frontend
kubectl logs -n todo deployment/mongo
```

#### Step 5: Access the Application

```bash
# Option A: Port forward
kubectl port-forward -n todo svc/frontend 8080:80
# Access: http://localhost:8080

# Option B: NodePort (if exposed as NodePort)
minikube service frontend -n todo

# Option C: Minikube IP
minikube ip
# Add to /etc/hosts on Linux/macOS or hosts file on Windows:
# <minikube-ip>  todo.local
```

---

## Technology Stack

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.2.4 | UI library |
| Build Tool | Vite | 8.0.4 | Fast bundling |
| HTTP Client | Axios | 1.15.0 | API requests |
| Styling | Vanilla CSS | — | Glassmorphism design |
| Server | Nginx | 1.27-alpine | Reverse proxy & static serving |
| Container | Docker | 29.3.1 | Image packaging |

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 20-alpine | JavaScript runtime |
| Framework | Express.js | 4.18.2 | REST API framework |
| Database Driver | Mongoose | 8.0.3 | MongoDB ORM |
| Utilities | dotenv | 16.3.1 | Environment management |
| Container | Docker | 29.3.1 | Image packaging |

### Database
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Database | MongoDB | 7 | NoSQL document store |
| Storage | Persistent Volume | — | Data persistence in K8s |
| Access | Internal Service | — | Pod-to-pod communication |

### Infrastructure
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Orchestration | Kubernetes | 1.28+ | Container orchestration |
| Scaling | HPA | v2 | Horizontal Pod Autoscaler |
| Local Testing | Minikube | 1.30+ | Local K8s cluster |
| Service Discovery | K8s DNS | — | Internal service routing |

---

## Project Structure

```
Task/
├── README.md                    # This file - Deployment & API guide
├── PROJECT.md                   # Technical documentation & code overview
├── docker-compose.yml           # Local Docker Compose orchestration
│
├── backend/                     # Express.js API Server (Layer 2)
│   ├── Dockerfile               # Alpine Node.js image, production build
│   ├── .dockerignore            # Exclude node_modules, .env
│   ├── server.js                # Express app, MongoDB connection, health check
│   ├── package.json             # Dependencies: express, mongoose, cors
│   ├── models/
│   │   └── Task.js              # MongoDB schema (title, completed, priority)
│   └── routes/
│       └── tasks.js             # CRUD endpoints (GET, POST, PUT, DELETE)
│
├── frontend/                    # React + Nginx SPA (Layer 1)
│   ├── Dockerfile               # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf.template      # Nginx config with environment variable support
│   ├── nginx.conf               # Production Nginx reverse proxy
│   ├── vite.config.js           # Dev server with API proxy
│   ├── package.json             # Dependencies: react, vite, axios
│   ├── index.html               # SPA entry point
│   ├── public/                  # Static assets
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root component with state management
│       ├── index.css            # Glassmorphism design system
│       └── components/
│           ├── AddTask.jsx      # Task creation form
│           ├── TaskList.jsx     # Task list container
│           ├── TaskItem.jsx     # Individual task card
│           └── Toast.jsx        # Notification system
│
├── k8s/                         # Kubernetes Manifests
│   ├── single/                  # Single-cluster deployment
│   │   ├── namespace.yaml       # K8s namespace: 'todo'
│   │   ├── mongo.yaml           # MongoDB StatefulSet + PVC
│   │   ├── backend.yaml         # Backend deployment + service
│   │   ├── frontend.yaml        # Frontend deployment + service
│   │   └── hpa.yaml             # Horizontal Pod Autoscaler (CPU-based)
│   │
│   └── multi/                   # Multi-cluster deployment (future)
│       ├── backend-cluster.yaml # Backend for separate cluster
│       └── frontend-cluster.yaml# Frontend for separate cluster
│
└── .git/                        # Version control
```

---

## Configuration

### Backend Environment Variables

**File**: `backend/.env`

```env
# MongoDB connection string
# Format: mongodb://user:password@host:port/database
MONGO_URI=mongodb://mongo:27017/mini-todo-k8s

# API port
PORT=5000

# Node environment
NODE_ENV=production

# CORS allowed origin (frontend URL)
CLIENT_ORIGIN=http://localhost:8082
```

### Frontend Configuration

**Vite Dev Server** (`frontend/vite.config.js`):
- Proxies `/tasks` to backend on `http://localhost:5000`
- Runs on port `5173` by default

**Docker Compose** (`docker-compose.yml`):
- `BACKEND_API_URL=http://backend:5000` (internal service DNS)

**Kubernetes** (`k8s/single/backend.yaml`):
```yaml
MONGO_URI: mongodb://mongo:27017/mini-todo-k8s
CLIENT_ORIGIN: http://todo.local
```

### Nginx Configuration

**Frontend uses Nginx for**:
1. **SPA Routing**: Fallback all routes to `index.html`
2. **API Proxy**: `/tasks` → Backend service
3. **Static Serving**: Vite-built assets
4. **Performance**: Gzip compression, caching

**Template variables** (`nginx.conf.template`):
- `${BACKEND_API_URL}`: Dynamically set at container startup

---

## API Reference

### Base URL
- **Local Dev**: `http://localhost:5000`
- **Docker Compose**: `http://backend:5000` (internal)
- **Kubernetes**: `http://backend:5000` (K8s DNS)

### Endpoints

#### 1. Get All Tasks
```
GET /tasks

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Buy groceries",
    "completed": false,
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

#### 2. Create Task
```
POST /tasks

Request Body:
{
  "title": "Complete project",
  "priority": "high"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Complete project",
  "completed": false,
  "priority": "high",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### 3. Update Task
```
PUT /tasks/:id

Request Body:
{
  "completed": true,
  "title": "Complete project (Updated)",
  "priority": "medium"
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Complete project (Updated)",
  "completed": true,
  "priority": "medium",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

#### 4. Delete Task
```
DELETE /tasks/:id

Response: 200 OK
{
  "message": "Task deleted successfully"
}
```

#### 5. Health Check
```
GET /

Response: 200 OK
{
  "status": "ok",
  "message": "Mini Todo API is running 🚀"
}
```

### Error Responses

```
400 Bad Request
{ "error": "Title is required" }

404 Not Found
{ "error": "Task not found" }

500 Internal Server Error
{ "error": "Internal server error", "details": "..." }
```

---

## Scaling & Performance

### Horizontal Pod Autoscaling (HPA)

The application uses **CPU-based scaling** to handle traffic spikes automatically.

#### Frontend Scaling Policy
```yaml
Min Replicas: 2  (always keeps 2 pods running)
Max Replicas: 6  (max scale-out)
Target CPU:  70% (scale when avg CPU > 70%)
```

#### Backend Scaling Policy
```yaml
Min Replicas: 1  (efficient resource usage)
Max Replicas: 6  (matches frontend max)
Target CPU:  60% (more sensitive than frontend)
```

#### Load Generation for Testing

```bash
# SSH into pod for testing
kubectl exec -it -n todo deployment/frontend -- sh

# Install load testing tool
apk add --no-cache apache2-utils

# Generate load
ab -n 1000 -c 10 http://backend:5000/

# Monitor scaling
watch kubectl get hpa -n todo
```

#### Expected Scaling Behavior

1. **Initial State**: Frontend=2 pods, Backend=1 pod
2. **Load Applied**: CPU utilization increases
3. **Scale-up (~2-3 min)**: HPA detects threshold, creates new pods
4. **Peak**: Up to 6 pods per layer handling traffic
5. **Load Removed**: Pods gradually scale down (cooldown period)

#### Resource Requests & Limits

**Backend Pod**:
- Request: CPU 200m, Memory 256Mi (guaranteed)
- Limit: CPU 600m, Memory 512Mi (max allowed)

**Frontend Pod**:
- Request: CPU 150m, Memory 128Mi (guaranteed)
- Limit: CPU 400m, Memory 256Mi (max allowed)

**MongoDB Pod**:
- Request: CPU 100m, Memory 128Mi (guaranteed)
- Limit: CPU 300m, Memory 512Mi (max allowed)

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Pods stuck in `CrashLoopBackOff`

**Symptom**: Pod immediately crashes and restarts

**Solutions**:
```bash
# Check pod logs
kubectl logs -n todo deployment/backend --tail=50

# Key issues to look for:
# - MONGO_URI environment variable missing
# - Port already in use
# - Image pull failed

# Inspect pod events
kubectl describe pod -n todo <pod-name>
```

#### Issue: MongoDB connection refused

**Symptom**: Backend fails to connect to MongoDB

**Solutions**:
```bash
# Verify MongoDB is running
kubectl get pods -n todo -l app=mongo

# Check MongoDB service
kubectl get svc -n todo mongo

# Test connection from backend pod
kubectl exec -it -n todo deployment/backend -- sh
# Inside pod: telnet mongo 27017
```

#### Issue: Frontend cannot reach backend

**Symptom**: API calls fail, network errors in browser console

**Solutions**:
```bash
# Verify both services exist
kubectl get svc -n todo

# Check backend service DNS resolution
kubectl exec -it -n todo deployment/frontend -- nslookup backend

# Verify CORS configuration
# Check logs for CORS errors
kubectl logs -n todo deployment/backend | grep -i cors

# Ensure CLIENT_ORIGIN matches frontend URL
```

#### Issue: HPA not scaling (remains at min replicas)

**Symptom**: Pods don't increase even under load

**Solutions**:
```bash
# Check HPA status
kubectl describe hpa -n todo backend-hpa

# Verify metrics are available
kubectl top pods -n todo

# Check CPU request is set (HPA needs request for percentage)
kubectl get pods -n todo -o jsonpath='{.items[0].spec.containers[0].resources.requests.cpu}'

# Wait 2-3 minutes for metrics collection
```

#### Issue: PersistentVolume not provisioning

**Symptom**: MongoDB pod pending with PVC not bound

**Solutions**:
```bash
# Check PVC status
kubectl get pvc -n todo

# Describe PVC for details
kubectl describe pvc -n todo mongo-pvc

# For Minikube, verify storage class
kubectl get storageclass
```

#### Issue: Port forwarding fails

**Symptom**: Cannot access application via localhost:8080

**Solutions**:
```bash
# Verify service is accessible
kubectl get svc -n todo frontend

# Try different port
kubectl port-forward -n todo svc/frontend 8089:80

# Check firewall/antivirus blocking ports

# Alternative: Use Minikube service
minikube service frontend -n todo
```

#### Issue: Out of memory on Minikube

**Symptom**: Random pod evictions, OOMKilled pods

**Solutions**:
```bash
# Increase Minikube memory
minikube stop
minikube start --memory=8192  # Increase from 4096

# Check node resources
kubectl describe node minikube

# Reduce resource requests if needed
```

### Debugging Commands

```bash
# Cluster health
kubectl cluster-info
kubectl get nodes
kubectl top nodes

# Application health
kubectl get all -n todo
kubectl get pods -n todo -o wide
kubectl get svc -n todo

# Logs and events
kubectl logs -n todo deployment/backend
kubectl logs -n todo deployment/frontend --all-containers=true
kubectl get events -n todo --sort-by='.lastTimestamp'

# Network debugging
kubectl exec -it -n todo deployment/frontend -- ping backend
kubectl port-forward -n todo svc/backend 5000:5000

# Performance monitoring
kubectl top pods -n todo
kubectl top nodes
kubectl describe hpa -n todo
```

---

## Local Development

### Running without Kubernetes

```bash
# 1. Install dependencies
npm install --prefix frontend
npm install --prefix backend

# 2. Set MongoDB URI
# backend/.env
MONGO_URI=mongodb://localhost:27017/mini-todo-local
PORT=5000

# 3. Start local MongoDB
mongod

# 4. Start backend
npm run backend

# 5. Start frontend (new terminal)
npm run frontend
```

---

## Summary: Task Completion Checklist

✅ **3-Layer Architecture Implemented**
- Frontend: React with Nginx (Layer 1)
- Backend: Express.js with Node.js (Layer 2)
- Database: MongoDB (Layer 3)

✅ **Containerization**
- Individual Dockerfiles for frontend and backend
- Multi-stage builds for optimized images
- Docker Compose for local orchestration

✅ **Local Kubernetes Deployment**
- Complete K8s manifests (namespace, deployments, services, PVC)
- Proper resource management with requests/limits
- Health checks (liveness & readiness probes)
- Database persistence with PersistentVolumeClaim

✅ **Automatic Scaling**
- Horizontal Pod Autoscaler (HPA) configured
- CPU-based scaling metrics (60% backend, 70% frontend)
- Min/max replica constraints (Backend: 1-6, Frontend: 2-6)
- Ready for production traffic patterns

✅ **Service Communication**
- Kubernetes DNS for inter-pod communication
- Service discovery for all layers
- Proper networking policies

✅ **Production Ready**
- Environment-based configuration
- Nginx templating for dynamic configuration
- CORS setup for cross-origin requests
- Error handling and logging

---

**Last Updated**: April 14, 2026  
**Kubernetes Version**: 1.28+  
**Docker Version**: 20.10+  
**Status**: ✅ Task 1 Complete - Local Kubernetes deployment with auto-scaling
# Mini Todo App — Production-Ready Kubernetes Deployment

A full-stack MERN (MongoDB, Express, React, Node.js) task management application with **containerized 3-layer architecture**, **Kubernetes orchestration**, and **automatic horizontal scaling** for high-traffic environments.

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
