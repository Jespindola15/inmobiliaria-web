import "./navbar.css";
import { useState } from "react";
import "./navbar.css";

function Navbar({ darkMode, onToggleDarkMode, onAdminClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="brand">
          <span className="brand-mark">I</span>
          inmobiliaria
        </div>

        <button className="hamburger" onClick={toggleMenu}>
          ☰
        </button>

        <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <a href="#inicio">Inicio</a>
          <a href="#propiedades">Propiedades</a>
          <a href="#servicios">Servicios</a>
        

        <button
    type="button"
    className="nav-link-button nav-link-button-theme"
    onClick={onToggleDarkMode}
  >
    {darkMode ? "Modo Claro" : "Modo Oscuro"}
  </button>

  <a href="#agendar">
    <button className="btn-primary">
      Agendar Cita
    </button>
  </a>

  <button
    type="button"
    className="nav-link-button nav-link-button-admin"
    onClick={onAdminClick}
  >
    Modo Admin
  </button>
</nav>

 
      </div>
    </header>
  );
}

export default Navbar;