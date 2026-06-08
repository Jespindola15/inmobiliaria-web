import "./admin.css";
import { useState, useEffect } from "react";
import Card from "../../componentes/Card";
import { fetchApi, requestApi } from "../../api";

export default function Propiedades() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [operacion, setOperacion] = useState("");
  const [metrosCuadrados, setMetrosCuadrados] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipo, setTipo] = useState("");
  const [imagen, setImagen] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const loadPropiedades = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/Propiedades");
      setPropiedades(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPropiedades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropiedades();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitulo("");
    setDireccion("");
    setCiudad("");
    setOperacion("");
    setMetrosCuadrados("");
    setPrecio("");
    setTipo("");
    setImagen("");
    setDescripcion("");
    setError(null);
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setTitulo(property.titulo || "");
    setDireccion(property.direccion || "");
    setCiudad(property.ciudad || "");
    setOperacion(property.operacion || "");
    setMetrosCuadrados(property.metrosCuadrados?.toString() || "");
    setPrecio(property.precio || "");
    setTipo(property.tipo || "");
    setImagen(property.imagen || "");
    setDescripcion(property.descripcion || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta propiedad?")) return;
    if (!id) {
      setError("No se pudo eliminar: ID de la propiedad no está definido.");
      return;
    }

    try {
      await requestApi(`/Propiedades/${id}`, { method: "DELETE" });
      await loadPropiedades();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Client-side validation
    const errs = [];
    if (!titulo || !titulo.toString().trim()) errs.push('Titulo es necesario');
    if (!direccion || !direccion.toString().trim()) errs.push('Direccion es necesaria');
    if (!ciudad || !ciudad.toString().trim()) errs.push('Ciudad es necesaria');
    if (!operacion) errs.push('Operacion es necesaria');
    if (!tipo) errs.push('Tipo es necesario');
    const mc = Number(metrosCuadrados);
    if (Number.isNaN(mc) || mc <= 0) errs.push('MetrosCuadrados invalidos');
    const p = parseFloat(precio);
    if (Number.isNaN(p) || p <= 0) errs.push('Precio debe ser mayor a 0');
    if (!descripcion || !descripcion.toString().trim()) errs.push('Descripcion es necesaria');

    if (errs.length > 0) {
      setError(errs.join('. '));
      return;
    }

    try {
      const newProperty = {
        titulo,
        direccion,
        ciudad,
        operacion,
        metrosCuadrados: mc,
        precio: p,
        tipo,
        imagen: imagen,
        descripcion,
        estado: "Disponible",
      };

      const bodyToSend = editingId ? { id: editingId, ...newProperty } : newProperty;

      await requestApi(
        editingId ? `/Propiedades/${editingId}` : "/Propiedades",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyToSend),
        }
      );

      await loadPropiedades();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const filteredPropiedades = (propiedades || []).filter((p) =>
    p.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
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
                imagen={p.imagen ?? p.imagenes?.[0] ?? "https://picsum.photos/500/320"}
                titulo={p.titulo}
                direccion={p.direccion}
                ciudad={p.ciudad}
                metrosCuadrados={p.metrosCuadrados}
                operacion={p.operacion}
                precio={p.precio ? `$ ${p.precio}` : "Consultar"}
                descripcion={p.descripcion}
              />
              <div style={{position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px'}}>
                <button
                  className="action-btn"
                  style={{background: 'white', borderRadius: '50%'}}
                  onClick={() => handleEdit(p)}
                  type="button"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="action-btn"
                  style={{background: 'white', borderRadius: '50%'}}
                  onClick={() => handleDelete(p.id)}
                  type="button"
                  title="Eliminar"
                >
                  🗑️
                </button>
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
          <h2>{editingId ? "Editar Propiedad" : "Nueva Propiedad"}</h2>
          {error && <div style={{color: '#b91c1c', marginBottom: '12px'}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
              />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
              <select
                value={operacion}
                onChange={(e) => setOperacion(e.target.value)}
                required
              >
                <option value="">Operación</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="">Tipo</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Terreno">Terreno</option>
                <option value="Local">Local</option>
              </select>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
              <input
                type="number"
                placeholder="Metros cuadrados"
                value={metrosCuadrados}
                onChange={(e) => setMetrosCuadrados(e.target.value)}
                required
                min="0"
              />
              <input
                type="number"
                placeholder="Precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
            <input
              type="text"
              placeholder="URL de la imagen"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
            />
            <textarea
              placeholder="Descripción detallada de la propiedad"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? "Actualizar Propiedad" : "Guardar Propiedad"}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
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
