import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProductos, getCategorias, getStock } from "../../Api/api";
import { getColorHex } from "../../utils/colores";
import { FiShoppingBag, FiHeart, FiSearch, FiFilter, FiX } from "react-icons/fi";
import "./Home.css";

function obtenerImagenPrincipal(producto) {
  const imagenes = producto.imagenes_producto
  if (!imagenes || imagenes.length === 0) return '/zapato.png'

  const principal = [...imagenes].sort((a, b) => a.orden - b.orden)[0]
  return principal?.url_imagen || '/zapato.png'
}

export default function Home() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stock,       setStock]      = useState([]);
  const [busqueda,   setBusqueda]   = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // RF-18: filtro avanzado (mismo criterio que Catalogo.jsx)
  const [coloresSelec, setColoresSelec] = useState([]);
  const [tallasSelec,  setTallasSelec]  = useState([]);
  const [precioMin,    setPrecioMin]    = useState(0);
  const [precioMax,    setPrecioMax]    = useState(0);

  useEffect(() => {
    Promise.all([getProductos(), getCategorias(), getStock()]).then(([prods, cats, st]) => {
      setProductos(prods)
      setCategorias(cats)
      setStock(st)

      if (prods.length > 0) {
        const precios = prods.map(p => Number(p.precio))
        setPrecioMin(Math.min(...precios))
        setPrecioMax(Math.max(...precios))
      }
    });
  }, []);

  const coloresDisponibles = useMemo(() => {
    return [...new Set(stock.map(s => s.color))].filter(Boolean).sort()
  }, [stock])

  const tallasDisponibles = useMemo(() => {
    const unicas = [...new Set(stock.map(s => s.tallas?.talla))].filter(Boolean)
    return unicas.sort((a, b) => Number(a) - Number(b))
  }, [stock])

  const precioMinAbsoluto = productos.length > 0 ? Math.min(...productos.map(p => Number(p.precio))) : 0
  const precioMaxAbsoluto = productos.length > 0 ? Math.max(...productos.map(p => Number(p.precio))) : 0

  const variantesPorProducto = useMemo(() => {
    const mapa = {}
    stock.forEach(s => {
      if (!mapa[s.id_producto]) mapa[s.id_producto] = { colores: new Set(), tallas: new Set() }
      if (s.color) mapa[s.id_producto].colores.add(s.color)
      if (s.tallas?.talla) mapa[s.id_producto].tallas.add(s.tallas.talla)
    })
    return mapa
  }, [stock])

  function toggleColor(color) {
    setColoresSelec(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
  }

  function toggleTalla(talla) {
    setTallasSelec(prev => prev.includes(talla) ? prev.filter(t => t !== talla) : [...prev, talla])
  }

  function limpiarFiltros() {
    setColoresSelec([])
    setTallasSelec([])
    setPrecioMin(precioMinAbsoluto)
    setPrecioMax(precioMaxAbsoluto)
  }

  const hayFiltrosActivos = coloresSelec.length > 0 || tallasSelec.length > 0 ||
    precioMin > precioMinAbsoluto || precioMax < precioMaxAbsoluto

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva ? p.id_categoria === categoriaActiva : true
    if (!coincideBusqueda || !coincideCategoria) return false

    const precio = Number(p.precio)
    if (precio < precioMin || precio > precioMax) return false

    const variantes = variantesPorProducto[p.id_producto]
    if (coloresSelec.length > 0) {
      const tieneColor = variantes && coloresSelec.some(c => variantes.colores.has(c))
      if (!tieneColor) return false
    }
    if (tallasSelec.length > 0) {
      const tieneTalla = variantes && tallasSelec.some(t => variantes.tallas.has(t))
      if (!tieneTalla) return false
    }

    return true
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

      {/* BÚSQUEDA + FILTROS */}
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
        <button
          className={`home-btn-filtros ${hayFiltrosActivos ? 'activo' : ''}`}
          onClick={() => setFiltrosAbiertos(true)}
        >
          <FiFilter /> Filtros {hayFiltrosActivos && <span className="home-filtros-dot" />}
        </button>
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

      {/* PANEL DE FILTRO AVANZADO (RF-18) */}
      {filtrosAbiertos && (
        <div className="home-filtros-overlay" onClick={() => setFiltrosAbiertos(false)}>
          <div className="home-filtros-panel" onClick={e => e.stopPropagation()}>
            <div className="home-filtros-panel-header">
              <h3>Filtros</h3>
              <button onClick={() => setFiltrosAbiertos(false)}><FiX /></button>
            </div>

            <div className="home-filtro-grupo">
              <p className="home-filtro-label">Color</p>
              <div className="home-filtro-colores">
                {coloresDisponibles.map(color => (
                  <button
                    key={color}
                    className={`home-filtro-color-btn ${coloresSelec.includes(color) ? 'activo' : ''}`}
                    style={{ background: getColorHex(color) }}
                    onClick={() => toggleColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="home-filtro-grupo">
              <p className="home-filtro-label">Talla</p>
              <div className="home-filtro-tallas">
                {tallasDisponibles.map(talla => (
                  <button
                    key={talla}
                    className={`home-filtro-talla-btn ${tallasSelec.includes(talla) ? 'activo' : ''}`}
                    onClick={() => toggleTalla(talla)}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>

            <div className="home-filtro-grupo">
              <p className="home-filtro-label">Rango de precios</p>
              <div className="home-filtro-precios-inputs">
                <input
                  type="number"
                  className="home-filtro-precio-input"
                  value={precioMin}
                  min={precioMinAbsoluto}
                  max={precioMax}
                  onChange={e => setPrecioMin(Math.min(Number(e.target.value), precioMax))}
                />
                <span>—</span>
                <input
                  type="number"
                  className="home-filtro-precio-input"
                  value={precioMax}
                  min={precioMin}
                  max={precioMaxAbsoluto}
                  onChange={e => setPrecioMax(Math.max(Number(e.target.value), precioMin))}
                />
              </div>
              <div className="home-filtro-slider-wrapper">
                <input
                  type="range"
                  className="home-filtro-slider"
                  min={precioMinAbsoluto}
                  max={precioMaxAbsoluto}
                  value={precioMin}
                  onChange={e => setPrecioMin(Math.min(Number(e.target.value), precioMax))}
                />
                <input
                  type="range"
                  className="home-filtro-slider"
                  min={precioMinAbsoluto}
                  max={precioMaxAbsoluto}
                  value={precioMax}
                  onChange={e => setPrecioMax(Math.max(Number(e.target.value), precioMin))}
                />
              </div>
              <div className="home-filtro-precio-labels">
                <span>${precioMinAbsoluto.toLocaleString()}</span>
                <span>${precioMaxAbsoluto.toLocaleString()}</span>
              </div>
            </div>

            <div className="home-filtro-acciones">
              <button className="home-filtro-limpiar" onClick={limpiarFiltros}>Limpiar filtros</button>
              <button className="home-filtro-aplicar" onClick={() => setFiltrosAbiertos(false)}>
                Ver {productosFiltrados.length} resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTOS */}
      <section className="home-productos">
        <h2 className="home-section-title">Productos destacados</h2>
        <div className="home-productos-grid">
          {productosFiltrados.map(p => (
            <div key={p.id_producto} className="home-producto-card">
              <div className="home-producto-img">
                <img src={obtenerImagenPrincipal(p)} alt={p.nombre} />
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
          {productosFiltrados.length === 0 && (
            <p className="home-sin-resultados">No hay productos que coincidan con los filtros seleccionados.</p>
          )}
        </div>
      </section>

    </div>
  )
}