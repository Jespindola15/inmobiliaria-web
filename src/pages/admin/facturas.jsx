import "./admin.css";
import { useMemo, useReducer, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminCard from "../../componentes/AdminCard";
import { fetchApi, requestApi } from "../../api";

const initialState = {
  showForm: false,
  searchTerm: "",
  clienteId: "",
  nroFactura: "",
  importe: "",
  fechaEmision: "",
  fechaVencimiento: "",
  tipoFactura: "B",
  operacion: "Venta",
  estado: "Pendiente",
  selectedFactura: null,
  statusUpdate: "Pendiente",
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "OPEN_FORM":
      return { ...state, showForm: true, error: null };
    case "CLOSE_FORM":
      return { ...state, showForm: false, error: null };
    case "RESET_FORM":
      return {
        ...state,
        clienteId: "",
        nroFactura: "",
        importe: "",
        fechaEmision: "",
        fechaVencimiento: "",
        tipoFactura: "B",
        operacion: "Venta",
        estado: "Pendiente",
        error: null,
      };
    case "SET_SELECTED_FACTURA":
      return {
        ...state,
        selectedFactura: action.payload,
        statusUpdate: action.payload?.estado || "Pendiente",
        error: null,
      };
    case "CLEAR_SELECTED_FACTURA":
      return { ...state, selectedFactura: null, statusUpdate: "Pendiente", error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function Facturas() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queryClient = useQueryClient();

  const {
    data: facturas = [],
    isLoading: facturasLoading,
    isError: facturasError,
    error: facturasQueryError,
  } = useQuery({
    queryKey: ["facturas"],
    queryFn: () => fetchApi("/Factura"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const {
    data: clientes = [],
    isLoading: clientesLoading,
    isError: clientesError,
    error: clientesQueryError,
  } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => fetchApi("/Cliente"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const saveFacturaMutation = useMutation({
    mutationFn: async (payload) =>
      requestApi("/Factura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["facturas"]);
      dispatch({ type: "CLOSE_FORM" });
      dispatch({ type: "RESET_FORM" });
      window.alert("Factura creada exitosamente.");
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al crear la factura." });
    },
  });

  const updateFacturaMutation = useMutation({
    mutationFn: async ({ id, payload }) =>
      requestApi(`/Factura/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries(["facturas"]);
      dispatch({ type: "SET_SELECTED_FACTURA", payload: data });
      window.alert("Estado de factura actualizado.");
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al actualizar el estado." });
    },
  });

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: "CLEAR_ERROR" });

      const {
        clienteId,
        nroFactura,
        importe,
        fechaEmision,
        fechaVencimiento,
        tipoFactura,
        operacion,
        estado,
      } = state;

      if (!clienteId || !nroFactura || !importe || !fechaEmision || !fechaVencimiento || !tipoFactura || !operacion || !estado) {
        dispatch({ type: "SET_ERROR", payload: "Completa todos los campos de la factura." });
        return;
      }

      await saveFacturaMutation.mutateAsync({
        clienteId: Number(clienteId),
        nroFactura: nroFactura.toString(),
        importe: Number(importe),
        fechaEmision,
        fechaVencimiento,
        tipoFactura,
        operacion,
        estado,
      });
    },
    [saveFacturaMutation, state]
  );

  const handleOpenFactura = useCallback((factura) => {
    dispatch({ type: "SET_SELECTED_FACTURA", payload: factura });
  }, []);

  const handleCloseFactura = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTED_FACTURA" });
  }, []);

  const handleUpdateStatus = useCallback(async () => {
    if (!state.selectedFactura) return;
    await updateFacturaMutation.mutateAsync({
      id: state.selectedFactura.id,
      payload: { ...state.selectedFactura, estado: state.statusUpdate },
    });
  }, [state.selectedFactura, state.statusUpdate, updateFacturaMutation]);

  const filteredFacturas = useMemo(() => {
    const term = state.searchTerm.trim().toLowerCase();
    return facturas.filter((factura) => {
      const clienteTexto = String(factura.clienteNombre || factura.cliente || factura.clienteId || "").toLowerCase();
      const facturaTexto = String(factura.nroFactura || factura.id || "").toLowerCase();
      return clienteTexto.includes(term) || facturaTexto.includes(term);
    });
  }, [facturas, state.searchTerm]);

  const recaudacionMes = useMemo(
    () => facturas.filter((f) => f.estado === "Pagada").reduce((sum, f) => sum + Number(f.importe || 0), 0),
    [facturas]
  );

  const pendienteCobro = useMemo(
    () => facturas.filter((f) => f.estado === "Pendiente").reduce((sum, f) => sum + Number(f.importe || 0), 0),
    [facturas]
  );

  const facturasVencidas = useMemo(
    () => facturas.filter((f) => f.estado === "Vencida").length,
    [facturas]
  );

  const displayedError = state.error || ((facturasError || clientesError) ? (facturasQueryError?.message || clientesQueryError?.message) : null);
  const isLoading = facturasLoading || clientesLoading;

  const formatPrice = useCallback((value) => {
    if (value == null || value === "") return "-";
    return `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
  }, []);

  const formatDate = useCallback((value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-AR");
  }, []);

  const modalOverlayClick = useCallback(() => {
    dispatch({ type: "CLOSE_FORM" });
    dispatch({ type: "CLEAR_SELECTED_FACTURA" });
  }, []);

  if (isLoading) return <div className="admin-section">Cargando facturas...</div>;
  if ((facturasError || clientesError) && !facturas.length) return <div className="admin-section">Error: {displayedError}</div>;

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
            value={state.searchTerm}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "searchTerm", value: e.target.value })}
          />
        </div>
        <button className="btn btn-success" onClick={() => dispatch({ type: "OPEN_FORM" })}>
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
          <div style={{ width: "100%", textAlign: "center", padding: "40px", background: "white", borderRadius: "16px" }}>
            No se encontraron facturas.
          </div>
        )}
      </div>

      {(state.showForm || state.selectedFactura) && <div className="modal-overlay" onClick={modalOverlayClick}></div>}

      {state.selectedFactura && (
        <div className="modal-form">
          <h2>Factura {state.selectedFactura.nroFactura || state.selectedFactura.id}</h2>
          {displayedError && <p style={{ color: "#b91c1c" }}>{displayedError}</p>}
          <div className="admin-item-fields" style={{ marginBottom: "16px" }}>
            <div className="admin-item-row">
              <span className="admin-item-label">Cliente</span>
              <span className="admin-item-value">{state.selectedFactura.clienteNombre || `ID ${state.selectedFactura.clienteId}`}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Tipo</span>
              <span className="admin-item-value">{state.selectedFactura.tipoFactura}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Operación</span>
              <span className="admin-item-value">{state.selectedFactura.operacion}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Importe</span>
              <span className="admin-item-value">{formatPrice(state.selectedFactura.importe)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Emisión</span>
              <span className="admin-item-value">{formatDate(state.selectedFactura.fechaEmision)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Vencimiento</span>
              <span className="admin-item-value">{formatDate(state.selectedFactura.fechaVencimiento)}</span>
            </div>
          </div>
          <label style={{ marginBottom: "8px", display: "block", fontWeight: 600 }}>Estado</label>
          <select
            value={state.statusUpdate}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "statusUpdate", value: e.target.value })}
            style={{ marginBottom: "18px" }}
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

      {state.showForm && (
        <div className="modal-form">
          <h2>Nueva Factura</h2>
          {displayedError && <p style={{ color: "#b91c1c" }}>{displayedError}</p>}
          <form onSubmit={handleSubmit}>
            <select
              value={state.clienteId}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "clienteId", value: e.target.value })}
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
              value={state.nroFactura}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "nroFactura", value: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Importe ($)"
              value={state.importe}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "importe", value: e.target.value })}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Fecha de Emisión</label>
                <input
                  type="date"
                  value={state.fechaEmision}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaEmision", value: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={state.fechaVencimiento}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaVencimiento", value: e.target.value })}
                  required
                />
              </div>
            </div>
            <select
              value={state.tipoFactura}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipoFactura", value: e.target.value })}
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <select
              value={state.operacion}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "operacion", value: e.target.value })}
              required
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
            <select
              value={state.estado}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "estado", value: e.target.value })}
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
                onClick={() => {
                  dispatch({ type: "CLOSE_FORM" });
                  resetForm();
                }}
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
