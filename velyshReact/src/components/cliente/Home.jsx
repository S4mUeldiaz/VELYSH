import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProductos, getCategorias } from "../../Api/api";
import { FiShoppingBag, FiHeart, FiSearch } from "react-icons/fi";
import "./Home.css";

export default function Home() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda,   setBusqueda]   = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  useEffect(() => {
    getProductos().then(setProductos);
    getCategorias().then(setCategorias);
  }, []);

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva ? p.id_categoria === categoriaActiva : true
    return coincideBusqueda && coincideCategoria
  })

  return (
    <div className="home-wrapper">

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-hero-sub">Nueva colección 2026</p>
          <h1 className="home-hero-title">Encuentra tu <span>estilo</span></h1>
          <p className="home-hero-desc">Los mejores zapatos al mejor precio</p>
          <Link to="/catalogo" className="home-hero-btn">Ver catálogo</Link>
        </div>
        <div className="home-hero-img">
          <img src="/zapato.png" alt="Velysh" />
        </div>
      </section>

      {/* BÚSQUEDA */}
      <section className="home-search-section">
        <div className="home-search-bar">
          <FiSearch className="home-search-icon" />
          <input
            className="home-search-input"
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="home-categorias">
        <button
          className={`home-cat-btn ${categoriaActiva === null ? 'active' : ''}`}
          onClick={() => setCategoriaActiva(null)}
        >
          Todos
        </button>
        {categorias.map(c => (
          <button
            key={c.id_categoria}
            className={`home-cat-btn ${categoriaActiva === c.id_categoria ? 'active' : ''}`}
            onClick={() => setCategoriaActiva(c.id_categoria)}
          >
            {c.nombre_categoria}
          </button>
        ))}
      </section>

      {/* PRODUCTOS */}
      <section className="home-productos">
        <h2 className="home-section-title">Productos destacados</h2>
        <div className="home-productos-grid">
          {productosFiltrados.map(p => (
            <div key={p.id_producto} className="home-producto-card">
              <div className="home-producto-img">
                <img src="/zapato.png" alt={p.nombre} />
                <button className="home-fav-btn"><FiHeart /></button>
              </div>
              <div className="home-producto-info">
                <p className="home-producto-categoria">{p.categorias?.nombre_categoria ?? p.nombre_categoria}</p>
                <h3 className="home-producto-nombre">{p.nombre}</h3>
                <p className="home-producto-marca">{p.marca}</p>
                <div className="home-producto-footer">
                  <span className="home-producto-precio">${p.precio.toLocaleString()}</span>
                  <Link to={`/producto/${p.id_producto}`} className="home-producto-btn">
                    <FiShoppingBag /> Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}