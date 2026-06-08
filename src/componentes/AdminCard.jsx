export default function AdminCard({
  title,
  subtitle,
  status,
  statusClass = "",
  details = [],
  actions = null,
  footer = null,
}) {
  return (
    <div className="admin-item-card">
      <div className="admin-item-main">
        <div>
          <p className="admin-item-title">{title}</p>
          {subtitle && <p className="admin-item-subtitle">{subtitle}</p>}
        </div>
        {status && (
          <span className={`status-badge ${statusClass}`}>{status}</span>
        )}
      </div>
      <div className="admin-item-fields">
        {details.map(({ label, value }) => (
          <div className="admin-item-row" key={label}>
            <span className="admin-item-label">{label}</span>
            <span className="admin-item-value">{value ?? "-"}</span>
          </div>
        ))}
      </div>
      {actions && <div className="admin-item-actions">{actions}</div>}
      {footer && <div className="admin-item-footer">{footer}</div>}
    </div>
  );
}
