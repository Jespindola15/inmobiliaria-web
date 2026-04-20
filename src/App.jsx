import { useState } from "react";
import Navbar from "./componentes/Navbar";
import AdminPanel from "./componentes/AdminPanel";
import Home from "./pages/home";
import Footer from "./componentes/footer";

function App() {
  const [adminMode, setAdminMode] = useState(false);

  return (
    <>
      {adminMode ? (
        <AdminPanel onClose={() => setAdminMode(false)} />
      ) : (
        <>
          <Navbar onAdminClick={() => setAdminMode(true)} />
          <Home />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;