import "./home.css";
import Card from "../componentes/Card";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

function Home() {
  return (
    <main>

      {/* HERO */}
      <section id="inicio" className="hero">
        <div className="container">
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
      </section>

      

      {/* PROPIEDADES */}
      <section id="propiedades" className="propiedades container">
        <div className="section-header">
          <h2>Propiedades en Stock</h2>
          <p className="sub">Explora nuestras unidades destacadas y listas para habitar.</p>
        </div>

        <div className="cards">
          <Swiper
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            loop={true}
            autoplay={{ delay: 3000 }}
          >
            <SwiperSlide><Card /></SwiperSlide>
            <SwiperSlide><Card /></SwiperSlide>
            <SwiperSlide><Card /></SwiperSlide>
            <SwiperSlide><Card /></SwiperSlide>
            <SwiperSlide><Card /></SwiperSlide>
          </Swiper>
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