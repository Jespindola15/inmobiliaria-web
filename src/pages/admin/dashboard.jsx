import "./admin.css";

export default function Dashboard() {
  return (
    <div className="admin-page">
      
      {/* MAIN */}
      <main className="admin-panel-main">
      

        {/* CARDS */}
        <section className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Propiedades</h3>
            <p>Información futura</p>
          </div>

          <div className="dashboard-card">
            <h3>Clientes</h3>
            <p>Información futura</p>
          </div>

          <div className="dashboard-card">
            <h3>Contratos</h3>
            <p>Información futura</p>
          </div>

          <div className="dashboard-card">
            <h3>Facturación</h3>
            <p>Información futura</p>
          </div>
        </section>

        {/* SECCIONES GRANDES */}
        <section className="dashboard-grid">
          
          <div className="dashboard-section-large">
            <h2>Actividad reciente</h2>
            <p>
             mostrar contratos recientes, propiedades
              nuevas o incluso gráficos.
            </p>
          </div>

          <div className="dashboard-section-small">
            <h2>Citas
            </h2>
            <p>Espacio para Citas futuras</p>

            <button className="dashboard-btn">
              Ir a Citas
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}