import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getFavoritos, eliminarFavorito, getUsuarioActual } from "../../Api/api"
import { FiArrowLeft, FiHeart, FiShoppingCart } from "react-icons/fi"
import "./Favoritos.css"

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const usuario  = getUsuarioActual()
  const navigate = useNavigate()

  useEffect(() => {
    getFavoritos(usuario?.numero_documento)
      .then(data => {
        setFavoritos(data)
        setCargando(false)
      })
  }, [])

  async function handleEliminar(id_producto) {
    await eliminarFavorito(usuario?.numero_documento, id_producto)
    setFavoritos(prev => prev.filter(f => f.id_producto !== id_producto))
  }

  return (
    <div className="favoritos-wrapper">

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
          {favoritos.map(f => (
            <div key={f.id_favorito} className="favoritos-card">
              <div className="favoritos-card-img">
                <img src="/zapato.png" alt={f.productos?.nombre} />
                <button
                  className="favoritos-card-heart active"
                  onClick={() => handleEliminar(f.id_producto)}
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
                    onClick={() => navigate(`/producto/${f.id_producto}`)}
                  >
                    <FiShoppingCart /> Ver producto
                  </button>
                  <button
                    className="favoritos-btn-eliminar"
                    onClick={() => handleEliminar(f.id_producto)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}