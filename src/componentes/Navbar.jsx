import "./navbar.css";

function Navbar({ darkMode, onToggleDarkMode, onAdminClick }) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="brand">
          <span className="brand-mark">I</span>
          inmobiliaria
        </div>

        <nav className="nav-links">
          <a href="#inicio">Inicio</a>
          <a href="#propiedades">Propiedades</a>
          <a href="#servicios">Servicios</a>
        </nav>

        <div className="nav-buttons">
          <button
            type="button"
            className="nav-link-button nav-link-button-theme"
            onClick={onToggleDarkMode}
          >
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
          </button>
          <a href="#agendar">
            <button className="btn-primary">Agendar Cita</button>
          </a>
          <button
            type="button"
            className="nav-link-button nav-link-button-admin"
            onClick={onAdminClick}
          >
            Modo Admin
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;