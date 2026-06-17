import "./admin.css";
import { useMemo, useReducer, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminCard from "../../componentes/AdminCard";
import { fetchApi, requestApi } from "../../api";

const initialState = {
  showForm: false,
  editingId: null,
  searchTerm: "",
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
  tipoCliente: "Propietario",
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
        nombre: action.payload.nombre || "",
        apellido: action.payload.apellido || "",
        dni: action.payload.dni?.toString() || "",
        telefono: action.payload.telefono || "",
        email: action.payload.email || "",
        tipoCliente: action.payload.tipoCliente || "Propietario",
        error: null,
      };
    case "RESET_FORM":
      return {
        ...state,
        editingId: null,
        nombre: "",
        apellido: "",
        dni: "",
        telefono: "",
        email: "",
        tipoCliente: "Propietario",
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

export default function Clientes() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queryClient = useQueryClient();

  const {
    data: clientes = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => fetchApi("/Cliente"),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const saveClienteMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const init = {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id, ...payload } : payload),
      };
      const path = id ? `/Cliente/${id}` : "/Cliente";
      return requestApi(path, init);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["clientes"], (old = []) => {
        if (variables.id) {
          return old.map((cliente) =>
            cliente.id === variables.id ? { ...cliente, ...variables.payload } : cliente
          );
        }
        return [data || variables.payload, ...old];
      });
      dispatch({ type: "CLOSE_FORM" });
      dispatch({ type: "RESET_FORM" });
      if (!variables.id) {
        window.alert("Cliente creado exitosamente.");
      } else {
        window.alert("Cliente actualizado exitosamente.");
      }
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al guardar el cliente. Intenta nuevamente." });
    },
  });

  const deleteClienteMutation = useMutation({
    mutationFn: async (id) => requestApi(`/Cliente/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["clientes"], (old = []) =>
        old.filter((cliente) => cliente.id !== id)
      );
    },
    onError: (err) => {
      dispatch({ type: "SET_ERROR", payload: err.message || "Error al eliminar el cliente." });
    },
  });

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const handleEdit = useCallback((cliente) => {
    if (!cliente?.id) {
      dispatch({ type: "SET_ERROR", payload: "No se puede editar un cliente sin ID." });
      return;
    }
    dispatch({ type: "SET_EDITING", payload: cliente });
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("¿Eliminar este cliente?")) return;
      if (!id) {
        dispatch({ type: "SET_ERROR", payload: "No se pudo eliminar: ID del cliente no está definido." });
        return;
      }
      dispatch({ type: "CLEAR_ERROR" });
      await deleteClienteMutation.mutateAsync(id);
    },
    [deleteClienteMutation]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: "CLEAR_ERROR" });

      const { nombre, apellido, dni, telefono, email, tipoCliente, editingId } = state;
      if (!nombre || !apellido || !dni || !telefono || !email || !tipoCliente) {
        dispatch({ type: "SET_ERROR", payload: "Todos los campos son obligatorios." });
        return;
      }

      const payload = {
        nombre,
        apellido,
        dni: Number(dni),
        email,
        telefono,
        tipoCliente,
      };

      await saveClienteMutation.mutateAsync({ id: editingId, payload });
    },
    [saveClienteMutation, state]
  );

  const filteredClientes = useMemo(() => {
    const term = state.searchTerm.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nombre?.toLowerCase().includes(term) ||
        cliente.email?.toLowerCase().includes(term)
    );
  }, [clientes, state.searchTerm]);

  const displayedError = state.error || (isError ? queryError?.message : null);

  if (isLoading) return <div className="admin-section">Cargando clientes...</div>;
  if (isError && !clientes.length) return <div className="admin-section">Error: {displayedError}</div>;

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span>Total Clientes</span>
          <strong>{clientes.length}</strong>
        </div>
        <div className="stat-card">
          <span>Clientes Activos</span>
          <strong>{clientes.filter((c) => c.estado === "Activo").length}</strong>
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
            value={state.searchTerm}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "searchTerm", value: e.target.value })}
          />
        </div>
        <button className="btn btn-success" onClick={() => dispatch({ type: "OPEN_FORM" })}>
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
                  <button className="btn-secondary" type="button" onClick={() => handleEdit(cliente)}>
                    Editar
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => handleDelete(cliente.id)}>
                    Eliminar
                  </button>
                </>
              )}
            />
          ))
        ) : (
          <div style={{ width: "100%", textAlign: "center", padding: "40px", background: "white", borderRadius: "16px" }}>
            No se encontraron clientes.
          </div>
        )}
      </div>

      {state.showForm && <div className="modal-overlay" onClick={() => dispatch({ type: "CLOSE_FORM" })}></div>}

      {state.showForm && (
        <div className="modal-form">
          <h2>{state.editingId ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          {displayedError && <p style={{ color: "#b91c1c" }}>{displayedError}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre"
              value={state.nombre}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "nombre", value: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={state.apellido}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "apellido", value: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="DNI"
              value={state.dni}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "dni", value: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={state.email}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={state.telefono}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "telefono", value: e.target.value })}
              required
            />
            <select
              value={state.tipoCliente}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipoCliente", value: e.target.value })}
              required
            >
              <option value="Propietario">Propietario</option>
              <option value="Inquilino">Inquilino</option>
              <option value="Comprador">Comprador</option>
              <option value="Vendedor">Vendedor</option>
            </select>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">
                {state.editingId ? "Actualizar Cliente" : "Guardar Cliente"}
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
