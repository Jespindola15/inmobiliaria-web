import { useState } from "react";
import Navbar from "./componentes/Navbar";
import AdminPanel from "./componentes/AdminPanel";
import Home from "./pages/home";
import Footer from "./componentes/footer";

function App() {
  const [adminMode, setAdminMode] = useState(false);

  return (
    <>
      <Navbar onAdminClick={() => setAdminMode(true)} />
      {adminMode ? (
        <AdminPanel onClose={() => setAdminMode(false)} />
      ) : (
        <>
          <Home />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;