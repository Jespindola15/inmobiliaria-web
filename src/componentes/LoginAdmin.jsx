import { useState, useEffect } from "react";
import { decrypt } from "../utils/encryptionUtils";
import "./LoginAdmin.css";

export default function LoginAdmin({ onLoginSuccess, onCancel }) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [encryptedCredentials, setEncryptedCredentials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredentials() {
      try {
        const credentialsUrl = `${import.meta.env.BASE_URL}config/credentials.json`;
        const response = await fetch(credentialsUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setEncryptedCredentials(data.credentials);
      } catch (err) {
        console.error("Error cargando credenciales de admin:", err);
        setError("No se pudieron cargar las credenciales de admin.");
      } finally {
        setLoading(false);
      }
    }

    loadCredentials();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!encryptedCredentials) {
      setError("Credenciales admin no disponibles.");
      return;
    }

    try {
      const adminUser = decrypt(encryptedCredentials.usuario);
      const adminPassword = decrypt(encryptedCredentials.contraseña);

      if (!adminUser || !adminPassword) {
        setError("Error al validar credenciales. Revisa la llave de encriptación.");
        setContraseña("");
        return;
      }

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
      setError("Error al validar credenciales. Verifica la llave de encriptación.");
    }
  };

  if (loading) {
    return (
      <div className="login-admin-overlay">
        <div className="login-admin-modal">
          <h2>Acceso Admin</h2>
          <p>Cargando credenciales...</p>
        </div>
      </div>
    );
  }

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
