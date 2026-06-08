import "./admin.css";
import { useState, useEffect } from "react";
import AdminCard from "../../componentes/AdminCard";
import { fetchApi, requestApi } from "../../api";

export default function Contratos() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadId, setPropiedadId] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [montoFinal, setMontoFinal] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoContrato, setTipoContrato] = useState("Venta");
  const [selectedContrato, setSelectedContrato] = useState(null);

  const resetForm = () => {
    setPropiedadId("");
    setPrecioBase("");
    setMontoFinal("");
    setFechaInicio("");
    setFechaFin("");
    setTipoContrato("Venta");
    setError(null);
  };

  const formatPrice = (value) => {
    if (value == null || value === "") return "-";
    return `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-AR");
  };

  const handleOpenContrato = (contrato) => {
    setSelectedContrato(contrato);
  };

  const handleCloseContrato = () => {
    setSelectedContrato(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!propiedadId || !precioBase || !montoFinal || !fechaInicio || !fechaFin || !tipoContrato) {
      setError("Completa todos los campos del contrato.");
      return;
    }

    try {
      const payload = {
        propiedadId: Number(propiedadId),
        precioBase: Number(precioBase),
        montoFinal: Number(montoFinal),
        fechaInicio,
        fechaFin,
        tipoContrato,
      };

      const created = await requestApi("/Contrato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setContratos((prev) => [created || payload, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [contratosData, propiedadesData] = await Promise.all([
          fetchApi("/Contrato"),
          fetchApi("/Propiedades"),
        ]);
        setContratos(contratosData);
        setPropiedades(propiedadesData);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setContratos([]);
        setPropiedades([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredContratos = (contratos || []).filter((contrato) => {
    const clienteTexto = String(contrato.cliente || contrato.tituloPropiedad || contrato.propiedadId || "").toLowerCase();
    return (
      clienteTexto.includes(searchTerm.toLowerCase()) ||
      String(contrato.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const contratosActivos = contratos.length;
  const valorTotal = contratos.reduce((sum, contrato) => sum + Number(contrato.montoFinal || 0), 0);
  const hoy = new Date();
  const proximosAVencer = contratos.filter((contrato) => {
    const fin = new Date(contrato.fechaFin);
    const dias = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    return dias >= 0 && dias <= 30;
  }).length;

  if (loading) return <div className="admin-section">Cargando contratos...</div>;
  if (error) return <div className="admin-section">Error: {error}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Contratos Activos</span>
          <strong>{contratosActivos}</strong>
        </div>
        <div className="stat-card">
          <span>Valor Total</span>
          <strong>{formatPrice(valorTotal)}</strong>
        </div>
        <div className="stat-card">
          <span>Por Vencer (30 días)</span>
          <strong>{proximosAVencer}</strong>
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

      <div className="admin-list">
        {filteredContratos.length > 0 ? (
          filteredContratos.map((contrato) => (
            <AdminCard
              key={contrato.id}
              title={`Contrato #${contrato.id || "-"}`}
              subtitle={contrato.tituloPropiedad || `Propiedad ${contrato.propiedadId || "-"}`}
              details={[
                { label: "Tipo", value: contrato.tipoContrato },
                { label: "Precio Base", value: formatPrice(contrato.precioBase) },
                { label: "Monto Final", value: formatPrice(contrato.montoFinal) },
                { label: "Inicio", value: formatDate(contrato.fechaInicio) },
                { label: "Fin", value: formatDate(contrato.fechaFin) },
              ]}
              actions={(
                <>
                  <button className="btn-secondary" type="button" onClick={() => handleOpenContrato(contrato)}>
                    Ver
                  </button>
                </>
              )}
            />
          ))
        ) : (
          <div style={{width: '100%', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px'}}>
            No se encontraron contratos.
          </div>
        )}
      </div>

      {(showForm || selectedContrato) && (
        <div className="modal-overlay" onClick={() => {
          if (showForm) setShowForm(false);
          if (selectedContrato) handleCloseContrato();
        }}></div>
      )}

      {selectedContrato && (
        <div className="modal-form">
          <h2>Contrato #{selectedContrato.id}</h2>
          <div className="admin-item-fields" style={{ marginBottom: '16px' }}>
            <div className="admin-item-row">
              <span className="admin-item-label">Propiedad</span>
              <span className="admin-item-value">{selectedContrato.tituloPropiedad || `ID ${selectedContrato.propiedadId}`}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Tipo</span>
              <span className="admin-item-value">{selectedContrato.tipoContrato}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Precio Base</span>
              <span className="admin-item-value">{formatPrice(selectedContrato.precioBase)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Monto Final</span>
              <span className="admin-item-value">{formatPrice(selectedContrato.montoFinal)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Inicio</span>
              <span className="admin-item-value">{formatDate(selectedContrato.fechaInicio)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Fin</span>
              <span className="admin-item-value">{formatDate(selectedContrato.fechaFin)}</span>
            </div>
          </div>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseContrato}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nuevo Contrato</h2>
          {error && <p style={{color: '#b91c1c'}}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <select
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              required
            >
              <option value="">Seleccionar propiedad...</option>
              {propiedades.map((propiedad) => (
                <option key={propiedad.id} value={propiedad.id}>
                  {propiedad.titulo || `${propiedad.tipo} - ${propiedad.direccion ?? propiedad.ciudad ?? propiedad.id}`}
                </option>
              ))}
            </select>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <input
                type="number"
                placeholder="Precio base"
                value={precioBase}
                onChange={(e) => setPrecioBase(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Monto final"
                value={montoFinal}
                onChange={(e) => setMontoFinal(e.target.value)}
                required
              />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Finalización</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </div>
            <select
              value={tipoContrato}
              onChange={(e) => setTipoContrato(e.target.value)}
              required
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Temporal">Temporal</option>
            </select>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Generar Contrato</button>
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
