from pathlib import Path

base = Path(__file__).parent

def write_file(path, content):
    dest = base / path
    dest.write_text(content, encoding='utf-8')
    print(f'Wrote {dest}')

write_file('src/pages/admin/propiedades.jsx', '''import "./admin.css";
import { useMemo, useReducer, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "../../componentes/Card";
import { fetchApi, requestApi } from "../../api";

const EXCHANGE_RATE_USD_ARS = 1100;

const initialState = {
  showForm: false,
  searchTerm: "",
  editingId: null,
  titulo: "",
  direccion: "",
  ciudad: "",
  operacion: "",
  metrosCuadrados: "",
  precio: "",
  tipo: "",
  imagen: "",
  descripcion: "",
  estado: "Disponible",
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
    case "SET_EDITING":
      return {
        ...state,
        showForm: true,
        editingId: action.payload.id,
        titulo: action.payload.titulo || "",
        direccion: action.payload.direccion || "",
        ciudad: action.payload.ciudad || "",
        operacion: action.payload.operacion || "",
        metrosCuadrados: action.payload.metrosCuadrados?.toString() || "",
        precio: action.payload.precio?.toString() || "",
        tipo: action.payload.tipo || "",
        imagen: action.payload.imagen || "",
        descripcion: action.payload.descripcion || "",
        estado: action.payload.estado || "Disponible",
        error: null,
      };
    case "RESET_FORM":
      return {
        ...state,
        editingId: null,
        titulo: "",
        direccion: "",
        ciudad: "",
        operacion: "",
        metrosCuadrados: "",
        precio: "",
        tipo: "",
        imagen: "",
        descripcion: "",
        estado: "Disponible",
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function Propiedades() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queryClient = useQueryClient();

  const { data: propiedades = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["propiedades"],
    queryFn: () => fetchApi("/Propiedades"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const savePropertyMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const path = id ? `/Propiedades/${id}` : "/Propiedades";
      const init = {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id, ...payload } : payload),
      };
      return requestApi(path, init);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["propiedades"], (old = []) => {
        if (variables.id) {
          return old.map((item) =>
            item.id === variables.id ? { ...item, ...variables.payload } : item
          );
        }
        return [data || variables.payload, ...old];
      });
      dispatch({ type: "CLOSE_FORM" });
      dispatch({ type: "RESET_FORM" });
      window.alert(`Propiedad ${variables.id ? "actualizada" : "creada"} exitosamente.`);
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al guardar la propiedad. Intenta nuevamente." });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id) => requestApi(`/Propiedades/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["propiedades"], (old = []) => old.filter((item) => item.id !== id));
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al eliminar la propiedad." });
    },
  });

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const handleEdit = useCallback((property) => {
    if (!property?.id) {
      dispatch({ type: "SET_ERROR", payload: "No se puede editar una propiedad sin ID." });
      return;
    }
    dispatch({ type: "SET_EDITING", payload: property });
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("¿Eliminar esta propiedad?")) return;
      if (!id) {
        dispatch({ type: "SET_ERROR", payload: "No se pudo eliminar: ID de la propiedad no está definido." });
        return;
      }
      dispatch({ type: "CLEAR_ERROR" });
      await deletePropertyMutation.mutateAsync(id);
    },
    [deletePropertyMutation]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: "CLEAR_ERROR" });
      const {
        titulo,
        direccion,
        ciudad,
        operacion,
        metrosCuadrados,
        precio,
        tipo,
        imagen,
        descripcion,
        estado,
        editingId,
      } = state;

      const errors = [];
      if (!titulo?.trim()) errors.push("Título es necesario");
      if (!direccion?.trim()) errors.push("Dirección es necesaria");
      if (!ciudad?.trim()) errors.push("Ciudad es necesaria");
      if (!operacion) errors.push("Operación es necesaria");
      if (!tipo) errors.push("Tipo es necesario");
      const mc = Number(metrosCuadrados);
      if (Number.isNaN(mc) || mc <= 0) errors.push("Metros cuadrados inválidos");
      const p = Number(precio);
      if (Number.isNaN(p) || p <= 0) errors.push("Precio debe ser mayor a 0");
      if (!descripcion?.trim()) errors.push("Descripción es necesaria");
      if (!imagen?.trim()) errors.push("URL de la imagen es necesaria");

      if (errors.length > 0) {
        dispatch({ type: "SET_ERROR", payload: errors.join(". ") });
        return;
      }

      const payload = {
        titulo,
        direccion,
        ciudad,
        operacion,
        metrosCuadrados: mc,
        precio: p,
        tipo,
        imagen,
        descripcion,
        estado,
      };

      await savePropertyMutation.mutateAsync({ id: editingId, payload });
    },
    [savePropertyMutation, state]
  );

  const filteredPropiedades = useMemo(() => {
    const term = state.searchTerm.toLowerCase();
    return propiedades.filter((p) =>
      p.ubicacion?.toLowerCase().includes(term) ||
      p.tipo?.toLowerCase().includes(term) ||
      p.ciudad?.toLowerCase().includes(term) ||
      p.direccion?.toLowerCase().includes(term)
    );
  }, [propiedades, state.searchTerm]);

  const displayedError = state.error || (isError ? queryError?.message : null);

  if (isLoading) return <div className="admin-section">Cargando propiedades...</div>;
  if (isError && !propiedades.length) return <div className="admin-section">Error: {displayedError}</div>;

  return (
    <div className="admin-section">
      <div className="admin-actions-bar">
        <div>
          <h2>Gestión de Propiedades</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Administra el catálogo visible en la web.</p>
        </div>
        <div className="search-container" style={{ maxWidth: '300px' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por ubicación o tipo..."
            value={state.searchTerm}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "searchTerm", value: e.target.value })}
          />
        </div>
        <button className="btn btn-success" onClick={() => dispatch({ type: "OPEN_FORM" })}>
          + Nueva Propiedad
        </button>
      </div>

      <div className="admin-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '20px' }}>
        {filteredPropiedades.length > 0 ? (
          filteredPropiedades.map((p) => (
            <div key={p.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <Card
                tipo={p.tipo}
                estado={p.estado}
                imagen={p.imagenes?.[0]?.url || p.imagen}
                titulo={p.titulo}
                direccion={p.direccion}
                ciudad={p.ciudad}
                metrosCuadrados={p.metrosCuadrados}
                operacion={p.operacion}
                precioUSD={p.precio || 0}
                exchangeRate={EXCHANGE_RATE_USD_ARS}
                descripcion={p.descripcion}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  className="action-btn"
                  style={{ background: '#2563eb', color: 'white', borderRadius: '8px', padding: '8px 12px', flex: 1, fontSize: '14px' }}
                  onClick={() => handleEdit(p)}
                  type="button"
                  title="Editar"
                >
                  Editar
                </button>
                <button
                  className="action-btn"
                  style={{ background: '#dc2626', color: 'white', borderRadius: '8px', padding: '8px 12px', flex: 1, fontSize: '14px' }}
                  onClick={() => handleDelete(p.id)}
                  type="button"
                  title="Eliminar"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
            No se encontraron propiedades.
          </div>
        )}
      </div>

      {state.showForm && <div className="modal-overlay" onClick={() => dispatch({ type: "CLOSE_FORM" })}></div>}

      {state.showForm && (
        <div className="modal-form">
          <h2>{state.editingId ? "Editar Propiedad" : "Nueva Propiedad"}</h2>
          {displayedError && <div style={{ color: '#b91c1c', marginBottom: '12px' }}>{displayedError}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={state.titulo}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "titulo", value: e.target.value })}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Dirección"
                value={state.direccion}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "direccion", value: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={state.ciudad}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "ciudad", value: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <select
                value={state.operacion}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "operacion", value: e.target.value })}
                required
              >
                <option value="">Operación</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
              <select
                value={state.tipo}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipo", value: e.target.value })}
                required
              >
                <option value="">Tipo</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Terreno">Terreno</option>
                <option value="Local">Local</option>
              </select>
            </div>
            <select
              value={state.estado}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "estado", value: e.target.value })}
              required
            >
              <option value="Disponible">Disponible</option>
              <option value="Alquilada">Alquilada</option>
              <option value="Vendida">Vendida</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <input
                type="number"
                placeholder="Metros cuadrados"
                value={state.metrosCuadrados}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "metrosCuadrados", value: e.target.value })}
                required
                min="0"
              />
              <input
                type="text"
                placeholder="Precio (en USD)"
                value={state.precio}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "precio", value: e.target.value })}
                required
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '8px 0 0 0' }}>
              💵 El precio debe ser ingresado en dólares <strong>SIN PUNTOS</strong> (ej: 50000 o 50000.50). Se convertirá automáticamente a pesos (Dólar Blue: 1 USD = ${EXCHANGE_RATE_USD_ARS} ARS)
            </p>
            <input
              type="text"
              placeholder="URL de la imagen"
              value={state.imagen}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "imagen", value: e.target.value })}
            />
            <textarea
              placeholder="Descripción detallada de la propiedad"
              value={state.descripcion}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "descripcion", value: e.target.value })}
            />
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">
                {state.editingId ? "Actualizar Propiedad" : "Guardar Propiedad"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  dispatch({ type: "CLOSE_FORM" });
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
''')

