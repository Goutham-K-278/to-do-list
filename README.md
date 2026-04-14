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
