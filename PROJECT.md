# 📋 Mini Todo App — Project Documentation

> A full-stack **MERN** (MongoDB, Express, React, Node.js) task manager with AWS-ready architecture.  
> Dark glassmorphism UI · Priority tagging · REST API · MongoDB Atlas · Vite + React frontend

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [How the App Works](#how-the-app-works)
5. [API Reference](#api-reference)
6. [Data Model](#data-model)
7. [Frontend Components](#frontend-components)
8. [Design System](#design-system)
9. [Environment Variables](#environment-variables)
10. [Running Locally](#running-locally)
11. [Packages Used](#packages-used)
12. [AWS Deployment Guide](#aws-deployment-guide)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

Mini Todo is a lightweight but production-ready task management application built on the MERN stack. It demonstrates a clean separation between frontend and backend, a real database (MongoDB Atlas), and a REST API — making it a solid foundation for AWS deployment (S3 + EC2 + MongoDB Atlas).

**Features:**
- ✅ Add, complete, and delete tasks
- 🎯 Priority levels: High / Medium / Low (color-coded)
- 🔍 Filter by All / Pending / Done
- 📊 Live stats (total, pending, done counts)
- 🔔 Toast notifications for every action
- 💾 Persisted data in MongoDB Atlas
- 🌙 Premium dark glassmorphism UI
- 📱 Fully responsive for mobile and desktop

---

## Tech Stack

| Layer       | Technology                          | Purpose                                  |
|-------------|-------------------------------------|------------------------------------------|
| Frontend    | React 18 (via Vite)                 | UI framework                             |
| HTTP Client | Axios                               | Frontend→Backend API calls               |
| Backend     | Node.js + Express.js                | REST API server                          |
| Database    | MongoDB Atlas + Mongoose            | Cloud-hosted NoSQL database + ODM        |
| Styling     | Vanilla CSS (custom design system)  | No framework needed — full control       |
| Dev Server  | Vite (with proxy)                   | Hot reload + proxies /tasks to Express   |
| Font        | Inter (Google Fonts)                | Modern, clean typography                 |

---

## Project Structure

```
E:\Task\
├── package.json                  # Root script (concurrently) to start both servers at once
├── server/                       # Node.js + Express backend
│   ├── server.js                 # App entry — forces IPv4, connects DB, starts server
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Environment variables (NEVER commit this)
│   ├── models/
│   │   └── Task.js               # Mongoose schema/model for a Task
│   └── routes/
│       └── tasks.js              # All CRUD route handlers (/tasks)
│
├── client/                       # React frontend (Vite)
│   ├── index.html                # HTML entry point (Inter font, meta tags)
│   ├── vite.config.js            # Vite config + dev proxy to backend
│   ├── package.json              # Frontend dependencies
│   └── src/
│       ├── main.jsx              # React DOM render root
│       ├── App.jsx               # Root component — state, API calls, layout
│       ├── index.css             # Global design system (variables + all styles)
│       └── components/
│           ├── AddTask.jsx       # Form component: input + priority + submit
│           ├── TaskList.jsx      # List renderer with loading + empty states
│           ├── TaskItem.jsx      # Individual task card with checkbox + delete
│           └── Toast.jsx         # Slide-in toast notification system
│
└── PROJECT.md                    # This documentation file
```

---

## How the App Works

### Full Data Flow

```
[User types task] 
        ↓
[AddTask.jsx] — collects title + priority
        ↓
[App.jsx: handleAdd()] — calls axios.post("/tasks", { title, priority })
        ↓
[Vite Proxy] — /tasks → http://localhost:5000/tasks (dev only)
        ↓
[Express server.js] → routes to tasks.js
        ↓
[tasks.js: POST /tasks] → creates new Task document in MongoDB
        ↓
[MongoDB Atlas] — stores the task
        ↓
[Response: saved task JSON] → back to App.jsx
        ↓
[setTasks()] — prepends new task to UI state
        ↓
[TaskList/TaskItem render] — shows the new task instantly
        ↓
[Toast] — "Task added! 🎉"
```

### Toggle Completion Flow (PUT)

```
[User checks checkbox in TaskItem]
        ↓
[onToggle(_id, completed)] → axios.put("/tasks/:id", { completed: !completed })
        ↓
[Express PUT /tasks/:id] → findByIdAndUpdate() in MongoDB
        ↓
[Updated task returned] → setTasks() updates state
        ↓
[TaskItem re-renders] — strikethrough appears if completed
```

### Delete Flow

```
[User hovers task → clicks ✕]
        ↓
[onDelete(_id)] → axios.delete("/tasks/:id")
        ↓
[Express DELETE /tasks/:id] → findByIdAndDelete()
        ↓
[setTasks() filters out deleted task] → smooth UI update
```

---

## API Reference

Base URL (local): `http://localhost:5000`

### GET /tasks
Fetch all tasks, sorted newest first.

**Response:** `200 OK`
```json
[
  {
    "_id": "664abc...",
    "title": "Learn MERN stack",
    "completed": false,
    "priority": "high",
    "createdAt": "2026-04-10T05:30:00.000Z",
    "updatedAt": "2026-04-10T05:30:00.000Z"
  }
]
```

---

### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Deploy S3 frontend",
  "priority": "medium"
}
```

**Response:** `201 Created`
```json
{
  "_id": "664def...",
  "title": "Deploy S3 frontend",
  "completed": false,
  "priority": "medium",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Errors:** `400` if title is empty.

---

### PUT /tasks/:id
Update any field(s) of a task. Typically used to toggle `completed`.

**Request Body (any or all):**
```json
{
  "completed": true,
  "title": "Updated title",
  "priority": "low"
}
```

**Response:** `200 OK` — the updated task document.

**Errors:** `404` if task not found.

---

### DELETE /tasks/:id
Delete a task by its MongoDB ObjectId.

**Response:** `200 OK`
```json
{
  "message": "Task deleted",
  "id": "664abc..."
}
```

**Errors:** `404` if task not found.

---

## Data Model

File: `server/models/Task.js`

```js
{
  title:     String  // required, max 200 chars, trimmed
  completed: Boolean // default: false
  priority:  String  // enum: "low" | "medium" | "high", default: "medium"
  createdAt: Date    // auto-generated by Mongoose timestamps
  updatedAt: Date    // auto-generated by Mongoose timestamps
}
```

Mongoose `timestamps: true` automatically adds `createdAt` and `updatedAt` to every document.

---

## Frontend Components

### `App.jsx`
The root component. Owns **all state** and **all API calls**.

| State        | Type    | Purpose                          |
|--------------|---------|----------------------------------|
| `tasks`      | Array   | The full list from MongoDB       |
| `loading`    | Boolean | Shows spinner on first load      |
| `filter`     | String  | "all" / "pending" / "done"       |
| `toasts`     | Array   | Queue of notification messages   |

Functions:
- `fetchTasks()` — GET all tasks on mount
- `handleAdd({ title, priority })` — POST new task
- `handleToggle(id, completed)` — PUT toggle
- `handleDelete(id)` — DELETE task
- `addToast(message, type)` — show notification for 3s

---

### `AddTask.jsx`
Controlled form component.

- Text input (`task-input`) for task title
- Priority selector (`priority-select`): High / Medium / Low
- Submit button (`add-task-btn`) — disabled when input is empty or loading
- Inline error message if user tries to submit empty input
- Submits on button click OR pressing `Enter`

---

### `TaskList.jsx`
Renders the task list with contextual UX:

- **Loading** → spinning ring animation
- **Empty list** → helpful message specific to the active filter
- **Has tasks** → renders `<TaskItem>` for each task in a `<ul>`

---

### `TaskItem.jsx`
Individual task card.

- **Color-coded left border** by priority (red / yellow / green)
- **Checkbox** — custom styled, toggles `completed`
- **Task title** — strikethrough when completed
- **Priority badge** — pill chip below the title
- **Date** — formatted creation timestamp
- **Delete button** — hidden until hover, reveals with smooth transition

---

### `Toast.jsx`
Non-blocking notification system.

- Toasts stack at the bottom-right of the screen
- Auto-dismissed after 3 seconds
- Two types: `success` (green) and `error` (red)
- Slide-in animation from the right

---

## Design System

All styles live in `client/src/index.css` using CSS custom properties.

### Color Palette

| Variable            | Value                        | Usage                       |
|---------------------|------------------------------|-----------------------------|
| `--bg-base`         | `#0d0d14`                    | Page background             |
| `--bg-card`         | `rgba(255,255,255,0.05)`     | Card surfaces               |
| `--accent-primary`  | `#7c5cfc`                    | Buttons, focus rings, glow  |
| `--accent-secondary`| `#c084fc`                    | Gradient end, header text   |
| `--priority-high`   | `#f87171`                    | High priority (red)         |
| `--priority-medium` | `#fbbf24`                    | Medium priority (amber)     |
| `--priority-low`    | `#34d399`                    | Low priority (green)        |
| `--text-primary`    | `#f1f0ff`                    | Main readable text          |
| `--text-secondary`  | `#9990b8`                    | Labels, metadata            |
| `--text-muted`      | `#5e5a7a`                    | Placeholder, disabled       |

### Effects
- **Glassmorphism**: `backdrop-filter: blur(16px)` + semi-transparent backgrounds
- **Mesh gradient background**: Two radial gradients on `<body>`
- **Floating logo**: CSS keyframe `float` animation
- **Slide-in tasks**: `slideIn` keyframe on new `TaskItem` render
- **Hover micro-animations**: `translateX(2px)` on task cards, `translateY(-2px)` on buttons

---

## Environment Variables

File: `server/.env`

```env
# Using direct connection string to bypass SRV DNS lookups if blocked on Windows networks
MONGO_URI=mongodb://<username>:<password>@<shard-00>.mongodb.net:27017,<shard-01>.mongodb.net:27017,<shard-02>.mongodb.net:27017/mini-todo?ssl=true&replicaSet=<replica-name>&authSource=admin&retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit `.env` to Git.** Add `.env` to `.gitignore`.

When deploying to AWS:
- Set `CLIENT_ORIGIN` to your S3 static website URL
- Set `MONGO_URI` to your production MongoDB Atlas connection string
- Set these as EC2 instance environment variables or use AWS Secrets Manager

---

## Running Locally

### Prerequisites
- Node.js v18+ installed
- A MongoDB Atlas account and cluster
- Git (optional)

### Step 1 — Configure the backend
1. Open `server/.env`
2. Replace the `MONGO_URI` placeholder with your real MongoDB Atlas connection string
   - In MongoDB Atlas: **Connect → Drivers → Copy connection string**
   - Replace `<username>`, `<password>`, `<cluster>` with your actual values

### Step 2 — Install Dependencies
Run this command from the root folder `E:\Task\` to install all dependencies for both client and server:
```powershell
npm run install:all
```

### Step 3 — Start Everything
Instead of running backend and frontend separately, run this command from the root folder `E:\Task\`:
```powershell
npm run dev
```

This uses `concurrently` to start both the Express backend and the Vite frontend simultaneously in the same terminal.

You should see:
```
[SERVER] ✅  Connected to MongoDB Atlas
[SERVER] 🚀  Server running on http://localhost:5000
[CLIENT]   VITE v8.0.8  ready in 300 ms
```

Open your browser to: **http://localhost:5173**

The Vite proxy automatically forwards `/tasks` API calls to `http://localhost:5000` during development — no CORS errors.

---

## Packages Used

### Root Tooling
| Package        | Version | What it does                                         |
|----------------|---------|------------------------------------------------------|
| `concurrently` | ^8.2    | Runs both frontend and backend dev scripts in a single terminal |

### Backend (`server/`)

| Package     | Version | What it does                                              |
|-------------|---------|-----------------------------------------------------------|
| `express`   | ^4.18   | Web framework — defines routes and handles HTTP requests  |
| `mongoose`  | ^8.3    | MongoDB ODM — defines schema, validates, queries          |
| `cors`      | ^2.8    | Cross-Origin Resource Sharing — allows frontend to call API|
| `dotenv`    | ^16.4   | Loads variables from `.env` file into `process.env`       |
| `nodemon`   | ^3.1    | Dev tool — auto-restarts server when you change files     |

### Frontend (`client/`)

| Package          | Version | What it does                                         |
|------------------|---------|------------------------------------------------------|
| `react`          | ^18     | UI library — component model, hooks, virtual DOM     |
| `react-dom`      | ^18     | Renders React components to the real browser DOM     |
| `axios`          | ^1.6    | HTTP client — cleaner than `fetch`, handles errors   |
| `vite`           | ^6      | Dev server with HMR + production bundler             |
| `@vitejs/plugin-react` | ^4 | Vite plugin for React JSX and Fast Refresh        |

---

## AWS Deployment Guide

> You will handle this part. Here is the complete reference.

### Architecture
```
[Browser]
    ↓ HTTPS (static files)
[AWS S3 Static Website]  ← React build (npm run build)
    ↓ HTTPS API calls to ec2-ip/tasks
[AWS EC2 Instance]       ← Node.js/Express server
    ↓ Mongoose connection
[MongoDB Atlas]          ← Cloud-hosted database
```

### Step 1 — Build the React frontend
```powershell
cd E:\Task\client
npm run build
```
This creates `client/dist/` — that's what you upload to S3.

### Step 2 — S3 Setup
1. Create an S3 bucket, enable **Static Website Hosting**
2. Set index document to `index.html`
3. Make bucket public (or use CloudFront)
4. Upload `client/dist/` contents to the bucket
5. Update `client/src/App.jsx` line: change `const API = "/tasks"` to `const API = "http://<your-ec2-ip>:5000/tasks"` before building

### Step 3 — EC2 Setup
1. Launch EC2 instance (Ubuntu 22.04 recommended)
2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`
3. Upload the `server/` folder to EC2 (via `scp` or CodeDeploy)
4. Set environment variables on EC2
5. Install PM2 to keep the server alive: `npm install -g pm2`
6. Start: `pm2 start server.js --name mini-todo`
7. Open port 5000 in EC2 Security Group (inbound TCP rule)
8. Update `CLIENT_ORIGIN` in `.env` to your S3 bucket URL

### Step 4 — MongoDB Atlas Network Access
In Atlas → **Network Access** → Add your EC2 instance's public IP.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| `MONGO_URI is not set` error | Open `server/.env` and fill in your MongoDB connection string |
| `Connection refused` on port 5000 | Make sure the backend is running (`npm run dev` in `server/`) |
| Tasks not loading on frontend | Check browser console — is the Vite proxy running? Both servers must be up |
| CORS error in production | Set `CLIENT_ORIGIN` in `.env` to your exact S3 URL (no trailing slash) |
| MongoDB auth error | Check your Atlas username/password in the connection string |
| Port 5173 already in use | Change `port` in `client/vite.config.js` or kill the process |

---

*Last updated: April 2026 — Mini Todo v1.0*
