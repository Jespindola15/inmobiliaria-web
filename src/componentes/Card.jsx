import "./Card.css";

function Card({
  tipo = "Propiedad",
  estado = "Disponible",
  imagen = "https://picsum.photos/500/320",
  titulo = "Propiedad disponible",
  direccion = "Dirección no disponible",
  ciudad = "",
  metrosCuadrados = null,
  operacion = "",
  precio = "Consultar",
  descripcion = "Sin descripción disponible.",
}) {
  const ubicacion = ciudad ? `${direccion}, ${ciudad}` : direccion;
  const metrosText = metrosCuadrados ? `${metrosCuadrados} m²` : null;

  return (
    <div className="card">
      <div className="card-badges">
        <span className="badge property-type">{tipo}</span>
        <span className={`badge status ${estado.toLowerCase() === 'disponible' ? '' : 'unavailable'}`}>
          {estado}
        </span>
      </div>

      <img src={imagen} alt={titulo} />

      <div className="card-body">
        <h3 className="card-title">{titulo}</h3>
        <p className="card-location">{ubicacion}</p>
        <p className="card-meta">
          {operacion && <span>{operacion}</span>}
          {operacion && metrosText && <span> · </span>}
          {metrosText}
        </p>
        <h4 className="card-price">{precio}</h4>
        <p className="card-description">{descripcion}</p>
        <button>Consultar</button>
      </div>
    </div>
  );
}

export default Card;