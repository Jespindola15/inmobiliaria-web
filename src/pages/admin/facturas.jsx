import "./admin.css";
import { useState, useEffect } from "react";
import AdminCard from "../../componentes/AdminCard";
import { fetchApi, requestApi } from "../../api";

export default function Facturas() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [nroFactura, setNroFactura] = useState("");
  const [importe, setImporte] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [tipoFactura, setTipoFactura] = useState("B");
  const [operacion, setOperacion] = useState("Venta");
  const [estado, setEstado] = useState("Pendiente");
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");

  const resetForm = () => {
    setClienteId("");
    setNroFactura("");
    setImporte("");
    setFechaEmision("");
    setFechaVencimiento("");
    setTipoFactura("B");
    setOperacion("Venta");
    setEstado("Pendiente");
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

  useEffect(() => {
    if (selectedFactura) {
      setStatusUpdate(selectedFactura.estado || "Pendiente");
    }
  }, [selectedFactura]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!clienteId || !nroFactura || !importe || !fechaEmision || !fechaVencimiento || !tipoFactura || !operacion || !estado) {
      setError("Completa todos los campos de la factura.");
      return;
    }

    try {
      const payload = {
        clienteId: Number(clienteId),
        nroFactura,
        importe: Number(importe),
        fechaEmision,
        fechaVencimiento,
        tipoFactura,
        operacion,
        estado,
      };

      const created = await requestApi("/Factura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const cliente = clientes.find((c) => c.id === Number(clienteId));
      const createdWithName = {
        ...(created || payload),
        clienteNombre: created?.clienteNombre || `${cliente?.nombre || ""} ${cliente?.apellido || ""}`.trim(),
      };

      setFacturas((prev) => [createdWithName, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleOpenFactura = (factura) => {
    setSelectedFactura(factura);
  };

  const handleCloseFactura = () => {
    setSelectedFactura(null);
    setStatusUpdate("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedFactura) return;

    try {
      const updatedPayload = {
        ...selectedFactura,
        estado: statusUpdate,
      };

      const saved = await requestApi(`/Factura/${selectedFactura.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      setFacturas((prev) => prev.map((f) => (f.id === selectedFactura.id ? saved : f)));
      setSelectedFactura(saved);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [facturasData, clientesData] = await Promise.all([
          fetchApi("/Factura"),
          fetchApi("/Cliente"),
        ]);
        setFacturas(facturasData);
        setClientes(clientesData);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setFacturas([]);
        setClientes([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const recaudacionMes = facturas.filter((f) => f.estado === "Pagada").reduce((sum, f) => sum + Number(f.importe || 0), 0);
  const pendienteCobro = facturas.filter((f) => f.estado === "Pendiente").reduce((sum, f) => sum + Number(f.importe || 0), 0);
  const facturasVencidas = facturas.filter((f) => f.estado === "Vencida").length;

  const filteredFacturas = (facturas || []).filter((factura) => {
    const clienteTexto = String(factura.clienteNombre || factura.cliente || factura.clienteId || "").toLowerCase();
    const facturaTexto = String(factura.nroFactura || factura.id || "").toLowerCase();
    return (
      clienteTexto.includes(searchTerm.toLowerCase()) ||
      facturaTexto.includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <div className="admin-section">Cargando facturas...</div>;
  if (error) return <div className="admin-section">Error: {error}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Recaudación Mes</span>
          <strong>{formatPrice(recaudacionMes)}</strong>
        </div>
        <div className="stat-card">
          <span>Pendiente de Cobro</span>
          <strong>{formatPrice(pendienteCobro)}</strong>
        </div>
        <div className="stat-card">
          <span>Facturas Vencidas</span>
          <strong>{facturasVencidas}</strong>
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

      <div className="admin-list">
        {filteredFacturas.length > 0 ? (
          filteredFacturas.map((factura) => {
            const clienteNombre = factura.clienteNombre || factura.cliente || `Cliente ${factura.clienteId || "-"}`;
            return (
              <AdminCard
                key={factura.id}
                title={`Factura ${factura.nroFactura || factura.id || "-"}`}
                subtitle={clienteNombre}
                status={factura.estado}
                statusClass={
                  factura.estado === "Pagada"
                    ? "status-paid"
                    : factura.estado === "Pendiente"
                    ? "status-pending"
                    : "status-overdue"
                }
                details={[
                  { label: "Tipo", value: factura.tipoFactura },
                  { label: "Operación", value: factura.operacion },
                  { label: "Importe", value: formatPrice(factura.importe) },
                  { label: "Emisión", value: formatDate(factura.fechaEmision) },
                  { label: "Vencimiento", value: formatDate(factura.fechaVencimiento) },
                ]}
                actions={(
                  <>
                    <button className="btn-secondary" type="button" onClick={() => handleOpenFactura(factura)}>
                      Ver
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => handleOpenFactura(factura)}>
                      Cambiar estado
                    </button>
                  </>
                )}
              />
            );
          })
        ) : (
          <div style={{width: '100%', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px'}}>
            No se encontraron facturas.
          </div>
        )}
      </div>

      {/* Overlay oscuro */}
      {(showForm || selectedFactura) && (
        <div className="modal-overlay" onClick={() => {
          if (showForm) setShowForm(false);
          if (selectedFactura) handleCloseFactura();
        }}></div>
      )}

      {selectedFactura && (
        <div className="modal-form">
          <h2>Factura {selectedFactura.nroFactura || selectedFactura.id}</h2>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          <div className="admin-item-fields" style={{ marginBottom: '16px' }}>
            <div className="admin-item-row">
              <span className="admin-item-label">Cliente</span>
              <span className="admin-item-value">{selectedFactura.clienteNombre || `ID ${selectedFactura.clienteId}`}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Tipo</span>
              <span className="admin-item-value">{selectedFactura.tipoFactura}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Operación</span>
              <span className="admin-item-value">{selectedFactura.operacion}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Importe</span>
              <span className="admin-item-value">{formatPrice(selectedFactura.importe)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Emisión</span>
              <span className="admin-item-value">{formatDate(selectedFactura.fechaEmision)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Vencimiento</span>
              <span className="admin-item-value">{formatDate(selectedFactura.fechaVencimiento)}</span>
            </div>
          </div>
          <label style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>Estado</label>
          <select
            value={statusUpdate}
            onChange={(e) => setStatusUpdate(e.target.value)}
            style={{ marginBottom: '18px' }}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Pagada">Pagada</option>
            <option value="Vencida">Vencida</option>
            <option value="Anulada">Anulada</option>
          </select>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-success" onClick={handleUpdateStatus}>
              Guardar estado
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCloseFactura}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nueva Factura</h2>
          {error && <p style={{color: '#b91c1c'}}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido} - {cliente.email}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="N° Factura"
              value={nroFactura}
              onChange={(e) => setNroFactura(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Importe ($)"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              required
            />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Emisión</label>
                <input
                  type="date"
                  value={fechaEmision}
                  onChange={(e) => setFechaEmision(e.target.value)}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  required
                />
              </div>
            </div>
            <select
              value={tipoFactura}
              onChange={(e) => setTipoFactura(e.target.value)}
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <select
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
              required
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
              <option value="Anulada">Anulada</option>
            </select>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Emitir Factura</button>
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
