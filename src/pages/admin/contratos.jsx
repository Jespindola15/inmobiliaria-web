import "./admin.css";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export default function Contratos() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/contratos`)
      .then(response => {
        if (!response.ok) throw new Error("Error al cargar los contratos");
        return response.json();
      })
      .then(data => {
        setContratos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setContratos([]);
      });
  }, []);

  const filteredContratos = (contratos || []).filter(contrato => 
    contrato.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.propiedad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-section">Cargando contratos...</div>;
  if (error) return <div className="admin-section">Error: {error}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Contratos Activos</span>
          <strong>{contratos.filter(c => c.estado === "Activo").length}</strong>
        </div>
        <div className="stat-card">
          <span>Valor Mensual Total</span>
          <strong>-</strong>
        </div>
        <div className="stat-card">
          <span>Por Vencer (30 días)</span>
          <strong>-</strong>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por cliente o propiedad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Nuevo Contrato
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Propiedad</th>
              <th>Monto Mensual</th>
              <th>Finalización</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredContratos.length > 0 ? (
              filteredContratos.map((contrato) => (
                <tr key={contrato.id}>
                  <td>{contrato.cliente}</td>
                  <td>{contrato.propiedad}</td>
                  <td>{contrato.monto}</td>
                  <td>{contrato.fin}</td>
                  <td>
                    <span className={`status-badge ${contrato.estado === "Activo" ? "status-active" : "status-expired"}`}>
                      {contrato.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Descargar PDF">📄</button>
                      <button className="action-btn" title="Editar">✏️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>No se encontraron contratos.</td>
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
          <h2>Nuevo Contrato</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <input type="text" placeholder="ID Cliente" required />
              <input type="text" placeholder="ID Propiedad" required />
            </div>
            <input type="number" placeholder="Monto mensual ($)" required />
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Inicio</label>
              <input type="date" required />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Finalización</label>
              <input type="date" required />
            </div>
            <textarea placeholder="Cláusulas especiales o notas"></textarea>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Generar Contrato</button>
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
