import "./admin.css";
import { useMemo, useReducer, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminCard from "../../componentes/AdminCard";
import { fetchApi, requestApi } from "../../api";

const initialState = {
  showForm: false,
  searchTerm: "",
  editingId: null,
  propiedadId: "",
  precioBase: "",
  montoFinal: "",
  fechaInicio: "",
  fechaFin: "",
  tipoContrato: "Venta",
  estado: "Activo",
  selectedContrato: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "OPEN_FORM":
      return { ...state, showForm: true, error: null };
    case "CLOSE_FORM":
      return { ...state, showForm: false, editingId: null, error: null };
    case "RESET_FORM":
      return {
        ...state,
        editingId: null,
        propiedadId: "",
        precioBase: "",
        montoFinal: "",
        fechaInicio: "",
        fechaFin: "",
        tipoContrato: "Venta",
        estado: "Activo",
        error: null,
      };
    case "SET_EDITING":
      return {
        ...state,
        showForm: true,
        editingId: action.payload.id,
        propiedadId: action.payload.propiedadId?.toString() || "",
        precioBase: action.payload.precioBase?.toString() || "",
        montoFinal: action.payload.montoFinal?.toString() || "",
        fechaInicio: action.payload.fechaInicio || "",
        fechaFin: action.payload.fechaFin || "",
        tipoContrato: action.payload.tipoContrato || "Venta",
        estado: action.payload.estado || "Activo",
        error: null,
      };
    case "SET_PROPERTY":
      return {
        ...state,
        propiedadId: action.payload.id ?? "",
        precioBase: action.payload.precio ? action.payload.precio.toString() : state.precioBase,
        montoFinal: action.payload.precio ? action.payload.precio.toString() : state.montoFinal,
        error: null,
      };
    case "SET_SELECTED_CONTRATO":
      return { ...state, selectedContrato: action.payload, error: null };
    case "CLEAR_SELECTED_CONTRATO":
      return { ...state, selectedContrato: null, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function Contratos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queryClient = useQueryClient();

  const {
    data: contratos = [],
    isLoading: contratosLoading,
    isError: contratosError,
    error: contratosQueryError,
  } = useQuery({
    queryKey: ["contratos"],
    queryFn: () => fetchApi("/Contrato"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const {
    data: propiedades = [],
    isLoading: propiedadesLoading,
    isError: propiedadesError,
    error: propiedadesQueryError,
  } = useQuery({
    queryKey: ["propiedades"],
    queryFn: () => fetchApi("/Propiedades"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const saveContratoMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const path = id ? `/Contrato/${id}` : "/Contrato";
      return requestApi(path, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id, ...payload } : payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(["contratos"]);
      dispatch({ type: "CLOSE_FORM" });
      dispatch({ type: "RESET_FORM" });
      window.alert("Contrato guardado exitosamente.");
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al guardar el contrato." });
    },
  });

  const deleteContratoMutation = useMutation({
    mutationFn: async (id) => requestApi(`/Contrato/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["contratos"]);
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al eliminar el contrato." });
    },
  });

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const handlePropiedadChange = useCallback(
    (propiedadId) => {
      const propiedadSeleccionada = propiedades.find((prop) => prop.id === Number(propiedadId));
      if (propiedadSeleccionada) {
        dispatch({ type: "SET_PROPERTY", payload: propiedadSeleccionada });
      } else {
        dispatch({ type: "SET_FIELD", field: "propiedadId", value: propiedadId });
      }
    },
    [propiedades]
  );

  const handleEdit = useCallback((contrato) => {
    if (!contrato?.id) {
      dispatch({ type: "SET_ERROR", payload: "No se puede editar un contrato sin ID." });
      return;
    }
    dispatch({ type: "SET_EDITING", payload: contrato });
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("¿Eliminar este contrato?")) return;
      if (!id) {
        dispatch({ type: "SET_ERROR", payload: "No se pudo eliminar: ID del contrato no está definido." });
        return;
      }
      dispatch({ type: "CLEAR_ERROR" });
      await deleteContratoMutation.mutateAsync(id);
    },
    [deleteContratoMutation]
  );

  const handleOpenContrato = useCallback((contrato) => {
    dispatch({ type: "SET_SELECTED_CONTRATO", payload: contrato });
  }, []);

  const handleCloseContrato = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTED_CONTRATO" });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: "CLEAR_ERROR" });

      const {
        propiedadId,
        precioBase,
        montoFinal,
        fechaInicio,
        fechaFin,
        tipoContrato,
        estado,
        editingId,
      } = state;

      if (!propiedadId || !precioBase || !montoFinal || !fechaInicio || !fechaFin || !tipoContrato) {
        dispatch({ type: "SET_ERROR", payload: "Completa todos los campos del contrato." });
        return;
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
        dispatch({ type: "SET_ERROR", payload: "Fecha inválida." });
        return;
      }
      if (inicio > fin) {
        dispatch({ type: "SET_ERROR", payload: "La fecha de inicio no puede ser posterior a la fecha de finalización." });
        return;
      }

      await saveContratoMutation.mutateAsync({
        id: editingId,
        payload: {
          propiedadId: Number(propiedadId),
          precioBase: Number(precioBase),
          montoFinal: Number(montoFinal),
          fechaInicio,
          fechaFin,
          tipoContrato,
          estado,
        },
      });
    },
    [saveContratoMutation, state]
  );

  const filteredContratos = useMemo(() => {
    const term = state.searchTerm.trim().toLowerCase();
    return contratos.filter((contrato) => {
      const clienteTexto = String(contrato.cliente || contrato.tituloPropiedad || contrato.propiedadId || "").toLowerCase();
      return (
        clienteTexto.includes(term) ||
        String(contrato.id || "").toLowerCase().includes(term)
      );
    });
  }, [contratos, state.searchTerm]);

  const contratosActivos = useMemo(() => contratos.length, [contratos]);
  const valorTotal = useMemo(
    () => contratos.reduce((sum, contrato) => sum + Number(contrato.montoFinal || 0), 0),
    [contratos]
  );
  const proximosAVencer = useMemo(() => {
    const hoy = new Date();
    return contratos.filter((contrato) => {
      const fin = new Date(contrato.fechaFin);
      const dias = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 30;
    }).length;
  }, [contratos]);

  const displayedError = state.error || ((contratosError || propiedadesError) ? (contratosQueryError?.message || propiedadesQueryError?.message) : null);
  const isLoading = contratosLoading || propiedadesLoading;

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
    if (state.showForm) dispatch({ type: "CLOSE_FORM" });
    if (state.selectedContrato) dispatch({ type: "CLEAR_SELECTED_CONTRATO" });
  }, [state.showForm, state.selectedContrato]);

  if (isLoading) return <div className="admin-section">Cargando contratos...</div>;
  if ((contratosError || propiedadesError) && !contratos.length) return <div className="admin-section">Error: {displayedError}</div>;

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
            value={state.searchTerm}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "searchTerm", value: e.target.value })}
          />
        </div>
        <button className="btn btn-success" onClick={() => dispatch({ type: "OPEN_FORM" })}>
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
              status={contrato.estado || "Activo"}
              statusClass={
                contrato.estado === "Activo" ? "status-active" :
                contrato.estado === "Finalizado" ? "status-expired" :
                "status-canceled"
              }
              details={[
                { label: "Tipo", value: contrato.tipoContrato },
                { label: "Precio Base", value: contrato.precioBase ? formatPrice(contrato.precioBase) : "-" },
                { label: "Monto Final", value: contrato.montoFinal ? formatPrice(contrato.montoFinal) : "-" },
                { label: "Inicio", value: formatDate(contrato.fechaInicio) },
                { label: "Fin", value: formatDate(contrato.fechaFin) },
              ]}
              actions={(
                <>
                  <button className="btn-secondary" type="button" onClick={() => handleOpenContrato(contrato)}>
                    Ver
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => handleEdit(contrato)}>
                    Editar
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => handleDelete(contrato.id)}>
                    Eliminar
                  </button>
                </>
              )}
            />
          ))
        ) : (
          <div style={{ width: "100%", textAlign: "center", padding: "40px", background: "white", borderRadius: "16px" }}>
            No se encontraron contratos.
          </div>
        )}
      </div>

      {(state.showForm || state.selectedContrato) && <div className="modal-overlay" onClick={modalOverlayClick}></div>}

      {state.selectedContrato && (
        <div className="modal-form">
          <h2>Contrato #{state.selectedContrato.id}</h2>
          <div className="admin-item-fields" style={{ marginBottom: "16px" }}>
            <div className="admin-item-row">
              <span className="admin-item-label">Propiedad</span>
              <span className="admin-item-value">{state.selectedContrato.tituloPropiedad || `ID ${state.selectedContrato.propiedadId}`}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Tipo</span>
              <span className="admin-item-value">{state.selectedContrato.tipoContrato}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Estado</span>
              <span className="admin-item-value">{state.selectedContrato.estado || "Activo"}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Precio Base</span>
              <span className="admin-item-value">{state.selectedContrato.precioBase ? formatPrice(state.selectedContrato.precioBase) : "-"}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Monto Final</span>
              <span className="admin-item-value">{state.selectedContrato.montoFinal ? formatPrice(state.selectedContrato.montoFinal) : "-"}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Inicio</span>
              <span className="admin-item-value">{formatDate(state.selectedContrato.fechaInicio)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Fin</span>
              <span className="admin-item-value">{formatDate(state.selectedContrato.fechaFin)}</span>
            </div>
          </div>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseContrato}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {state.showForm && (
        <div className="modal-form">
          <h2>{state.editingId ? "Editar Contrato" : "Nuevo Contrato"}</h2>
          {displayedError && <p style={{ color: "#b91c1c" }}>{displayedError}</p>}
          <form onSubmit={handleSubmit}>
            <select
              value={state.propiedadId}
              onChange={(e) => handlePropiedadChange(e.target.value)}
              required
            >
              <option value="">Seleccionar propiedad...</option>
              {propiedades.map((propiedad) => (
                <option key={propiedad.id} value={propiedad.id}>
                  {propiedad.titulo || `${propiedad.tipo} - ${propiedad.direccion ?? propiedad.ciudad ?? propiedad.id}`}
                </option>
              ))}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input
                type="number"
                placeholder="Precio base"
                value={state.precioBase}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "precioBase", value: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Monto final"
                value={state.montoFinal}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "montoFinal", value: e.target.value })}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Fecha de Inicio</label>
              <input
                type="date"
                value={state.fechaInicio}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaInicio", value: e.target.value })}
                max={state.fechaFin}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "0.8rem", color: "#6b7280" }}>Fecha de Finalización</label>
              <input
                type="date"
                value={state.fechaFin}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaFin", value: e.target.value })}
                min={state.fechaInicio}
                required
              />
            </div>
            <select
              value={state.tipoContrato}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipoContrato", value: e.target.value })}
              required
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Temporal">Temporal</option>
            </select>
            <select
              value={state.estado}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "estado", value: e.target.value })}
              required
            >
              <option value="Activo">Activo</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">{state.editingId ? "Actualizar Contrato" : "Generar Contrato"}</button>
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
