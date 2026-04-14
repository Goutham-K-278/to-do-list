import { useState } from "react";

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
      setTitle("");
      setPriority("medium");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  return (
    <section className="add-task-card" aria-label="Add a new task">
      <h2>Add a New Task</h2>

      <div className="input-row">
        <input
          id="task-input"
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          maxLength={200}
          disabled={loading}
          aria-label="Task title"
          autoComplete="off"
        />

        <select
          id="priority-select"
          className="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          aria-label="Task priority"
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <button
          id="add-task-btn"
          className="add-btn"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          aria-label="Add task"
        >
          {loading ? "Adding…" : "+ Add Task"}
        </button>
      </div>

      {error && (
        <p className="error-text" role="alert">
          ⚠ {error}
        </p>
      )}
    </section>
  );
}
