import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";
import Toast from "./components/Toast";

// Base URL — during development Vite proxies /tasks → localhost:5000
const API = "/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "done"
  const [toasts, setToasts] = useState([]);

  /* ── Toast helpers ─────────────────────────────────────── */
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  /* ── Fetch tasks ───────────────────────────────────────── */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API);
      setTasks(data);
    } catch {
      addToast("Failed to load tasks — is the server running?", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /* ── Add task ──────────────────────────────────────────── */
  const handleAdd = async ({ title, priority }) => {
    try {
      const { data } = await axios.post(API, { title, priority });
      setTasks((prev) => [data, ...prev]);
      addToast("Task added! 🎉");
    } catch {
      addToast("Could not add task.", "error");
    }
  };

  /* ── Toggle complete ───────────────────────────────────── */
  const handleToggle = async (id, completed) => {
    try {
      const { data } = await axios.put(`${API}/${id}`, { completed: !completed });
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
      addToast(data.completed ? "Task completed ✓" : "Marked as pending");
    } catch {
      addToast("Could not update task.", "error");
    }
  };

  /* ── Delete task ───────────────────────────────────────── */
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      addToast("Task deleted.");
    } catch {
      addToast("Could not delete task.", "error");
    }
  };

  /* ── Filter ────────────────────────────────────────────── */
  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - doneCount;

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="logo-icon" aria-hidden="true">✅</div>
        <h1>Mini Todo</h1>
        <p>Stay organized. Ship things. 🚀</p>
      </header>

      {/* Stats */}
      <div className="stats-bar" aria-label="Task statistics">
        <div className="stat-chip">
          <span className="stat-value">{totalCount}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-chip pending">
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-chip done">
          <span className="stat-value">{doneCount}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {/* Add Task */}
      <AddTask onAdd={handleAdd} />

      {/* Filter Bar */}
      <div className="filter-bar" role="group" aria-label="Filter tasks">
        {["all", "pending", "done"].map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        filter={filter}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>Mini Todo · MERN Stack · Built for AWS deployment</p>
      </footer>

      {/* Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
}
