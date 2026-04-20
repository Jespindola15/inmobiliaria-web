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
          <a href="#inicio">Inicio</a>
          <a href="#propiedades">Propiedades</a>
          <a href="#servicios">Servicios</a>
          <button type="button" className="nav-link-button" onClick={onAdminClick}>
            Acceso Admin
          </button>
        </nav>

        <a href="#agendar"><button className="btn-primary">
          Agendar Cita
        </button></a>
      </div>
    </header>
  );
}

export default Navbar;