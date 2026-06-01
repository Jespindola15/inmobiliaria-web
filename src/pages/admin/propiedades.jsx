import "./admin.css";
import { useState, useEffect } from "react";
import Card from "../../componentes/Card";

const API_BASE_URL = "http://localhost:5000/api";

export default function Propiedades() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/propiedades`)
      .then(response => {
        if (!response.ok) throw new Error("Error al cargar las propiedades");
        return response.json();
      })
      .then(data => {
        setPropiedades(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setPropiedades([]);
      });
  }, []);

  const filteredPropiedades = (propiedades || []).filter(p => 
    p.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-section">Cargando propiedades...</div>;
  if (error) return <div className="admin-section">Error: {error}</div>;

  return (
    <div className="admin-section">
      <div className="admin-actions-bar">
        <div>
          <h2>Gestión de Propiedades</h2>
          <p style={{color: '#6b7280', fontSize: '0.9rem'}}>Administra el catálogo visible en la web.</p>
        </div>
        <div className="search-container" style={{maxWidth: '300px'}}>
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por ubicación o tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Nueva Propiedad
        </button>
      </div>

      <div className="admin-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '20px'}}>
        {filteredPropiedades.length > 0 ? (
          filteredPropiedades.map((p) => (
            <div key={p.id} style={{position: 'relative'}}>
              <Card 
                tipo={p.tipo}
                estado={p.estado}
                imagen={p.imagen}
                ubicacion={p.ubicacion}
                precio={p.precio}
                descripcion={p.descripcion}
              />
              <div style={{position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px'}}>
                <button className="action-btn" style={{background: 'white', borderRadius: '50%'}}>✏️</button>
                <button className="action-btn" style={{background: 'white', borderRadius: '50%'}}>🗑️</button>
              </div>
            </div>
          ))
        ) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px'}}>
            No se encontraron propiedades.
          </div>
        )}
      </div>

      {/* Overlay oscuro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nueva Propiedad</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Dirección" required />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <input type="text" placeholder="Precio (ej: $ 150.000)" required />
              <input type="text" placeholder="Tipo (ej: Departamento)" required />
            </div>
            <input type="text" placeholder="URL de la imagen" />
            <textarea placeholder="Descripción detallada de la propiedad"></textarea>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Guardar Propiedad</button>
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
