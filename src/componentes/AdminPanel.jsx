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

export default function AdminPanel({ initialSection = "dashboard", onClose }) {
  const [section, setSection] = useState(initialSection);
  const SectionComponent = pageComponents[section] || Dashboard;

  return (
    <div className="admin-page admin-panel">
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
          <button className="admin-panel-close" type="button" onClick={onClose}>
            Volver al sitio
          </button>
        </header>

        <main className="admin-panel-content">
          <SectionComponent />
        </main>
      </div>
    </div>
  );
}
