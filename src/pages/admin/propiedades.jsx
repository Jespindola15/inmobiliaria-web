import "./admin.css";
import { useMemo, useReducer, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "../../componentes/Card";
import { fetchApi, requestApi } from "../../api";

const EXCHANGE_RATE_USD_ARS = 1100; // 1 USD = 1100 ARS (Dólar Blue aprox.)

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
        imagen: action.payload.imagen || action.payload.imagenes?.[0]?.url || action.payload.imagenes?.[0] || "",
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

  const {
    data: propiedades = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["propiedades"],
    queryFn: () => fetchApi("/Propiedades"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const savePropertyMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const path = id ? `/Propiedades/${id}` : "/Propiedades";
      return requestApi(path, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id, ...payload } : payload),
      });
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries(["propiedades"]);
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
    onSuccess: async () => {
      await queryClient.invalidateQueries(["propiedades"]);
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
      if (!titulo || !titulo.toString().trim()) errors.push("Título es necesario");
      if (!direccion || !direccion.toString().trim()) errors.push("Dirección es necesaria");
      if (!ciudad || !ciudad.toString().trim()) errors.push("Ciudad es necesaria");
      if (!operacion) errors.push("Operación es necesaria");
      if (!tipo) errors.push("Tipo es necesario");

      const metros = Number(metrosCuadrados);
      if (Number.isNaN(metros) || metros <= 0) errors.push("Metros cuadrados inválidos");

      const precioNum = Number(precio);
      if (Number.isNaN(precioNum) || precioNum <= 0) errors.push("Precio debe ser mayor a 0");
      if (!descripcion || !descripcion.toString().trim()) errors.push("Descripción es necesaria");
      if (!imagen || !imagen.toString().trim()) errors.push("URL de la imagen es necesaria");

      if (errors.length > 0) {
        dispatch({ type: "SET_ERROR", payload: errors.join(". ") });
        return;
      }

      const imageUrl = imagen.toString().trim();

      await savePropertyMutation.mutateAsync({
        id: editingId,
        payload: {
          titulo: titulo.toString().trim(),
          direccion: direccion.toString().trim(),
          ciudad: ciudad.toString().trim(),
          operacion,
          metrosCuadrados: metros,
          precio: precioNum,
          tipo,
          imagenes: [imageUrl],
          descripcion: descripcion.toString().trim(),
          estado,
        },
      });
    },
    [savePropertyMutation, state]
  );

  const filteredPropiedades = useMemo(() => {
    const term = state.searchTerm.trim().toLowerCase();
    return propiedades.filter((p) =>
      [p.ubicacion, p.tipo, p.ciudad, p.direccion].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
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
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Administra el catálogo visible en la web.</p>
        </div>
        <div className="search-container" style={{ maxWidth: "300px" }}>
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

      <div className="admin-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px", marginTop: "20px" }}>
        {filteredPropiedades.length > 0 ? (
          filteredPropiedades.map((p) => (
            <div key={p.id} style={{ position: "relative", display: "flex", flexDirection: "column" }}>
              <Card
                tipo={p.tipo}
                estado={p.estado}
                imagen={p.imagen || p.imagenes?.[0]?.url || p.imagenes?.[0]}
                titulo={p.titulo}
                direccion={p.direccion}
                ciudad={p.ciudad}
                metrosCuadrados={p.metrosCuadrados}
                operacion={p.operacion}
                precioUSD={p.precio ? p.precio : 0}
                exchangeRate={EXCHANGE_RATE_USD_ARS}
                descripcion={p.descripcion}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  className="action-btn"
                  style={{ background: "#2563eb", color: "white", borderRadius: "8px", padding: "8px 12px", flex: 1, fontSize: "14px" }}
                  onClick={() => handleEdit(p)}
                  type="button"
                  title="Editar"
                >
                  Editar
                </button>
                <button
                  className="action-btn"
                  style={{ background: "#dc2626", color: "white", borderRadius: "8px", padding: "8px 12px", flex: 1, fontSize: "14px" }}
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
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" }}>
            No se encontraron propiedades.
          </div>
        )}
      </div>

      {state.showForm && <div className="modal-overlay" onClick={() => dispatch({ type: "CLOSE_FORM" })}></div>}

      {state.showForm && (
        <div className="modal-form">
          <h2>{state.editingId ? "Editar Propiedad" : "Nueva Propiedad"}</h2>
          {displayedError && <div style={{ color: "#b91c1c", marginBottom: "12px" }}>{displayedError}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={state.titulo}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "titulo", value: e.target.value })}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
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
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "8px 0 0 0" }}>
              💵 El precio debe ser ingresado en dólares SIN PUNTOS (ej: 50000 o 50000.50). Se convertirá automáticamente a pesos (Dólar Blue: 1 USD = ${EXCHANGE_RATE_USD_ARS} ARS)
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
