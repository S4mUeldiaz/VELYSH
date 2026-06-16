import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProductos, getCategorias, getFavoritos, agregarFavorito, eliminarFavorito, getUsuarioActual } from "../../Api/api";
import { FiHeart, FiShoppingBag, FiFilter } from "react-icons/fi";
import "./Catalogo.css";

export default function Catalogo() {
  const [productos,        setProductos]        = useState([]);
  const [categorias,       setCategorias]       = useState([]);
  const [favoritos,        setFavoritos]        = useState([]);
  const [categoriaActiva,  setCategoriaActiva]  = useState(null);
  const [ordenPrecio,      setOrdenPrecio]      = useState("");
  const [cargando,         setCargando]         = useState(true);
  const usuario = getUsuarioActual();

  useEffect(() => {
    Promise.all([
      getProductos(),
      getCategorias(),
      getFavoritos(usuario?.numero_documento)
    ]).then(([prods, cats, favs]) => {
      setProductos(prods)
      setCategorias(cats)
      setFavoritos(favs.map(f => f.id_producto))
      setCargando(false)
    })
  }, [])

  async function toggleFavorito(id_producto) {
    const esFav = favoritos.includes(id_producto)
    if (esFav) {
      await eliminarFavorito(usuario?.numero_documento, id_producto)
      setFavoritos(prev => prev.filter(id => id !== id_producto))
    } else {
      await agregarFavorito(usuario?.numero_documento, id_producto)
      setFavoritos(prev => [...prev, id_producto])
    }
  }

  let productosFiltrados = productos
    .filter(p => categoriaActiva ? p.id_categoria === categoriaActiva : true)

  if (ordenPrecio === "asc")  productosFiltrados = [...productosFiltrados].sort((a, b) => a.precio - b.precio)
  if (ordenPrecio === "desc") productosFiltrados = [...productosFiltrados].sort((a, b) => b.precio - a.precio)

  return (
    <div className="catalogo-wrapper">

      {/* HEADER */}
      <div className="catalogo-header">
        <h1 className="catalogo-title">Catálogo</h1>
        <p className="catalogo-sub">{productosFiltrados.length} productos encontrados</p>
      </div>

      {/* FILTROS */}
      <div className="catalogo-filtros">
        <div className="catalogo-categorias">
          <button
            className={`catalogo-cat-btn ${categoriaActiva === null ? 'active' : ''}`}
            onClick={() => setCategoriaActiva(null)}
          >
            Todos
          </button>
          {categorias.map(c => (
            <button
              key={c.id_categoria}
              className={`catalogo-cat-btn ${categoriaActiva === c.id_categoria ? 'active' : ''}`}
              onClick={() => setCategoriaActiva(c.id_categoria)}
            >
              {c.nombre_categoria}
            </button>
          ))}
        </div>

        <div className="catalogo-orden">
          <FiFilter />
          <select
            className="catalogo-select"
            value={ordenPrecio}
            onChange={e => setOrdenPrecio(e.target.value)}
          >
            <option value="">Ordenar por</option>
            <option value="asc">Menor precio</option>
            <option value="desc">Mayor precio</option>
          </select>
        </div>
      </div>

      {/* GRID */}
      {cargando ? (
        <div className="catalogo-loading">Cargando productos...</div>
      ) : (
        <div className="catalogo-grid">
          {productosFiltrados.map(p => (
            <div key={p.id_producto} className="catalogo-card">
              <div className="catalogo-card-img">
                <img src="/zapato.png" alt={p.nombre} />
                <button
                  className={`catalogo-fav ${favoritos.includes(p.id_producto) ? 'active' : ''}`}
                  onClick={() => toggleFavorito(p.id_producto)}
                >
                  <FiHeart />
                </button>
              </div>
              <div className="catalogo-card-info">
                <p className="catalogo-card-cat">{p.nombre_categoria}</p>
                <h3 className="catalogo-card-nombre">{p.nombre}</h3>
                <p className="catalogo-card-marca">{p.marca}</p>
                <div className="catalogo-card-footer">
                  <span className="catalogo-card-precio">${p.precio.toLocaleString()}</span>
                  <Link to={`/producto/${p.id_producto}`} className="catalogo-card-btn">
                    <FiShoppingBag /> Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}