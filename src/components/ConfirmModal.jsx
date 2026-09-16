const ConfirmModal = ({ open, title, message, confirmLabel = 'Delete', onCancel, onConfirm }) => (
  <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(event) => event.target === event.currentTarget && onCancel()}>
    <div className="modal-sheet confirm-sheet" onClick={(event) => event.stopPropagation()}>
      <div className="modal-handle" />
      <div className="confirm-icon"><i className="bi bi-exclamation-triangle" /></div>
      <div className="modal-title">{title}</div>
      <p className="confirm-message">{message}</p>
      <div className="action-row">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-danger-ghost" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
