import "./admin.css";
import { useState } from "react";
import Card from "../../componentes/Card";

export default function Propiedades() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="admin-page">
      <div className="propiedades-container">
       
        <div className="section-card"> 
          <div className="admin-list">
            <Card />
            <Card />
            <Card />
            <Card />
            
            
          </div>
        </div>
      </div>

      {/* Overlay oscuro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nueva Propiedad</h2>
          <form>
            <input type="text" placeholder="Dirección" required />
            <input type="number" placeholder="Precio" required />
            <input type="text" placeholder="Tipo de propiedad" required />
            <textarea placeholder="Descripción"></textarea>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Guardar</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botón flotante abajo a la derecha */}
      <button 
        className="fab-button" 
        onClick={() => setShowForm(!showForm)}
        title="Agregar Propiedad"
      >
        +
      </button>
    </main>
  );
}
