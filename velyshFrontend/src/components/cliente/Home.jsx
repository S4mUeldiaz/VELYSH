import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProductos, getCategorias, getStock, getFavoritos, agregarFavorito, eliminarFavorito, getUsuarioActual } from "../../Api/api";
import { getColorHex } from "../../utils/colores";
import { obtenerImagenPrincipal, manejarErrorImagen } from "../../utils/imagenes";
import { useScrollReveal } from "../../utils/useScrollReveal";
import QuickView from "../shared/QuickView";
import EstadoVacio from "../shared/EstadoVacio";
import { FiShoppingBag, FiSearch, FiFilter, FiX, FiEye } from "react-icons/fi";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./Home.css";

const HERO_SCROLL_RANGE = 320;
const SKELETON_COUNT = 8;


export default function Home() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stock,       setStock]      = useState([]);
  const [favoritos,  setFavoritos]  = useState([]);
  const [busqueda,   setBusqueda]   = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [generoActivo, setGeneroActivo] = useState(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [coloresSelec, setColoresSelec] = useState([]);
  const [tallasSelec,  setTallasSelec]  = useState([]);
  const [precioMin,    setPrecioMin]    = useState(0);
  const [precioMax,    setPrecioMax]    = useState(0);
  const [cargando,     setCargando]     = useState(true);
  const [quickViewId,  setQuickViewId]  = useState(null);

  const usuario = getUsuarioActual();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getProductos(),
      getCategorias(),
      getStock(),
      usuario ? getFavoritos(usuario.numero_documento) : Promise.resolve([])
    ]).then(([prods, cats, st, favs]) => {
      setProductos(prods)
      setCategorias(cats)
      setStock(st)
      setFavoritos(favs.map(f => f.id_producto))

      if (prods.length > 0) {
        const precios = prods.map(p => Number(p.precio))
        setPrecioMin(Math.min(...precios))
        setPrecioMax(Math.max(...precios))
      }

      setCargando(false)
    });
  }, []);

  useEffect(() => {
    function handleScroll() {
      const progreso = Math.min(window.scrollY / HERO_SCROLL_RANGE, 1);
      setScrollProgress(progreso);
    }
    handleScroll(); // estado inicial correcto si ya hay scroll al montar
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function toggleFavorito(id_producto) {
    if (!usuario) {
      navigate('/login')
      return
    }
    const esFav = favoritos.includes(id_producto)
    if (esFav) {
      await eliminarFavorito(usuario?.numero_documento, id_producto)
      setFavoritos(prev => prev.filter(id => id !== id_producto))
    } else {
      await agregarFavorito(usuario?.numero_documento, id_producto)
      setFavoritos(prev => [...prev, id_producto])
    }
  }

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

  function limpiarTodosLosFiltros() {
    limpiarFiltros()
    setBusqueda("")
    setCategoriaActiva(null)
    setGeneroActivo(null)
  }

  const hayFiltrosActivos = coloresSelec.length > 0 || tallasSelec.length > 0 ||
    precioMin > precioMinAbsoluto || precioMax < precioMaxAbsoluto

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva ? p.id_categoria === categoriaActiva : true
    const coincideGenero = generoActivo ? (p.genero === generoActivo || p.genero === 'unisex') : true
    if (!coincideBusqueda || !coincideCategoria || !coincideGenero) return false

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

  const gridRef = useScrollReveal([productosFiltrados.length, cargando])

  return (
    <div className="home-wrapper">

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <img src="/zapato_home.webp" alt="" className="home-hero-bg-img" aria-hidden="true" />
          <div className="home-hero-overlay" />
        </div>

        <h1
          className="home-hero-logo"
          style={{
            opacity: 1 - scrollProgress,
            transform: `translate(-50%, calc(-50% - ${scrollProgress * 40}px)) scale(${1 - 0.45 * scrollProgress})`,
          }}
        >
          VELYSH
        </h1>

        <p
          className="home-hero-sub"
          style={{ opacity: 1 - scrollProgress, pointerEvents: scrollProgress > 0.6 ? "none" : "auto" }}
        >
          Nueva colección 2026
        </p>

        <Link
          to="/catalogo"
          className="home-hero-btn"
          style={{ opacity: 1 - scrollProgress, pointerEvents: scrollProgress > 0.6 ? "none" : "auto" }}
        >
          Ver catálogo →
        </Link>
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

      {/* GÉNERO */}
      <section className="home-categorias home-genero-filtro">
        <button
          className={`home-cat-btn ${generoActivo === null ? 'active' : ''}`}
          onClick={() => setGeneroActivo(null)}
        >
          Todos los géneros
        </button>
        <button
          className={`home-cat-btn ${generoActivo === 'hombre' ? 'active' : ''}`}
          onClick={() => setGeneroActivo('hombre')}
        >
          Hombre
        </button>
        <button
          className={`home-cat-btn ${generoActivo === 'mujer' ? 'active' : ''}`}
          onClick={() => setGeneroActivo('mujer')}
        >
          Mujer
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

        {cargando ? (
          <div className="home-productos-grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="home-skeleton-card">
                <div className="home-skeleton-img" />
                <div className="home-skeleton-info">
                  <div className="home-skeleton-line home-skeleton-line-sm" />
                  <div className="home-skeleton-line home-skeleton-line-lg" />
                  <div className="home-skeleton-line home-skeleton-line-md" />
                  <div className="home-skeleton-footer">
                    <div className="home-skeleton-line home-skeleton-line-price" />
                    <div className="home-skeleton-btn" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="home-productos-grid" ref={gridRef}>
            {productosFiltrados.map(p => {
              const esFavorito = favoritos.includes(p.id_producto)
              return (
                <div key={p.id_producto} className="home-producto-card">
                  <div className="home-producto-img">
                    <img src={obtenerImagenPrincipal(p)} alt={p.nombre} loading="lazy" onError={manejarErrorImagen} />
                    <button
                      className="home-quickview-btn"
                      onClick={() => setQuickViewId(p.id_producto)}
                      aria-label="Vista rápida"
                    >
                      <FiEye />
                    </button>
                    <button
                      className={`home-fav-btn ${esFavorito ? 'active' : ''}`}
                      onClick={() => toggleFavorito(p.id_producto)}
                      aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      {esFavorito
                        ? <FaHeart key="filled" />
                        : <FiHeart key="outline" />}
                    </button>
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
              )
            })}
            {productosFiltrados.length === 0 && (
              <EstadoVacio
                titulo="No encontramos productos con estos filtros"
                subtitulo="Prueba ajustando la búsqueda, el precio o la categoría seleccionada."
                onLimpiar={limpiarTodosLosFiltros}
              />
            )}
          </div>
        )}
      </section>

      {quickViewId && (
        <QuickView idProducto={quickViewId} onClose={() => setQuickViewId(null)} />
      )}

    </div>
  )
}