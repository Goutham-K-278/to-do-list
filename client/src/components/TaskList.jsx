import TaskItem from "./TaskItem";

export default function TaskList({ tasks, loading, filter, onToggle, onDelete }) {
  if (loading) {
    return (
      <div className="spinner-wrap" aria-label="Loading tasks">
        <div className="spinner" />
      </div>
    );
  }

  const emptyMessages = {
    all: { icon: "📭", text: "No tasks yet.\nAdd your first task above to get started!" },
    pending: { icon: "🎉", text: "All done! No pending tasks." },
    done: { icon: "⏳", text: "Nothing completed yet. Get to work!" },
  };

  if (tasks.length === 0) {
    const { icon, text } = emptyMessages[filter] || emptyMessages.all;
    return (
      <div className="empty-state" aria-live="polite">
        <div className="empty-icon">{icon}</div>
        <p>{text}</p>
      </div>
    );
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
