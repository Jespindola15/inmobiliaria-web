import "./Card.css";

function Card() {
  return (
    <div className="card">
      <div className="card-badges">
        <span className="badge property-type">Departamento</span>
        <span className="badge status">Disponible</span>
      </div>

      <img src="https://picsum.photos/500/320" alt="Propiedad" />

      <div className="card-body">
        <p className="card-location">Ponce de León 162</p>
        <h3>$ 888.888</h3>
        <p className="card-description">Propiedad premium en zona céntrica con vista al río y espacios amplios.</p>
        <button>Consultar</button>
      </div>
    </div>
  );
}

export default Card;