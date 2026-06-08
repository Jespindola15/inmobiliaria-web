import { useState, useEffect } from "react";
import Navbar from "./componentes/Navbar";
import AdminPanel from "./componentes/AdminPanel";
import LoginAdmin from "./componentes/LoginAdmin";
import Home from "./pages/home";
import Footer from "./componentes/footer";

function App() {
  const [adminMode, setAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      {showLogin && (
        <LoginAdmin
          onLoginSuccess={() => {
            setShowLogin(false);
            setAdminMode(true);
          }}
          onCancel={() => setShowLogin(false)}
        />
      )}
      {adminMode ? (
        <AdminPanel
          onClose={() => setAdminMode(false)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        />
      ) : (
        <>
          <Navbar
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
            onAdminClick={() => setShowLogin(true)}
          />
          <Home />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;