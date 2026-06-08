import { useState } from "react";
import "./LoginAdmin.css";

export default function LoginAdmin({ onLoginSuccess, onCancel }) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  const ADMIN_USER = "Admin123";
  const ADMIN_PASSWORD = "Entrar123";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (usuario === ADMIN_USER && contraseña === ADMIN_PASSWORD) {
      onLoginSuccess();
      setUsuario("");
      setContraseña("");
    } else {
      setError("Usuario o contraseña incorrectos");
      setContraseña("");
    }
  };

  return (
    <div className="login-admin-overlay">
      <div className="login-admin-modal">
        <h2>Acceso Admin</h2>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "20px" }}>
          Ingresa tus credenciales para acceder al panel de administración
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              type="text"
              id="usuario"
              placeholder="Ingresa el usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="contraseña">Contraseña</label>
            <input
              type="password"
              id="contraseña"
              placeholder="Ingresa la contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
          </div>

          {error && (
            <div className="login-error">
              ❌ {error}
            </div>
          )}

          <div className="login-actions">
            <button type="submit" className="btn btn-success">
              Entrar
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
