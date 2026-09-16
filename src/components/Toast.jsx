const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className={`app-toast ${toast.type || ''}`} role="status">
      <i className={`bi ${toast.type === 'error' ? 'bi-x-circle-fill' : toast.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} />
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Close notification"><i className="bi bi-x" /></button>
    </div>
  );
};

export default Toast;
