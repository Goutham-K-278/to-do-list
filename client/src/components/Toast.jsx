export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast ${type}`}>
          {message}
        </div>
      ))}
    </div>
  );
}
