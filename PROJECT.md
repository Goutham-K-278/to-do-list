# 📋 Mini Todo App — Complete Technical Documentation

> A production-ready **MERN** (MongoDB, Express, React, Node.js) task manager.  
> Features: **Glassmorphism UI** · **Priority-based tasks** · **REST API** · **Real-time updates**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Build Process](#build-process)
3. [Backend Codebase](#backend-codebase)
4. [Frontend Codebase](#frontend-codebase)
5. [Data Flow](#data-flow)
6. [API Reference](#api-reference)
7. [Design System](#design-system)
8. [Environment Setup](#environment-setup)
9. [Running the App](#running-the-app)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                    React 18 + Vite + Axios                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App (state, CRUD handlers)                         │   │
│  │  ├─ AddTask (form component)                        │   │
│  │  ├─ TaskList (list container)                       │   │
│  │  │  └─ TaskItem (individual task)                   │   │
│  │  ├─ Toast (notifications)                           │   │
│  │  └─ index.css (glassmorphism design system)         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────┘
                     │ HTTP Requests (Axios)
                     │ /tasks (GET, POST, PUT, DELETE)
                     │
┌────────────────────▼──────────────────────────────────────────┐
│                    Server (REST API)                          │
│                  Node.js + Express.js                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ server.js (entry, middleware, cors, handlers)       │   │
│  │ routes/tasks.js (4 CRUD endpoints)                   │   │
│  │ models/Task.js (Mongoose schema + validation)       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬──────────────────────────────────────────┘
                     │ MongoDB Protocol (Mongoose Driver)
                     │
┌────────────────────▼──────────────────────────────────────────┐
│                  Database (Cloud)                             │
│              MongoDB Atlas (m0 free cluster)                  │
│                   Collection: tasks                           │
└───────────────────────────────────────────────────────────────┘
```

### Architectural Principles

| Principle | Implementation | Benefit |
|-----------|----------------|---------|
| **Separation of Concerns** | Backend owns data/validation; frontend owns UI/interaction | Easy to maintain, test, scale independently |
| **RESTful API** | Standard HTTP methods (GET, POST, PUT, DELETE) | Predictable contracts, compatible with any client |
| **Stateless Backend** | No session storage; each request independent | Horizontally scalable, simple to deploy |
| **Client-Side Filtering** | Frontend filters tasks in-memory | Instant UX without server round-trip |
| **Optimistic Updates** | UI updates immediately, then syncs with server | Feels fast even on slow networks |
| **Type Safety at Boundary** | Mongoose schema validates before save | Prevents invalid data in database |

---

## Build Process

### Frontend Build (Vite)

#### Development: `npm run dev --prefix frontend`

```bash
$ vite
  VITE v8.0.8 ready in 300 ms
  ➜ Local: http://localhost:5173/
```

**What Happens:**
1. **Dev Server Starts** on port 5173
2. **Module Resolution**: Vite converts ES modules to browser-compatible format
3. **Hot Module Replacement (HMR)**: File changes trigger reload of changed modules only (preserves React state)
4. **Proxy Setup**: Requests to `/tasks` forward to `http://localhost:5000` (backend)
5. **Babel/JSX Transform**: `.jsx` files compiled to JavaScript
6. **CSS Processing**: CSS variables substituted, vendor prefixes added

**Why Vite?**
- **Speed**: Only loads changed modules (not entire bundle)
- **HMR**: Updates UI without full page reload
- **No Build Step**: Direct ES modules in browser (native support)

#### Production: `npm run build --prefix frontend`

```bash
$ vite build
  ✓ 70 modules transformed
  dist/index.html           0.80 kB
  dist/assets/index-*.css   12.71 kB (gzipped)
  dist/assets/index-*.js    233.74 kB (gzipped)
  ✓ built in 262ms
```

**Optimization Steps:**
1. **Minification**: Remove whitespace, shorten variable names
2. **Tree-Shaking**: Remove unused code from React, dependencies
3. **Code Splitting**: Separate vendor code from app code
4. **Hashing**: Filename includes hash for cache busting
5. **Compression**: Gzip reduces JS by 80%+

**File Sizes:**
- HTML: Tiny entry point with root div
- CSS: All styles (glassmorphism, animations, responsive)
- JS: React + App components + Axios

### Backend Build (Node.js)

#### Development: `npm run dev --prefix backend`

```bash
$ nodemon server.js
  [nodemon] watching path(s): *.*
  ✅ Connected to MongoDB Atlas
  🚀 Server running on http://localhost:5000
```

**Nodemon Advantages:**
- Automatic restart on `.js` file changes
- Preserves console output history
- Can type `rs` to manually restart

#### Production: `npm run start --prefix backend`

```bash
$ node server.js
  ✅ Connected to MongoDB Atlas
  🚀 Server running on http://localhost:5000
```

- Direct execution (lighter than Nodemon)
- Needs external process manager (PM2) for auto-restart

### Combined Command: `npm run dev`

Uses **concurrently**:
```bash
$ npm run dev
> concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend"

[BACKEND] ✅ Connected to MongoDB Atlas
[FRONTEND] VITE v8.0.8 ready in 300 ms
```

Both services run in **same terminal**, color-coded, processes managed together.

---

## Backend Codebase

### `backend/server.js` — Application Entry Point

#### IPv4 DNS Configuration

```javascript
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
// Forces IPv4 DNS lookups (prevents SRV record issues on some networks)
```

**Why:** On certain networks/ISPs, DNS SRV records are blocked, causing "ECONNREFUSED" errors. IPv4-first bypasses this.

#### Environment & Imports

```javascript
require("dotenv").config();  // Load .env into process.env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const taskRoutes = require("./routes/tasks");
```

**Order Matters:**
- Dotenv loaded first (other modules may need env vars)
- Express and database drivers loaded next
- Routes imported after dependencies ready

#### CORS Middleware

```javascript
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
```

**CORS (Cross-Origin Resource Sharing):**
- **origin**: Allowed frontend URLs (dev vs. production)
- **methods**: Which HTTP verbs allowed (no TRACE)
- **allowedHeaders**: Which request headers allowed

**Dynamic URL:**
- **Dev**: `http://localhost:5173` (frontend dev server)
- **Prod**: `https://mybucket.s3.amazonaws.com` (S3 static site)
- **Fallback**: Default to localhost if not set

#### JSON Parsing Middleware

```javascript
app.use(express.json());
// Auto-parses Content-Type: application/json
// Makes req.body available as object
```

#### Routes & Error Handlers

```javascript
app.use("/tasks", taskRoutes);
// All /tasks/* requests → routes/tasks.js

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Mini Todo API is running 🚀" });
});
// Health check (used by load balancers, monitoring)

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
// 404 handler for unmapped routes

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error", details: err.message });
});
// Global error handler (catches exceptions in route handlers)
```

#### Database Connection

```javascript
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set. Please check your .env file.");
  process.exit(1);  // Exit immediately if config invalid
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,  // Wait 10s for server response
  family: 4,  // Force IPv4 (critical for some networks)
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});
```

**Connection Pattern:**
- Validate config before attempting connection
- Connection string includes credentials (kept in .env)
- IPv4 forced to avoid DNS issues
- Only start HTTP server **after** DB connection succeeds
- Exit if either database or server startup fails

### `backend/models/Task.js` — Data Schema

```javascript
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    completed: {
      type: Boolean,
      default: false,  // New tasks not complete by default
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }  // Auto-adds createdAt, updatedAt
);

module.exports = mongoose.model("Task", taskSchema);
```

**Field Validation:**

| Field | Type | Rules | Purpose |
|-------|------|-------|---------|
| `title` | String | required, max 200, trimmed | Task description |
| `completed` | Boolean | default: false | Is task done? |
| `priority` | String | enum [low/medium/high], default: medium | Urgency level |
| `createdAt` | Date | auto-generated | When created |
| `updatedAt` | Date | auto-generated | Last modified |

**Trim Behavior:**
```javascript
// Input: "  Buy groceries  "
// Stored: "Buy groceries"
// Prevents whitespace-only tasks
```

**Enum Enforcement:**
Mongoose prevents invalid priority values:
```javascript
// ✓ Allowed: "low", "medium", "high"
// ✗ Rejected: "urgent", "MEDIUM", "highest"
```

### `backend/routes/tasks.js` — CRUD Endpoints

#### GET /tasks — Fetch All Tasks

```javascript
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    // find() = no filter = all documents
    // sort({ createdAt: -1 }) = newest first (descending)
    res.json(tasks);  // JSON serialize + send
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
  }
});
```

**Response (200 OK):**
```json
[
  {
    "_id": "66a4b21f7e4c9d2a3f8b9c01",
    "title": "Deploy to AWS",
    "completed": false,
    "priority": "high",
    "createdAt": "2026-04-14T10:30:00.000Z",
    "updatedAt": "2026-04-14T10:30:00.000Z"
  }
]
```

#### POST /tasks — Create Task

```javascript
router.post("/", async (req, res) => {
  try {
    const { title, priority } = req.body;

    // Validate: title required and not empty
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Task title is required" });
    }

    // Create instance (doesn't save yet)
    const task = new Task({ 
      title: title.trim(),
      priority: priority || "medium"  // Use default if not provided
    });

    // Save to MongoDB (runs schema validation)
    const saved = await task.save();
    res.status(201).json(saved);  // 201 = Created
  } catch (err) {
    res.status(500).json({ error: "Failed to create task", details: err.message });
  }
});
```

**Input Validation:**
1. Frontend validates (AddTask component)
2. Backend validates again (defense in depth)
3. Mongoose schema validates on `.save()`

**Request Example:**
```json
{
  "title": "Deploy to AWS",
  "priority": "high"
}
```

**Response (201 Created):**
MongoDB auto-generates `_id`, timestamps:
```json
{
  "_id": "66a4b21f7e4c9d2a3f8b9c01",
  "title": "Deploy to AWS",
  "completed": false,
  "priority": "high",
  "createdAt": "2026-04-14T10:30:00.000Z",
  "updatedAt": "2026-04-14T10:30:00.000Z"
}
```

#### PUT /tasks/:id — Update Task

```javascript
router.put("/:id", async (req, res) => {
  try {
    const { completed, title, priority } = req.body;
    const updateFields = {};

    // Only include fields that were provided in request
    if (typeof completed === "boolean") updateFields.completed = completed;
    if (title !== undefined) updateFields.title = title.trim();
    if (priority !== undefined) updateFields.priority = priority;

    // Atomic update + return new document
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },  // MongoDB $set operator
      { new: true, runValidators: true }  // Return updated doc, validate
    );

    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task", details: err.message });
  }
});
```

**Partial Update Pattern:**
- Only sends changed fields
- Server merges with existing
- Example: just `{ completed: true }` leaves title/priority unchanged

**Common Uses:**
```javascript
// Toggle completion
PUT /tasks/:id
{ "completed": true }

// Change priority
PUT /tasks/:id
{ "priority": "low" }

// Edit title
PUT /tasks/:id
{ "title": "New title" }
```

#### DELETE /tasks/:id — Delete Task

```javascript
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task", details: err.message });
  }
});
```

**Response (200 OK):**
```json
{
  "message": "Task deleted",
  "id": "66a4b21f7e4c9d2a3f8b9c01"
}
```

---

## Frontend Codebase

### `frontend/src/main.jsx` — React Entry

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Process:**
1. Find `<div id="root">` in HTML
2. Create React root
3. Render `<App>` component
4. Import global CSS (applied to entire app)
5. `StrictMode` enables additional dev warnings (double render in dev)

### `frontend/src/App.jsx` — Root Component

#### State Management

```javascript
export default function App() {
  const [tasks, setTasks] = useState([]);          // All tasks
  const [loading, setLoading] = useState(true);    // Fetching?
  const [filter, setFilter] = useState("all");     // Current filter
  const [toasts, setToasts] = useState([]);        // Notifications

  // Component JSX below...
}
```

**Why Each State?**
- `tasks`: Rendered list source
- `loading`: Show spinner while fetching
- `filter`: Which tasks displayed
- `toasts`: Notifications queue

#### Toast System (Notifications)

```javascript
const addToast = useCallback((message, type = "success") => {
  const id = Date.now();  // Unique ID per notification
  setToasts((prev) => [...prev, { id, message, type }]);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3000);
}, []);
```

**Pattern:**
- `Date.now()` creates pseudo-unique ID
- New toast appended to array (non-blocking)
- Timer auto-removes after 3s
- Type ("success" vs "error") determines color

**Usage:**
```javascript
addToast("Task added! 🎉", "success");
addToast("Connection lost", "error");
```

#### Fetch Tasks

```javascript
const fetchTasks = useCallback(async () => {
  try {
    setLoading(true);
    const { data } = await axios.get(API);  // API = "http://localhost:5000/tasks"
    setTasks(data);
  } catch {
    addToast("Failed to load tasks — is the server running?", "error");
  } finally {
    setLoading(false);
  }
}, [addToast]);

useEffect(() => {
  fetchTasks();
}, [fetchTasks]);  // Runs once on mount
```

**Effect Hook:**
- Dependency array includes `fetchTasks` (triggers if fetch definition changes)
- Actually runs only once on mount (functions are stable with `useCallback`)

#### Add Task

```javascript
const handleAdd = async ({ title, priority }) => {
  try {
    const { data } = await axios.post(API, { title, priority });
    setTasks((prev) => [data, ...prev]);  // Prepend to top
    addToast("Task added! 🎉");
  } catch {
    addToast("Could not add task.", "error");
  }
};
```

**Prepend vs Append:**
- `[data, ...prev]` puts new task at top (newest first)
- Aligns with backend sort order (createdAt descending)
- Natural UX: newly created task visible immediately

#### Toggle Completion

```javascript
const handleToggle = async (id, completed) => {
  try {
    const { data } = await axios.put(`${API}/${id}`, { 
      completed: !completed 
    });
    setTasks((prev) => 
      prev.map((t) => (t._id === id ? data : t))  // Replace if ID matches
    );
    addToast(
      data.completed ? "Task completed ✓" : "Marked as pending"
    );
  } catch {
    addToast("Could not update task.", "error");
  }
};
```

**Immutable Update Pattern:**
- Creates new array (not mutating original)
- Replaces task with ID matching
- React detects change → re-renders

#### Delete Task

```javascript
const handleDelete = async (id) => {
  try {
    await axios.delete(`${API}/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    addToast("Task deleted.");
  } catch {
    addToast("Could not delete task.", "error");
  }
};
```

**Filter Pattern:**
- Creates new array excluding task with matching ID
- React re-renders without deleted task

#### Filtering (Client-Side)

```javascript
const filteredTasks = tasks.filter((t) => {
  if (filter === "pending") return !t.completed;
  if (filter === "done") return t.completed;
  return true;  // "all"
});
```

**No Server Call:**
- Filtering happens locally (instant, no network latency)
- Backend returns all tasks, frontend filters

#### Statistics

```javascript
const totalCount = tasks.length;
const doneCount = tasks.filter((t) => t.completed).length;
const pendingCount = totalCount - doneCount;
```

**Derived State:**
- Calculated from `tasks` array
- Re-computed on every render (fast for small datasets)

### `frontend/src/components/AddTask.jsx` — Add Form

```javascript
export default function AddTask({ onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError("Please enter a task title.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onAdd({ title: trimmed, priority });
      setTitle("");  // Clear on success
      setPriority("medium");
    } finally {
      setLoading(false);
    }
  };

  // Submit on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  return (
    <section className="add-task-card" aria-label="Add a new task">
      {/* Inputs and button */}
    </section>
  );
}
```

**Key Features:**
- **Controlled Inputs**: State-driven (single source of truth)
- **Validation**: Empty title prevented
- **Error Display**: Inline message
- **Loading State**: Disables inputs while submitting (prevents duplicates)
- **Form Clear**: Resets on success
- **Enter Key**: Submits on `Enter` (keyboard shortcut)

### `frontend/src/components/TaskList.jsx` — List Container

```javascript
export default function TaskList({ tasks, loading, filter, onToggle, onDelete }) {
  if (loading) {
    return <div className="spinner-wrap" aria-label="Loading tasks">
      <div className="spinner" />
    </div>;
  }

  const emptyMessages = {
    all: { icon: "📭", text: "No tasks yet.\nAdd your first task!" },
    pending: { icon: "🎉", text: "All done! No pending tasks." },
    done: { icon: "⏳", text: "Nothing completed yet." },
  };

  if (tasks.length === 0) {
    const { icon, text } = emptyMessages[filter] || emptyMessages.all;
    return <div className="empty-state" aria-live="polite">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>;
  }

  return (
    <section className="task-list-section" aria-label="Task list">
      <h2>Tasks — {tasks.length} shown</h2>
      <ul className="task-list" role="list">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}
```

**Rendering Logic:**
1. **Loading**: Show spinner
2. **Empty**: Show contextual message (changes per filter)
3. **Has Data**: Render task list

**Key Prop:**
`key={task._id}` helps React track list changes (efficient re-renders).

### `frontend/src/components/TaskItem.jsx` — Task Card

```javascript
const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TaskItem({ task, onToggle, onDelete }) {
  const { _id, title, completed, priority, createdAt } = task;

  return (
    <li className={`task-item ${completed ? "completed" : ""}`} data-priority={priority}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(_id, completed)}
        aria-label={`Mark "${title}" as ${completed ? "pending" : "complete"}`}
      />

      {/* Content */}
      <div className="task-body">
        <p className="task-title" title={title}>{title}</p>
        <div className="task-meta">
          <span className={`priority-badge ${priority}`}>
            {PRIORITY_LABEL[priority]}
          </span>
          {createdAt && <span className="task-date">{formatDate(createdAt)}</span>}
        </div>
      </div>

      {/* Delete */}
      <button className="delete-btn" onClick={() => onDelete(_id)}>
        ✕
      </button>
    </li>
  );
}
```

**Structure:**
- **Checkbox**: Toggles completion
- **Body**: Title + metadata (priority, created date)
- **Delete Button**: Remove task

**CSS Classes:**
- `.completed` added if done (CSS shows strikethrough)
- `data-priority` used by CSS for border color
- Accessibility attributes for screen readers

### `frontend/src/components/Toast.jsx` — Notifications

```javascript
export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast ${type}`}>
          {message}
        </div>
      ))}
    </div>
  );
}
```

**Simple:**
- Maps toasts array to DOM elements
- Class `{type}` determines color (success = green, error = red)
- Returns `null` when empty (no DOM overhead)

### `frontend/vite.config.js` — Dev Proxy

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    proxy: {
      "/tasks": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

**Proxy Function:**
- Browser requests `/tasks`
- Vite intercepts, forwards to `http://localhost:5000/tasks`
- Response forwarded back to browser
- **Eliminates CORS complexity** during dev

---

## Data Flow

### Complete Add Task Lifecycle

```
USER
  ↓ Types "Deploy to AWS", selects "high" priority
ADDTASK COMPONENT
  ↓ Form validation passes
  ↓ handleSubmit → onAdd callback
APP.JS (HANDLEADD)
  ↓ axios.post("http://localhost:5000/tasks", {title, priority})
VITE PROXY (DEV)
  ↓ Intercepts /tasks request
  ↓ Forwards to http://localhost:5000
BROWSER NETWORK
  ↓ HTTP POST arrives at backend
BACKEND - CORS MIDDLEWARE
  ↓ Checks: Origin in allowlist?
  ✓ Yes (http://localhost:5173 allowed)
BACKEND - JSON PARSER
  ↓ Parses request body
BACKEND - ROUTES/TASKS.JS (POST /)
  ↓ Validates: title non-empty?
  ✓ Yes
  ↓ Creates Task instance
MONGOOSE SCHEMA VALIDATION
  ↓ Checks: title required?
  ✓ Yes
  ↓ Checks: priority in enum?
  ✓ Yes
MONGODB ATLAS
  ↓ INSERT INTO mini-todo collection
  ↓ Auto-generates _id
  ↓ Auto-sets timestamps (createdAt, updatedAt)
  ↓ Returns saved document
BACKEND - RESPONSE
  ↓ res.status(201).json(savedTask)
BROWSER NETWORK
  ↓ HTTP 201 Created + task JSON
AXIOS
  ↓ Resolves promise with { data: savedTask }
APP.JS (HANDLEADD)
  ↓ setTasks((prev) => [data, ...prev])  // Prepend
  ↓ addToast("Task added! 🎉")
REACT
  ↓ Re-renders with new task at top
BROWSER
  ↓ User sees new task appear with animation
```

---

## API Reference

### Endpoints Summary

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/tasks` | — | 200 + array of tasks |
| POST | `/tasks` | `{title, priority?}` | 201 + created task |
| PUT | `/tasks/:id` | `{completed?, title?, priority?}` | 200 + updated task |
| DELETE | `/tasks/:id` | — | 200 + message |

### Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Success (GET, PUT, DELETE) |
| 201 | Created | Task successfully created |
| 400 | Bad Request | Empty title sent |
| 404 | Not Found | Task ID doesn't exist |
| 500 | Server Error | Database error or unhandled exception |

---

## Design System

### Glassmorphism Technique

```css
.glass {
  background: rgba(255, 255, 255, 0.055);  /* Barely opaque layer */
  backdrop-filter: blur(20px);              /* Blur everything behind */
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

**Why This Works:**
- Blur creates perceived depth (foreground vs background)
- Semi-transparent background shows color through
- Subtle border adds definition without appearing "flat"
- Shadow grounds element in 3D space

### Color Palette (CSS Variables)

```css
:root {
  --bg-base: #07070f;               /* Near-black background */
  --text-primary: #f0eeff;          /* Off-white text */
  --accent-primary: #7c5cfc;        /* Violet accent */
  --priority-high: #f87171;         /* Red for high priority */
  --priority-medium: #fbbf24;       /* Amber for medium */
  --priority-low: #34d399;          /* Green for low */
}
```

**Benefits:**
- Consistent theming across all components
- Single location to change entire color scheme
- Easy A/B testing of themes

### Responsive Design

**Mobile-First Approach:**
```css
.stats-bar {
  display: flex;
  gap: 12px;
}
/* Each stat chip is flex: 1 (equal width) */
```

**Adapts to:**
- Phone (vertical stack if needed)
- Tablet (3-column grid)
- Desktop (full layout)

---

## Environment Setup

### `.env` File (backend/)

```env
MONGO_URI=mongodb://username:password@cluster.mongodb.net:27017/mini-todo?ssl=true
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_URI` | MongoDB connection (includes credentials) | `mongodb://...` |
| `PORT` | Express server port | `5000` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |

**Security:**
- Never commit `.env` (listed in `.gitignore`)
- Each environment (dev/staging/prod) has separate `.env`
- Production uses environment variables from hosting platform

---

## Running the App

### Step 1: Install Dependencies

```bash
cd E:\Task
npm run install:all
```

Installs:
- Root: `concurrently`
- Backend: `express`, `mongoose`, `cors`, `dotenv`, `nodemon`
- Frontend: `react`, `react-dom`, `axios`, `vite`, `eslint`

### Step 2: Configure Backend

```bash
# Edit backend/.env
MONGO_URI=your-mongodb-atlas-connection-string
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Step 3: Start Everything

```bash
npm run dev
```

**Expected Output:**
```
[BACKEND] ✅ Connected to MongoDB Atlas
[BACKEND] 🚀 Server running on http://localhost:5000
[FRONTEND] VITE v8.0.8 ready in 300 ms
[FRONTEND] ➜ Local: http://localhost:5173/
```

### Step 4: Open in Browser

Navigate to: `http://localhost:5173`

---

## Deployment

### Frontend (S3 + CloudFront)

**Build:**
```bash
npm run build --prefix frontend
```
Output: `frontend/dist/`

**Upload to S3:**
```bash
aws s3 sync frontend/dist/ s3://mybucket/ --delete
```

**Cache Invalidation:**
```bash
aws cloudfront create-invalidation --distribution-id ABCD --paths "/*"
```

### Backend (EC2 + PM2)

**1. Launch EC2 (Ubuntu 22.04)**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2
```

**2. Upload Backend**
```bash
scp -r backend/ ubuntu@ec2-ip:/home/ubuntu/app/
```

**3. Start with PM2**
```bash
cd /home/ubuntu/app/backend
pm2 start server.js --name mini-todo
pm2 save
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `MONGO_URI not set` | Missing `.env` | Create `backend/.env` with `MONGO_URI` |
| `Connection refused on 5000` | Backend not running | Run `npm run backend` |
| `SRV ECONNREFUSED` | DNS issue | Already fixed in `server.js` with IPv4-first |
| `Port already in use` | Process still running | Kill: `lsof -i :5173 \| awk '{print $2}' \| xargs kill` |
| `CORS error` | Frontend URL not whitelisted | Update `CLIENT_ORIGIN` in `.env` |
| `Tasks not loading` | Network/proxy issue | Ensure backend & frontend both running |

---

## Key Takeaways

### Architecture
- **Separation of Concerns**: Backend (data) vs Frontend (UI)
- **RESTful**: Standard HTTP for compatibility
- **Stateless**: Scales horizontally, simple deployment

### Frontend
- **React Hooks**: `useState`, `useEffect` for state & side effects
- **Controlled Components**: Form inputs state-driven
- **Optimistic Updates**: UI instant, syncs with server

### Backend
- **Middleware Pipeline**: CORS → parsing → routes → errors
- **Schema Validation**: Mongoose enforces data integrity
- **Error Handling**: Descriptive for debugging

### Code Organization
- **Components**: Reusable, single responsibility
- **Centralized Styles**: One CSS file, CSS variables for theming
- **Models**: Schema separate from routes

---

**Generated:** April 2026 · Version 1.0 · Full-Stack MERN  
**Repository:** https://github.com/Goutham-K-278/to-do-list
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
├── backend/                      # Node.js + Express backend
│   ├── server.js                 # App entry — forces IPv4, connects DB, starts server
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Environment variables (NEVER commit this)
│   ├── models/
│   │   └── Task.js               # Mongoose schema/model for a Task
│   └── routes/
│       └── tasks.js              # All CRUD route handlers (/tasks)
│
├── frontend/                     # React frontend (Vite)
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

File: `backend/models/Task.js`

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

All styles live in `frontend/src/index.css` using CSS custom properties.

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

File: `backend/.env`

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
1. Open `backend/.env`
2. Replace the `MONGO_URI` placeholder with your real MongoDB Atlas connection string
   - In MongoDB Atlas: **Connect → Drivers → Copy connection string**
   - Replace `<username>`, `<password>`, `<cluster>` with your actual values

### Step 2 — Install Dependencies
Run this command from the root folder `E:\Task\` to install all dependencies for both frontend and backend:
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
[BACKEND] ✅  Connected to MongoDB Atlas
[BACKEND] 🚀  Server running on http://localhost:5000
[FRONTEND]   VITE v8.0.8  ready in 300 ms
```

Open your browser to: **http://localhost:5173**

The Vite proxy automatically forwards `/tasks` API calls to `http://localhost:5000` during development — no CORS errors.

---

## Packages Used

### Root Tooling
| Package        | Version | What it does                                         |
|----------------|---------|------------------------------------------------------|
| `concurrently` | ^8.2    | Runs both frontend and backend dev scripts in a single terminal |

### Backend (`backend/`)

| Package     | Version | What it does                                              |
|-------------|---------|-----------------------------------------------------------|
| `express`   | ^4.18   | Web framework — defines routes and handles HTTP requests  |
| `mongoose`  | ^8.3    | MongoDB ODM — defines schema, validates, queries          |
| `cors`      | ^2.8    | Cross-Origin Resource Sharing — allows frontend to call API|
| `dotenv`    | ^16.4   | Loads variables from `.env` file into `process.env`       |
| `nodemon`   | ^3.1    | Dev tool — auto-restarts server when you change files     |

### Frontend (`frontend/`)

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
cd E:\Task\frontend
npm run build
```
This creates `frontend/dist/` — that's what you upload to S3.

### Step 2 — S3 Setup
1. Create an S3 bucket, enable **Static Website Hosting**
2. Set index document to `index.html`
3. Make bucket public (or use CloudFront)
4. Upload `frontend/dist/` contents to the bucket
5. Update `frontend/src/App.jsx` line: change `const API = "/tasks"` to `const API = "http://<your-ec2-ip>:5000/tasks"` before building

### Step 3 — EC2 Setup
1. Launch EC2 instance (Ubuntu 22.04 recommended)
2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`
3. Upload the `backend/` folder to EC2 (via `scp` or CodeDeploy)
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
| `MONGO_URI is not set` error | Open `backend/.env` and fill in your MongoDB connection string |
| `Connection refused` on port 5000 | Make sure the backend is running (`npm run dev` in `backend/`) |
| Tasks not loading on frontend | Check browser console — is the Vite proxy running? Both servers must be up |
| CORS error in production | Set `CLIENT_ORIGIN` in `.env` to your exact S3 URL (no trailing slash) |
| MongoDB auth error | Check your Atlas username/password in the connection string |
| Port 5173 already in use | Change `port` in `frontend/vite.config.js` or kill the process |

---

*Last updated: April 2026 — Mini Todo v1.0*
