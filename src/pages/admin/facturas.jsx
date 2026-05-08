import "./admin.css";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export default function Facturas() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/facturas`)
      .then(response => {
        if (!response.ok) throw new Error("Error al cargar las facturas");
        return response.json();
      })
      .then(data => {
        setFacturas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setFacturas([]);
      });
  }, []);

  const filteredFacturas = (facturas || []).filter(factura => 
    factura.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-section">Cargando facturas...</div>;
  if (error) return <div className="admin-section">Error: {error}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Recaudación Mes</span>
          <strong>-</strong>
        </div>
        <div className="stat-card">
          <span>Pendiente de Cobro</span>
          <strong>-</strong>
        </div>
        <div className="stat-card">
          <span>Facturas Vencidas</span>
          <strong>{facturas.filter(f => f.estado === "Vencida").length}</strong>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por cliente o N° de factura..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Crear Factura
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Cliente</th>
              <th>Fecha Emisión</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacturas.length > 0 ? (
              filteredFacturas.map((factura) => (
                <tr key={factura.id}>
                  <td>{factura.id}</td>
                  <td>{factura.cliente}</td>
                  <td>{factura.fecha}</td>
                  <td>{factura.monto}</td>
                  <td>
                    <span className={`status-badge ${
                      factura.estado === "Pagada" ? "status-paid" : 
                      factura.estado === "Pendiente" ? "status-pending" : "status-overdue"
                    }`}>
                      {factura.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Descargar">📥</button>
                      <button className="action-btn" title="Enviar por mail">✉️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>No se encontraron facturas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Overlay oscuro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nueva Factura</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="ID Contrato relacionado" required />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <input type="text" placeholder="Mes" required />
              <input type="number" placeholder="Año" defaultValue="2024" required />
            </div>
            <input type="number" placeholder="Monto Total ($)" required />
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Vencimiento</label>
              <input type="date" required />
            </div>
            <textarea placeholder="Conceptos adicionales o recargos"></textarea>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Emitir Factura</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
