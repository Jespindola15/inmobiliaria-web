import "./admin.css";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api"; 

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/clientes`)
      .then(response => {
        if (!response.ok) throw new Error("Error al cargar los clientes");
        return response.json();
      })
      .then(data => {
        setClientes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setClientes([]); 
      });
  }, []);

  const filteredClientes = (clientes || []).filter(cliente => 
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-section">Cargando clientes...</div>;
  if (error) return <div className="admin-section">Error: {error}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Total Clientes</span>
          <strong>{clientes.length}</strong>
        </div>
        <div className="stat-card">
          <span>Clientes Activos</span>
          <strong>{clientes.filter(c => c.estado === "Activo").length}</strong>
        </div>
        <div className="stat-card">
          <span>Nuevos (Mes)</span>
          <strong>-</strong>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Última Interacción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <strong>{cliente.nombre}</strong><br />
                    <small style={{color: '#6b7280'}}>{cliente.email}</small>
                  </td>
                  <td>{cliente.telefono}</td>
                  <td>{cliente.ultima || "N/A"}</td>
                  <td>
                    <span className={`status-badge ${cliente.estado === "Activo" ? "status-active" : "status-expired"}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Editar">✏️</button>
                      <button className="action-btn" title="Ver historial">👁️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>No se encontraron clientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

    
      {showForm && (
        <div className="modal-form">
          <h2>Nuevo Cliente</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Nombre completo" required />
            <input type="number" placeholder="Número de teléfono" required />
            <input type="email" placeholder="Correo electrónico" required />
            <textarea placeholder="Observaciones o notas adicionales"></textarea>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Guardar Cliente</button>
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
