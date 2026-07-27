import "./admin.css";
import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../api";

function useResource(path) {
  return useQuery({
    queryKey: [path],
    queryFn: () => fetchApi(path),
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export default function Dashboard({ events = [], onNavigateToCitas }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const { data: clientes = [], isLoading: loadingClientes, isError: errorClientes, error: clientesError } = useResource("/Cliente");
  const { data: facturas = [], isLoading: loadingFacturas, isError: errorFacturas, error: facturasError } = useResource("/Factura");
  const { data: contratos = [], isLoading: loadingContratos, isError: errorContratos, error: contratosError } = useResource("/Contrato");
  const { data: propiedades = [], isLoading: loadingPropiedades, isError: errorPropiedades, error: propiedadesError } = useResource("/Propiedades");

  const loading = loadingClientes || loadingFacturas || loadingContratos || loadingPropiedades;
  const error = clientesError || facturasError || contratosError || propiedadesError;

  const today = useMemo(() => new Date(), []);
  const startOfDay = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0),
    [today]
  );
  const endOfDay = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999),
    [today]
  );

  const upcomingAppointments = useMemo(
    () =>
      events
        .filter((appointment) => appointment.start >= startOfDay && appointment.start <= endOfDay)
        .sort((a, b) => a.start - b.start),
    [events, startOfDay, endOfDay]
  );

  const formatTime = useCallback(
    (date) => new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(date),
    []
  );

  const getClientName = useCallback((title) => {
    if (!title) return "Cita";
    const parts = title.split(":");
    if (parts.length > 1) {
      const rest = parts[1].trim();
      const nameParts = rest.split("-");
      return nameParts[0].trim();
    }
    return title;
  }, []);

  const getAppointmentLocation = useCallback((title) => {
    if (!title) return "";
    const parts = title.split("-");
    return parts.length > 1 ? parts[1].trim() : "";
  }, []);

  const closeDetails = useCallback(() => setSelectedAppointment(null), []);

  if (loading) return <div className="admin-section">Cargando dashboard...</div>;
  if (error) return <div className="admin-section">Error: {error.message || "No se pudieron obtener los datos."}</div>;

  return (
    <div className="admin-page">
      <main className="admin-panel-main">
        <section className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Propiedades</h3>
            <p>{propiedades.length} registradas</p>
          </div>

          <div className="dashboard-card">
            <h3>Clientes</h3>
            <p>{clientes.length} activos</p>
          </div>

          <div className="dashboard-card">
            <h3>Contratos</h3>
            <p>{contratos.length} vigentes</p>
          </div>

          <div className="dashboard-card">
            <h3>Facturación</h3>
            <p>{facturas.length} facturas</p>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-section-large">
            <h2>Actividad reciente</h2>
            <p>Resumen de la plataforma y accesos rápidos a las áreas clave.</p>
          </div>

          <div className="dashboard-section-small">
            <h2>Citas de hoy</h2>
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
                    <div className="appointment-time">{formatTime(appointment.start)}</div>
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
                <p>
                  <strong>Cliente:</strong> {getClientName(selectedAppointment.title)}
                </p>
                {getAppointmentLocation(selectedAppointment.title) && (
                  <p>
                    <strong>Ubicación:</strong> {getAppointmentLocation(selectedAppointment.title)}
                  </p>
                )}
                <p>
                  <strong>Horario:</strong> {formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}
                </p>
                {selectedAppointment.desc && (
                  <p>
                    <strong>Información:</strong> {selectedAppointment.desc}
                  </p>
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
