import "./navbar.css";

function Navbar({ onAdminClick }) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="brand">
          <span className="brand-mark">G</span>
          Gestión Pro
        </div>

        <nav>
          <a href="#">Inicio</a>
          <a href="#">Propiedades</a>
          <a href="#">Servicios</a>
          <a href="#">Agendar Visita</a>
          <button type="button" className="nav-link-button" onClick={onAdminClick}>
            Acceso Admin
          </button>
        </nav>

        <button className="btn-primary">Agendar Cita</button>
      </div>
    </header>
  );
}

export default Navbar;