write_file('src/pages/admin/facturas.jsx', '''import "./admin.css";
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
  statusUpdate: "",
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
    case "SET_SELECTED_FACTURA":
      return {
        ...state,
        selectedFactura: action.payload,
        statusUpdate: action.payload?.estado || "Pendiente",
        error: null,
      };
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
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

function formatPrice(value) {
  if (value == null || value === "") return "-";
  return `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-AR");
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

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => fetchApi("/Cliente"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const createFacturaMutation = useMutation({
    mutationFn: async (payload) =>
      requestApi("/Factura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data, payload) => {
      queryClient.setQueryData(["facturas"], (old = []) => [data || payload, ...old]);
      dispatch({ type: "CLOSE_FORM" });
      dispatch({ type: "RESET_FORM" });
      window.alert("Factura creada exitosamente.");
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al guardar la factura. Intenta nuevamente." });
    },
  });

  const updateFacturaMutation = useMutation({
    mutationFn: async ({ id, payload }) =>
      requestApi(`/Factura/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["facturas"], (old = []) =>
        old.map((factura) => (factura.id === data.id ? data : factura))
      );
      dispatch({ type: "SET_SELECTED_FACTURA", payload: data });
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al actualizar la factura." });
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

      const { clienteId, nroFactura, importe, fechaEmision, fechaVencimiento, tipoFactura, operacion, estado } = state;
      if (!clienteId || !nroFactura || !importe || !fechaEmision || !fechaVencimiento || !tipoFactura || !operacion || !estado) {
        dispatch({ type: "SET_ERROR", payload: "Completa todos los campos de la factura." });
        return;
      }

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

      await createFacturaMutation.mutateAsync(payload);
    },
    [createFacturaMutation, state]
  );

  const handleOpenFactura = useCallback((factura) => {
    dispatch({ type: "SET_SELECTED_FACTURA", payload: factura });
  }, []);

  const handleCloseFactura = useCallback(() => {
    dispatch({ type: "SET_SELECTED_FACTURA", payload: null });
    dispatch({ type: "SET_FIELD", field: "statusUpdate", value: "" });
  }, []);

  const handleUpdateStatus = useCallback(async () => {
    if (!state.selectedFactura) return;
    const payload = { ...state.selectedFactura, estado: state.statusUpdate };
    await updateFacturaMutation.mutateAsync({ id: state.selectedFactura.id, payload });
  }, [state.selectedFactura, state.statusUpdate, updateFacturaMutation]);

  const filteredFacturas = useMemo(() => {
    const term = state.searchTerm.toLowerCase();
    return facturas.filter((factura) => {
      const clienteTexto = String(factura.clienteNombre || factura.cliente || factura.clienteId || "").toLowerCase();
      const facturaTexto = String(factura.nroFactura || factura.id || "").toLowerCase();
      return clienteTexto.includes(term) || facturaTexto.includes(term);
    });
  }, [facturas, state.searchTerm]);

  const displayedError = state.error || (facturasError ? facturasQueryError?.message : null);

  const stats = useMemo(() => {
    const recaudacionMes = facturas.filter((f) => f.estado === "Pagada").reduce((sum, f) => sum + Number(f.importe || 0), 0);
    const pendienteCobro = facturas.filter((f) => f.estado === "Pendiente").reduce((sum, f) => sum + Number(f.importe || 0), 0);
    const facturasVencidas = facturas.filter((f) => f.estado === "Vencida").length;
    return { recaudacionMes, pendienteCobro, facturasVencidas };
  }, [facturas]);

  if (facturasLoading) return <div className="admin-section">Cargando facturas...</div>;
  if (facturasError && !facturas.length) return <div className="admin-section">Error: {displayedError}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Recaudación Mes</span>
          <strong>{formatPrice(stats.recaudacionMes)}</strong>
        </div>
        <div className="stat-card">
          <span>Pendiente de Cobro</span>
          <strong>{formatPrice(stats.pendienteCobro)}</strong>
        </div>
        <div className="stat-card">
          <span>Facturas Vencidas</span>
          <strong>{stats.facturasVencidas}</strong>
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
            const clienteNombre = factura.clienteNombre || `Cliente ${factura.clienteId || "-"}`;
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
                  </>
                )}
              />
            );
          })
        ) : (
          <div style={{ width: '100%', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
            No se encontraron facturas.
          </div>
        )}
      </div>

      {(state.showForm || state.selectedFactura) && <div className="modal-overlay" onClick={() => {
        if (state.showForm) dispatch({ type: "CLOSE_FORM" });
        if (state.selectedFactura) handleCloseFactura();
      }}></div>}

      {state.selectedFactura && (
        <div className="modal-form">
          <h2>Factura {state.selectedFactura.nroFactura || state.selectedFactura.id}</h2>
          {displayedError && <p style={{ color: '#b91c1c' }}>{displayedError}</p>}
          <div className="admin-item-fields" style={{ marginBottom: '16px' }}>
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
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Cambiar estado:
            <select
              value={state.statusUpdate}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "statusUpdate", value: e.target.value })}
              style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px' }}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
            </select>
          </label>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-success" onClick={handleUpdateStatus}>Actualizar estado</button>
            <button type="button" className="btn btn-secondary" onClick={handleCloseFactura}>Cerrar</button>
          </div>
        </div>
      )}

      {state.showForm && (
        <div className="modal-form">
          <h2>Crear Factura</h2>
          {displayedError && <p style={{ color: '#b91c1c' }}>{displayedError}</p>}
          <form onSubmit={handleSubmit}>
            <select
              value={state.clienteId}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "clienteId", value: e.target.value })}
              required
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nro Factura"
              value={state.nroFactura}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "nroFactura", value: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Importe"
              value={state.importe}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "importe", value: e.target.value })}
              required
            />
            <input
              type="date"
              value={state.fechaEmision}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaEmision", value: e.target.value })}
              required
            />
            <input
              type="date"
              value={state.fechaVencimiento}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaVencimiento", value: e.target.value })}
              required
            />
            <select
              value={state.tipoFactura}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipoFactura", value: e.target.value })}
              required
            >
              <option value="B">Tipo B</option>
              <option value="A">Tipo A</option>
              <option value="C">Tipo C</option>
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
            </select>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Guardar Factura</button>
              <button type="button" className="btn btn-secondary" onClick={() => { dispatch({ type: "CLOSE_FORM" }); resetForm(); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
''')

