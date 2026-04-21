import "./admin.css";
import { useState } from "react";

export default function Clientes() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="admin-page">
      <h1>Esta es la página Clientes</h1>

       {/* Overlay oscuro */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

      {/* Modal flotante */}
      {showForm && (
        <div className="modal-form">
          <h2>Nuevo Cliente</h2>
          <form>
            <input type="text" placeholder="Nombre del cliente" required />
            <input type="number" placeholder="Número de teléfono" required />
            <input type="email" placeholder="Mail" required />
            <textarea placeholder="Observaciones"></textarea>
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
