import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getFavoritos, eliminarFavorito, getUsuarioActual, getProductos } from "../../Api/api"
import { FiArrowLeft, FiHeart, FiShoppingCart } from "react-icons/fi"
import "./Favoritos.css"

const MAX_RECOMENDACIONES = 4

function obtenerImagenPrincipal(producto) {
  const imagenes = producto?.imagenes_producto
  if (!imagenes || imagenes.length === 0) return '/zapato.png'

  const principal = [...imagenes].sort((a, b) => a.orden - b.orden)[0]
  return principal?.url_imagen || '/zapato.png'
}

export default function Favoritos() {
  const [favoritos,      setFavoritos]      = useState([])
  const [recomendaciones, setRecomendaciones] = useState([])
  const [cargando,       setCargando]       = useState(true)
  const usuario  = getUsuarioActual()
  const navigate = useNavigate()

  useEffect(() => {
    getFavoritos(usuario?.numero_documento)
      .then(data => {
        setFavoritos(data)
        setCargando(false)
        cargarRecomendaciones(data)
      })
  }, [])

  // "También te puede interesar": rellena la página cuando hay pocos
  // favoritos y, de paso, sugiere más productos al usuario.
  async function cargarRecomendaciones(favoritosActuales) {
    try {
      const productos = await getProductos()
      const idsFavoritos = new Set(
        favoritosActuales.map(f => f.productos?.id_producto).filter(Boolean)
      )
      const sugeridos = productos
        .filter(p => !idsFavoritos.has(p.id_producto))
        .sort(() => Math.random() - 0.5)
        .slice(0, MAX_RECOMENDACIONES)

      setRecomendaciones(sugeridos)
    } catch (err) {
      console.warn('No se pudieron cargar recomendaciones', err)
    }
  }

  async function handleEliminar(id_producto) {
    if (!id_producto) {
      console.error("handleEliminar: id_producto es undefined, revisa el shape de favoritos")
      return
    }
    await eliminarFavorito(usuario?.numero_documento, id_producto)
    setFavoritos(prev => prev.filter(f => f.productos?.id_producto !== id_producto))
  }

  return (
    <div className="favoritos-wrapper">
      <div className="favoritos-content">

        {/* HEADER */}
        <div className="favoritos-header">
          <button className="favoritos-back" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Volver
          </button>
          <h1 className="favoritos-title">Mis favoritos</h1>
          <span className="favoritos-count">{favoritos.length} productos</span>
        </div>

        {/* CONTENIDO */}
        {cargando ? (
          <div className="favoritos-loading">Cargando favoritos...</div>
        ) : favoritos.length === 0 ? (
          <div className="favoritos-empty">
            <FiHeart className="favoritos-empty-icon" />
            <p>No tienes favoritos aún</p>
            <button className="favoritos-btn-catalogo" onClick={() => navigate('/catalogo')}>
              Ver catálogo
            </button>
          </div>
        ) : (
          <div className="favoritos-grid">
            {favoritos.map(f => {
              const id_producto = f.productos?.id_producto
              return (
                <div key={f.id_favorito} className="favoritos-card">
                  <div className="favoritos-card-img">
                    <img src={obtenerImagenPrincipal(f.productos)} alt={f.productos?.nombre} />
                    <button
                      className="favoritos-card-heart active"
                      onClick={() => handleEliminar(id_producto)}
                    >
                      <FiHeart />
                    </button>
                  </div>
                  <div className="favoritos-card-info">
                    <p className="favoritos-card-cat">{f.productos?.categorias?.nombre_categoria ?? ''}</p>
                    <h3 className="favoritos-card-nombre">{f.productos?.nombre}</h3>
                    <p className="favoritos-card-precio">${Number(f.productos?.precio).toLocaleString()}</p>
                    <div className="favoritos-card-btns">
                      <button
                        className="favoritos-btn-carrito"
                        onClick={() => navigate(`/producto/${id_producto}`)}
                      >
                        <FiShoppingCart /> Ver producto
                      </button>
                      <button
                        className="favoritos-btn-eliminar"
                        onClick={() => handleEliminar(id_producto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* RECOMENDACIONES — solo si hay algo que recomendar */}
        {!cargando && recomendaciones.length > 0 && (
          <div className="favoritos-recomendaciones">
            <h2 className="favoritos-recomendaciones-titulo">También te puede interesar</h2>
            <div className="favoritos-grid">
              {recomendaciones.map(p => (
                <div key={p.id_producto} className="favoritos-card">
                  <div className="favoritos-card-img">
                    <img src={obtenerImagenPrincipal(p)} alt={p.nombre} />
                  </div>
                  <div className="favoritos-card-info">
                    <p className="favoritos-card-cat">{p.categorias?.nombre_categoria ?? ''}</p>
                    <h3 className="favoritos-card-nombre">{p.nombre}</h3>
                    <p className="favoritos-card-precio">${Number(p.precio).toLocaleString()}</p>
                    <div className="favoritos-card-btns">
                      <button
                        className="favoritos-btn-carrito"
                        onClick={() => navigate(`/producto/${p.id_producto}`)}
                      >
                        <FiShoppingCart /> Ver producto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}