write_file('src/pages/admin/contratos.jsx', '''import "./admin.css";
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
    case "SET_SELECTED_CONTRATO":
      return { ...state, selectedContrato: action.payload, error: null };
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
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

function formatPrice(value) {
  if (value == null || value === "") return "-";
  return `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-AR");
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

  const { data: propiedades = [] } = useQuery({
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["contratos"], (old = []) => {
        if (variables.id) {
          return old.map((item) =>
            item.id === variables.id ? { ...item, ...variables.payload } : item
          );
        }
        return [data || variables.payload, ...old];
      });
      dispatch({ type: "CLOSE_FORM" });
      dispatch({ type: "RESET_FORM" });
      window.alert(`Contrato ${variables.id ? "actualizado" : "creado"} exitosamente.`);
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al guardar el contrato. Intenta nuevamente." });
    },
  });

  const deleteContratoMutation = useMutation({
    mutationFn: async (id) => requestApi(`/Contrato/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["contratos"], (old = []) => old.filter((item) => item.id !== id));
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
      dispatch({ type: "SET_FIELD", field: "propiedadId", value: propiedadId });
      const propiedadSeleccionada = propiedades.find((p) => p.id === Number(propiedadId));
      if (propiedadSeleccionada?.precio) {
        dispatch({ type: "SET_FIELD", field: "precioBase", value: propiedadSeleccionada.precio.toString() });
        if (!state.montoFinal) {
          dispatch({ type: "SET_FIELD", field: "montoFinal", value: propiedadSeleccionada.precio.toString() });
        }
      }
    },
    [propiedades, state.montoFinal]
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
    dispatch({ type: "SET_SELECTED_CONTRATO", payload: null });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: "CLEAR_ERROR" });

      const { propiedadId, precioBase, montoFinal, fechaInicio, fechaFin, tipoContrato, estado, editingId } = state;
      if (!propiedadId || !precioBase || !montoFinal || !fechaInicio || !fechaFin || !tipoContrato) {
        dispatch({ type: "SET_ERROR", payload: "Completa todos los campos del contrato." });
        return;
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (inicio > fin) {
        dispatch({ type: "SET_ERROR", payload: "La fecha de inicio no puede ser posterior a la fecha de finalización." });
        return;
      }

      const payload = {
        propiedadId: Number(propiedadId),
        precioBase: Number(precioBase),
        montoFinal: Number(montoFinal),
        fechaInicio,
        fechaFin,
        tipoContrato,
        estado,
      };

      await saveContratoMutation.mutateAsync({ id: editingId, payload });
    },
    [saveContratoMutation, state]
  );

  const filteredContratos = useMemo(() => {
    const term = state.searchTerm.toLowerCase();
    return contratos.filter((contrato) => {
      const propiedadTexto = String(contrato.tituloPropiedad || contrato.propiedadId || "").toLowerCase();
      return (
        propiedadTexto.includes(term) ||
        String(contrato.id || "").toLowerCase().includes(term)
      );
    });
  }, [contratos, state.searchTerm]);

  const stats = useMemo(() => {
    const contratosActivos = contratos.length;
    const valorTotal = contratos.reduce((sum, contrato) => sum + Number(contrato.montoFinal || 0), 0);
    const hoy = new Date();
    const proximosAVencer = contratos.filter((contrato) => {
      const fin = new Date(contrato.fechaFin);
      const dias = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 30;
    }).length;
    return { contratosActivos, valorTotal, proximosAVencer };
  }, [contratos]);

  const displayedError = state.error || (contratosError ? contratosQueryError?.message : null);

  if (contratosLoading) return <div className="admin-section">Cargando contratos...</div>;
  if (contratosError && !contratos.length) return <div className="admin-section">Error: {displayedError}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Contratos Activos</span>
          <strong>{stats.contratosActivos}</strong>
        </div>
        <div className="stat-card">
          <span>Valor Total</span>
          <strong>{formatPrice(stats.valorTotal)}</strong>
        </div>
        <div className="stat-card">
          <span>Por Vencer (30 días)</span>
          <strong>{stats.proximosAVencer}</strong>
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
          <div style={{ width: '100%', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
            No se encontraron contratos.
          </div>
        )}
      </div>

      {(state.showForm || state.selectedContrato) && <div className="modal-overlay" onClick={() => {
        if (state.showForm) dispatch({ type: "CLOSE_FORM" });
        if (state.selectedContrato) handleCloseContrato();
      }}></div>}

      {state.selectedContrato && (
        <div className="modal-form">
          <h2>Contrato #{state.selectedContrato.id}</h2>
          {displayedError && <p style={{ color: '#b91c1c' }}>{displayedError}</p>}
          <div className="admin-item-fields" style={{ marginBottom: '16px' }}>
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
              <span className="admin-item-value">{formatPrice(state.selectedContrato.precioBase)}</span>
            </div>
            <div className="admin-item-row">
              <span className="admin-item-label">Monto Final</span>
              <span className="admin-item-value">{formatPrice(state.selectedContrato.montoFinal)}</span>
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
          {displayedError && <p style={{ color: '#b91c1c' }}>{displayedError}</p>}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Fecha de Inicio</label>
              <input
                type="date"
                value={state.fechaInicio}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "fechaInicio", value: e.target.value })}
                max={state.fechaFin}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Fecha de Finalización</label>
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
              <button type="submit" className="btn btn-success">
                {state.editingId ? "Actualizar Contrato" : "Generar Contrato"}
              </button>
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
''')
