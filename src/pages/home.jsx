import "./home.css";
import Card from "../componentes/Card";
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState, useEffect, useCallback } from "react";
import 'swiper/css';
import { fetchApi } from "../api";

function Home() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeProperty = (property) => ({
    id: property.id ?? property._id,
    tipo: property.tipo ?? "Propiedad",
    estado: property.estado ?? "Disponible",
    imagen: property.imagen ?? property.imagenes?.[0] ?? "https://picsum.photos/500/320",
    titulo: property.titulo ?? property.descripcion ?? "Propiedad disponible",
    direccion: property.direccion ?? "Dirección no disponible",
    ciudad: property.ciudad ?? "",
    metrosCuadrados: property.metrosCuadrados ?? property.m2 ?? null,
    operacion: property.operacion ?? "",
    precio: property.precio ? `$ ${property.precio}` : "Consultar",
    descripcion: property.descripcion ?? "Sin descripción disponible.",
  });

  const loadPropiedades = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi("/Propiedades");
      setPropiedades(
        Array.isArray(data) ? data.map(normalizeProperty) : []
      );
      setError(null);
    } catch (err) {
      console.error("Error cargando propiedades en Home:", err);
      setPropiedades([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPropiedades();
  }, [loadPropiedades]);

  useEffect(() => {
    const handleFocus = () => loadPropiedades();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadPropiedades]);

  return (
    <main>

      {/* HERO */}
      <section id="inicio" className="hero">
        <div className="container hero-grid">
          
          {/* TEXTO */}
          <div className="hero-text">
            <span className="badge">Inmobiliaria Líder en Buenos Aires</span>

            <h1>
              Encuentra el hogar donde <br />
              <span>comienza tu historia.</span>
            </h1>

            <p>
              Ofrecemos las mejores propiedades con asesoramiento personalizado y gestión transparente.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary">Ver Catálogo</button>
              <button className="btn-secondary">Solicitar Visita</button>
            </div>
          </div>

          {/* IMAGEN */}
          <div className="hero-img">
            <img src="/inmobiliaria-web/hero.png" alt="Propiedad" />          
          </div>

        </div>
      </section>

      {/* PROPIEDADES */}
      <section id="propiedades" className="propiedades container">
        <div className="section-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap'}}>
          <div>
            <h2>Propiedades en Stock</h2>
            <p className="sub">Explora nuestras unidades destacadas y listas para habitar.</p>
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={loadPropiedades}
            disabled={loading}
            style={{whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1}}
          >
            {loading ? "Actualizando..." : "Actualizar propiedades"}
          </button>
        </div>

        <div className="cards">
          {loading ? (
            <p style={{textAlign: 'center', padding: '40px'}}>Cargando propiedades...</p>
          ) : error ? (
            <p style={{textAlign: 'center', padding: '40px', color: '#b91c1c'}}>
              Error cargando propiedades: {error}
            </p>
          ) : propiedades.length > 0 ? (
            <>
              <p style={{textAlign: 'center', marginBottom: '20px', color: '#334155'}}>
                Propiedades encontradas: {propiedades.length}
              </p>
              <div className="cards-grid">
                {propiedades.map((p) => (
                  <Card
                    key={p.id}
                    tipo={p.tipo}
                    estado={p.estado}
                    imagen={p.imagen}
                    titulo={p.titulo}
                    direccion={p.direccion}
                    ciudad={p.ciudad}
                    metrosCuadrados={p.metrosCuadrados}
                    operacion={p.operacion}
                    precio={p.precio}
                    descripcion={p.descripcion}
                  />
                ))}
              </div>
            </>
          ) : (
            <p style={{textAlign: 'center', padding: '40px'}}>No hay propiedades disponibles en este momento.</p>
          )}
        </div>
      </section> 

      {/* SERVICIOS */}
      <section id="servicios" className="servicios">
        <div className="container servicios-grid">

          <div className="servicios-text">
            <p className="eyebrow">Excelencia en gestión</p>
            <h2>Servicio integral, resultados reales.</h2>
            <p>
              Nos encargamos de todo el proceso para que tú no tengas que preocuparte por nada.
            </p>

            <ul>
              <li>
                <strong>Asesoramiento Legal</strong>
                <span>Contratos claros y transparentes.</span>
              </li>
              <li>
                <strong>Mantenimiento Proactivo</strong>
                <span>Cuidamos tu propiedad como si fuera nuestra.</span>
              </li>
            </ul>
          </div>

          <div className="img-servicio">
            <p>Líderes en el mercado desde 2010</p>
          </div>

        </div>
      </section>

      {/* FORM */}
      <section id="agendar" className="form-section">
        <div className="container form-grid">

          <div className="info">
            <p className="eyebrow white">Agendar una Visita</p>
            <h3>¿Vas a venir a ver algo que te gustó?</h3>
            <p>Completa el formulario y coordinamos una cita para que conozcas tu próximo hogar.</p>

            <div className="info-contact">
              <p><strong>+54 11 4455-6677</strong></p>
              <p>contacto@gestionpro.com</p>
            </div>

            <p className="info-note">Atendemos de lunes a sábado de 9:00 a 18:00 hs.</p>
          </div>

          <form className="form">
            <div className="form-row">
              <input placeholder="Nombre completo" />
              <input placeholder="Email" />
            </div>
            <div className="form-row">
              <input placeholder="Teléfono" />
              <input placeholder="Propiedad de interés" />
            </div>
            <textarea placeholder="Mensaje"></textarea>
            <button className="btn-primary">Enviar Solicitud</button>
          </form>

        </div>
      </section>

    </main>
  );
}

export default Home;