import { useState } from "react";
import "./admin.css";

export default function Dashboard({ events = [], onNavigateToCitas }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const upcomingAppointments = events
    .filter((appointment) => appointment.start >= today && appointment.start <= endOfDay)
    .sort((a, b) => a.start - b.start);

  const formatTime = (date) =>
    new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date);

  const getClientName = (title) => {
    if (!title) return "Cita";
    const parts = title.split(":");
    if (parts.length > 1) {
      const rest = parts[1].trim();
      const nameParts = rest.split("-");
      return nameParts[0].trim();
    }
    return title;
  };

  const getAppointmentLocation = (title) => {
    if (!title) return "";
    const parts = title.split("-");
    return parts.length > 1 ? parts[1].trim() : "";
  };

  const closeDetails = () => setSelectedAppointment(null);

  return (
    <div className="admin-page">
      
      {/* MAIN */}
      <main className="admin-panel-main">
      

        {/* CARDS */}
        <section className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Propiedades</h3>
            <p>Información futura</p>
          </div>

          <div className="dashboard-card">
            <h3>Clientes</h3>
            <p>Información futura</p>
          </div>

          <div className="dashboard-card">
            <h3>Contratos</h3>
            <p>Información futura</p>
          </div>

          <div className="dashboard-card">
            <h3>Facturación</h3>
            <p>Información futura</p>
          </div>
        </section>

        {/* SECCIONES GRANDES */}
        <section className="dashboard-grid">
          
          <div className="dashboard-section-large">
            <h2>Actividad reciente</h2>
            <p>
             mostrar contratos recientes, propiedades
              nuevas o incluso gráficos.
            </p>
          </div>

          <div className="dashboard-section-small">
            <h2>Citas</h2>

            {upcomingAppointments.length > 0 ? (
              <div className="dashboard-upcoming-list">
                {upcomingAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    className="appointment-item"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div>
                      <strong>{getClientName(appointment.title)}</strong>
                    </div>
                    <div className="appointment-time">
                      {formatTime(appointment.start)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p>No hay citas programadas para hoy.</p>
            )}

            <button className="dashboard-btn" onClick={onNavigateToCitas}>
              Ir a Citas
            </button>
          </div>

        </section>

        {selectedAppointment && (
          <>
            <div className="modal-overlay" onClick={closeDetails}></div>
            <div className="modal-details">
              <div className="modal-details-header">
                <h2>Detalle de la cita</h2>
                <button type="button" className="modal-close-btn" onClick={closeDetails}>
                  ×
                </button>
              </div>
              <div className="modal-details-body">
                <p><strong>Cliente:</strong> {getClientName(selectedAppointment.title)}</p>
                {getAppointmentLocation(selectedAppointment.title) && (
                  <p><strong>Ubicación:</strong> {getAppointmentLocation(selectedAppointment.title)}</p>
                )}
                <p><strong>Horario:</strong> {formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}</p>
                {selectedAppointment.desc && (
                  <p><strong>Información:</strong> {selectedAppointment.desc}</p>
                )}
              </div>
              <button className="dashboard-btn" type="button" onClick={closeDetails}>
                Cerrar
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}