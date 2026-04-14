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
    <li
      className={`task-item ${completed ? "completed" : ""}`}
      data-priority={priority}
      role="listitem"
    >
      {/* Checkbox */}
      <input
        id={`checkbox-${_id}`}
        type="checkbox"
        className="task-checkbox"
        checked={completed}
        onChange={() => onToggle(_id, completed)}
        aria-label={`Mark "${title}" as ${completed ? "pending" : "complete"}`}
      />

      {/* Body */}
      <div className="task-body">
        <p className="task-title" title={title}>
          {title}
        </p>
        <div className="task-meta">
          <span className={`priority-badge ${priority}`}>
            {PRIORITY_LABEL[priority]}
          </span>
          {createdAt && (
            <span className="task-date">{formatDate(createdAt)}</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        id={`delete-${_id}`}
        className="delete-btn"
        onClick={() => onDelete(_id)}
        aria-label={`Delete task "${title}"`}
        title="Delete task"
      >
        ✕
      </button>
    </li>
  );
}
