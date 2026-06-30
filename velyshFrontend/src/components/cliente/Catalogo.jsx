import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getProductos, getCategorias, getFavoritos, getStock, agregarFavorito, eliminarFavorito, getUsuarioActual } from "../../Api/api";
import { getColorHex } from "../../utils/colores";
import { obtenerImagenPrincipal, manejarErrorImagen } from "../../utils/imagenes";
import { useScrollReveal } from "../../utils/useScrollReveal";
import QuickView from "../shared/QuickView";
import Breadcrumbs from "../shared/Breadcrumbs";
import EstadoVacio from "../shared/EstadoVacio";
import { FiHeart, FiShoppingBag, FiFilter, FiX, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./Catalogo.css";

const SKELETON_COUNT = 8;


export default function Catalogo() {
  const [productos,        setProductos]        = useState([]);
  const [categorias,       setCategorias]       = useState([]);
  const [favoritos,        setFavoritos]        = useState([]);
  const [stock,             setStock]            = useState([]);
  const [categoriaActiva,  setCategoriaActiva]  = useState(null);
  const [generoActivo,     setGeneroActivo]     = useState(null);
  const [ordenPrecio,      setOrdenPrecio]      = useState("");
  const [cargando,         setCargando]         = useState(true);
  const [filtrosAbiertos,  setFiltrosAbiertos]  = useState(false);
  const [coloresSelec, setColoresSelec] = useState([]);
  const [tallasSelec,  setTallasSelec]  = useState([]);
  const [precioMin,    setPrecioMin]    = useState(0);
  const [precioMax,    setPrecioMax]    = useState(0);
  const [quickViewId,  setQuickViewId]  = useState(null);

  const usuario = getUsuarioActual();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    })
  }, [])

  useEffect(() => {
    const paramCategoria = searchParams.get('categoria')
    if (!paramCategoria || categorias.length === 0) return

    const esNumerico = !isNaN(Number(paramCategoria))
    const encontrada = esNumerico
      ? categorias.find(c => c.id_categoria === Number(paramCategoria))
      : categorias.find(c => c.nombre_categoria.toLowerCase() === paramCategoria.toLowerCase())

    if (encontrada) setCategoriaActiva(encontrada.id_categoria)
  }, [searchParams, categorias])

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
    setCategoriaActiva(null)
    setGeneroActivo(null)
  }

  const hayFiltrosActivos = coloresSelec.length > 0 || tallasSelec.length > 0 ||
    precioMin > precioMinAbsoluto || precioMax < precioMaxAbsoluto

  let productosFiltrados = productos.filter(p => {
    if (categoriaActiva && p.id_categoria !== categoriaActiva) return false

    if (generoActivo && p.genero !== generoActivo && p.genero !== 'unisex') return false

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

  if (ordenPrecio === "asc")  productosFiltrados = [...productosFiltrados].sort((a, b) => a.precio - b.precio)
  if (ordenPrecio === "desc") productosFiltrados = [...productosFiltrados].sort((a, b) => b.precio - a.precio)

  const categoriaActivaObj = categorias.find(c => c.id_categoria === categoriaActiva)
  const breadcrumbItems = [
    { label: "Home", to: "/home" },
    categoriaActivaObj
      ? { label: "Catálogo", to: "/catalogo" }
      : { label: "Catálogo" },
    ...(categoriaActivaObj ? [{ label: categoriaActivaObj.nombre_categoria }] : [])
  ]

  const gridRef = useScrollReveal([productosFiltrados.length, cargando])

  return (
    <div className="catalogo-wrapper">

      <Breadcrumbs items={breadcrumbItems} />

      {/* HEADER */}
      <div className="catalogo-header">
        <h1 className="catalogo-title">Catálogo</h1>
        <p className="catalogo-sub">{productosFiltrados.length} productos encontrados</p>
      </div>

      {/* FILTROS */}
      <div className="catalogo-filtros">
        <div className="catalogo-categorias catalogo-genero-filtro">
          <button
            className={`catalogo-cat-btn ${generoActivo === null ? 'active' : ''}`}
            onClick={() => setGeneroActivo(null)}
          >
            Todos los géneros
          </button>
          <button
            className={`catalogo-cat-btn ${generoActivo === 'hombre' ? 'active' : ''}`}
            onClick={() => setGeneroActivo('hombre')}
          >
            Hombre
          </button>
          <button
            className={`catalogo-cat-btn ${generoActivo === 'mujer' ? 'active' : ''}`}
            onClick={() => setGeneroActivo('mujer')}
          >
            Mujer
          </button>
        </div>

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

        <div className="catalogo-filtros-derecha">
          <button
            className={`catalogo-btn-filtros ${hayFiltrosActivos ? 'activo' : ''}`}
            onClick={() => setFiltrosAbiertos(true)}
          >
            <FiFilter /> Filtros {hayFiltrosActivos && <span className="catalogo-filtros-dot" />}
          </button>

          <div className="catalogo-orden">
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
      </div>

      {/* PANEL DE FILTRO AVANZADO (RF-18) */}
      {filtrosAbiertos && (
        <div className="catalogo-filtros-overlay" onClick={() => setFiltrosAbiertos(false)}>
          <div className="catalogo-filtros-panel" onClick={e => e.stopPropagation()}>
            <div className="catalogo-filtros-panel-header">
              <h3>Filtros</h3>
              <button onClick={() => setFiltrosAbiertos(false)}><FiX /></button>
            </div>

            <div className="catalogo-filtro-grupo">
              <p className="catalogo-filtro-label">Color</p>
              <div className="catalogo-filtro-colores">
                {coloresDisponibles.map(color => (
                  <button
                    key={color}
                    className={`catalogo-filtro-color-btn ${coloresSelec.includes(color) ? 'activo' : ''}`}
                    style={{ background: getColorHex(color) }}
                    onClick={() => toggleColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="catalogo-filtro-grupo">
              <p className="catalogo-filtro-label">Talla</p>
              <div className="catalogo-filtro-tallas">
                {tallasDisponibles.map(talla => (
                  <button
                    key={talla}
                    className={`catalogo-filtro-talla-btn ${tallasSelec.includes(talla) ? 'activo' : ''}`}
                    onClick={() => toggleTalla(talla)}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>

            <div className="catalogo-filtro-grupo">
              <p className="catalogo-filtro-label">Rango de precios</p>
              <div className="catalogo-filtro-precios-inputs">
                <input
                  type="number"
                  className="catalogo-filtro-precio-input"
                  value={precioMin}
                  min={precioMinAbsoluto}
                  max={precioMax}
                  onChange={e => setPrecioMin(Math.min(Number(e.target.value), precioMax))}
                />
                <span>—</span>
                <input
                  type="number"
                  className="catalogo-filtro-precio-input"
                  value={precioMax}
                  min={precioMin}
                  max={precioMaxAbsoluto}
                  onChange={e => setPrecioMax(Math.max(Number(e.target.value), precioMin))}
                />
              </div>
              <div className="catalogo-filtro-slider-wrapper">
                <input
                  type="range"
                  className="catalogo-filtro-slider catalogo-filtro-slider-min"
                  min={precioMinAbsoluto}
                  max={precioMaxAbsoluto}
                  value={precioMin}
                  onChange={e => setPrecioMin(Math.min(Number(e.target.value), precioMax))}
                />
                <input
                  type="range"
                  className="catalogo-filtro-slider catalogo-filtro-slider-max"
                  min={precioMinAbsoluto}
                  max={precioMaxAbsoluto}
                  value={precioMax}
                  onChange={e => setPrecioMax(Math.max(Number(e.target.value), precioMin))}
                />
              </div>
              <div className="catalogo-filtro-precio-labels">
                <span>${precioMinAbsoluto.toLocaleString()}</span>
                <span>${precioMaxAbsoluto.toLocaleString()}</span>
              </div>
            </div>

            <div className="catalogo-filtro-acciones">
              <button className="catalogo-filtro-limpiar" onClick={limpiarFiltros}>Limpiar filtros</button>
              <button className="catalogo-filtro-aplicar" onClick={() => setFiltrosAbiertos(false)}>
                Ver {productosFiltrados.length} resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      {cargando ? (
        <div className="catalogo-grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="catalogo-skeleton-card">
              <div className="catalogo-skeleton-img" />
              <div className="catalogo-skeleton-info">
                <div className="catalogo-skeleton-line catalogo-skeleton-line-sm" />
                <div className="catalogo-skeleton-line catalogo-skeleton-line-lg" />
                <div className="catalogo-skeleton-line catalogo-skeleton-line-md" />
                <div className="catalogo-skeleton-footer">
                  <div className="catalogo-skeleton-line catalogo-skeleton-line-price" />
                  <div className="catalogo-skeleton-btn" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="catalogo-grid" ref={gridRef}>
          {productosFiltrados.map(p => {
            const esFavorito = favoritos.includes(p.id_producto)
            return (
              <div key={p.id_producto} className="catalogo-card">
                <div className="catalogo-card-img">
                  <img src={obtenerImagenPrincipal(p)} alt={p.nombre} loading="lazy" onError={manejarErrorImagen} />
                  <button
                    className="catalogo-quickview-btn"
                    onClick={() => setQuickViewId(p.id_producto)}
                    aria-label="Vista rápida"
                  >
                    <FiEye />
                  </button>
                  <button
                    className={`catalogo-fav ${esFavorito ? 'active' : ''}`}
                    onClick={() => toggleFavorito(p.id_producto)}
                    aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    {esFavorito
                      ? <FaHeart key="filled" />
                      : <FiHeart key="outline" />}
                  </button>
                </div>
                <div className="catalogo-card-info">
                  <p className="catalogo-card-cat">{p.categorias?.nombre_categoria}</p>
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
            )
          })}
          {productosFiltrados.length === 0 && (
            <EstadoVacio
              titulo="No encontramos productos con estos filtros"
              subtitulo="Prueba ajustando el precio, el color o la categoría seleccionada."
              onLimpiar={limpiarTodosLosFiltros}
            />
          )}
        </div>
      )}

      {quickViewId && (
        <QuickView idProducto={quickViewId} onClose={() => setQuickViewId(null)} />
      )}
    </div>
  )
}