import { useState } from "react";
import { decrypt } from "../utils/encryptionUtils";
import "./LoginAdmin.css";

// Credenciales encriptadas (mismo valor que en public/config/credentials.json)
const ENCRYPTED_CREDENTIALS = {
  usuario: "U2FsdGVkX18fyfIWM5yLkK6/KBrjaI1y65gJY09hoew=",
  contraseña: "U2FsdGVkX1/M91uCDH+NmQyKMcFA5g1d6XkN/ca+Nhw="
};

export default function LoginAdmin({ onLoginSuccess, onCancel }) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      // Desencriptar las credenciales almacenadas
      const adminUser = decrypt(ENCRYPTED_CREDENTIALS.usuario);
      const adminPassword = decrypt(ENCRYPTED_CREDENTIALS.contraseña);

      // Comparar con las ingresadas
      if (usuario === adminUser && contraseña === adminPassword) {
        onLoginSuccess();
        setUsuario("");
        setContraseña("");
      } else {
        setError("Usuario o contraseña incorrectos");
        setContraseña("");
      }
    } catch (err) {
      console.error("Error al desencriptar:", err);
      setError("Error al validar credenciales");
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
