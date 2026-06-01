import { useState, useEffect } from "react";
import Navbar from "./componentes/Navbar";
import AdminPanel from "./componentes/AdminPanel";
import Home from "./pages/home";
import Footer from "./componentes/footer";

function App() {
  const [adminMode, setAdminMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      {adminMode ? (
        <AdminPanel onClose={() => setAdminMode(false)} />
      ) : (
        <>
          <Navbar
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
            onAdminClick={() => setAdminMode(true)}
          />
          <Home />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;