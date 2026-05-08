import "./Card.css";

function Card({ 
  tipo = "Propiedad", 
  estado = "Disponible", 
  imagen = "https://picsum.photos/500/320", 
  ubicacion = "Dirección no disponible", 
  precio = "Consultar", 
  descripcion = "Sin descripción disponible." 
}) {
  return (
    <div className="card">
      <div className="card-badges">
        <span className="badge property-type">{tipo}</span>
        <span className={`badge status ${estado.toLowerCase() === 'disponible' ? '' : 'unavailable'}`}>
          {estado}
        </span>
      </div>

      <img src={imagen} alt={tipo} />

      <div className="card-body">
        <p className="card-location">{ubicacion}</p>
        <h3>{precio}</h3>
        <p className="card-description">{descripcion}</p>
        <button>Consultar</button>
      </div>
    </div>
  );
}

export default Card;