import "./admin.css";
import { useState, useEffect } from "react";
import AdminCard from "../../componentes/AdminCard";
import { fetchApi, requestApi } from "../../api";

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipoCliente, setTipoCliente] = useState("Propietario");

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setDni("");
    setTelefono("");
    setEmail("");
    setTipoCliente("Propietario");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !apellido || !dni || !telefono || !email || !tipoCliente) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const payload = {
        nombre,
        apellido,
        dni: Number(dni),
        email,
        telefono,
        tipoCliente,
      };

      const created = await requestApi("/Cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setClientes((prev) => [created || payload, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function loadClientes() {
      try {
        const data = await fetchApi("/Cliente");
        setClientes(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setClientes([]);
      } finally {
        setLoading(false);
      }
    }

    loadClientes();
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

      <div className="admin-list">
        {filteredClientes.length > 0 ? (
          filteredClientes.map((cliente) => (
            <AdminCard
              key={cliente.id}
              title={cliente.nombre || "Cliente"}
              subtitle={cliente.email}
              status={cliente.estado}
              statusClass={cliente.estado === "Activo" ? "status-active" : "status-expired"}
              details={[
                { label: "Teléfono", value: cliente.telefono },
                { label: "Última interacción", value: cliente.ultima || "N/A" },
              ]}
              actions={(
                <>
                  <button className="btn-secondary" type="button">Editar</button>
                  <button className="btn-secondary" type="button">Historial</button>
                </>
              )}
            />
          ))
        ) : (
          <div style={{width: '100%', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px'}}>
            No se encontraron clientes.
          </div>
        )}
      </div>

      
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

    
      {showForm && (
        <div className="modal-form">
          <h2>Nuevo Cliente</h2>
          {error && <p style={{color: '#b91c1c'}}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <select
              value={tipoCliente}
              onChange={(e) => setTipoCliente(e.target.value)}
              required
            >
              <option value="Propietario">Propietario</option>
              <option value="Inquilino">Inquilino</option>
              <option value="Comprador">Comprador</option>
              <option value="Vendedor">Vendedor</option>
            </select>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Guardar Cliente</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { setShowForm(false); resetForm(); }}
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
