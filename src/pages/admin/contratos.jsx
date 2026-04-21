import "./admin.css";
import { useState } from "react";

export default function Contratos() {
  const [showForm, setShowForm] = useState(false);

  return (
  
    <main className="admin-page">
      <h1>Esta es la página Contratos</h1>

       {/* Overlay oscuro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nuevo Contrato</h2>
          <form>
            <input type="text" placeholder="Nombre del cliente" required />
            <input type="number" placeholder="Monto del contrato" required />
            <input type="text" placeholder="Propiedad Adquirida" required />
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
