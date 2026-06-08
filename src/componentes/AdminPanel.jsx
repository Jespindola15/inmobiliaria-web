import { useState } from "react";
import Dashboard from "../pages/admin/dashboard";
import Contratos from "../pages/admin/contratos";
import Facturas from "../pages/admin/facturas";
import Citas from "../pages/admin/citas";
import Clientes from "../pages/admin/clientes";
import Propiedades from "../pages/admin/propiedades";
import "../pages/admin/admin.css";

const pages = [
  { key: "dashboard", label: "Dashboard" },
  { key: "contratos", label: "Contratos" },
  { key: "facturas", label: "Facturas" },
  { key: "citas", label: "Citas" },
  { key: "clientes", label: "Clientes" },
  { key: "propiedades", label: "Propiedades" },
];

const pageComponents = {
  dashboard: Dashboard,
  contratos: Contratos,
  facturas: Facturas,
  citas: Citas,
  clientes: Clientes,
  propiedades: Propiedades,
};

const today = new Date();
const initialEvents = [
  {
    id: 1,
    title: 'Visita: Juan Pérez - Depto Centro',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
    desc: 'Interesado en alquiler de 2 ambientes',
  },
  {
    id: 2,
    title: 'Cita: María Gómez - Oficina Norte',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30),
    desc: 'Revisión de contrato de venta',
  },
  {
    id: 3,
    title: 'Visita: Carlos Ramírez - Casa Sur',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
    desc: 'Mostrar propiedad y cierre de oferta',
  },
];

export default function AdminPanel({ initialSection = "dashboard", onClose, darkMode, onToggleDarkMode }) {
  const [section, setSection] = useState(initialSection);
  const [events, setEvents] = useState(initialEvents);
  const SectionComponent = pageComponents[section] || Dashboard;

  return (
    <div className={`admin-page admin-panel ${darkMode ? "dark" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">G</span>
          <div>
            <strong>Gestión Pro</strong>
            <small>administración</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {pages.map((page) => (
            <button
              key={page.key}
              type="button"
              className={`sidebar-link ${section === page.key ? "active" : ""}`}
              onClick={() => setSection(page.key)}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-panel-main">
        <header className="admin-panel-top">
          <div>
            <p className="admin-panel-tag">Panel interno</p>
            <h1>{pages.find((page) => page.key === section)?.label || "Dashboard"}</h1>
          </div>
          <div className="admin-panel-buttons">
            <button
              type="button"
              className="admin-panel-theme-btn"
              onClick={onToggleDarkMode}
            >
              {darkMode ? "Modo Claro" : "Modo Oscuro"}
            </button>
            <button className="admin-panel-close" type="button" onClick={onClose}>
              Volver al sitio
            </button>
          </div>
        </header>

        <main className="admin-panel-content">
          <SectionComponent
            events={events}
            setEvents={setEvents}
            onNavigateToCitas={() => setSection("citas")}
          />
        </main>
      </div>
    </div>
  );
}
