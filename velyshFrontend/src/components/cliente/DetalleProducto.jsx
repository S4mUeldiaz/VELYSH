import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProductoPorId, getStockPorProducto, agregarFavorito, eliminarFavorito, getFavoritos, getUsuarioActual } from "../../Api/api"
import { getColorHex } from "../../utils/colores"
import { obtenerImagenPrincipal, manejarErrorImagen, PLACEHOLDER_PRODUCTO } from "../../utils/imagenes"
import { FiArrowLeft, FiHeart, FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi"
import "./DetalleProducto.css"

export default function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto,   setProducto]   = useState(null)
  const [stock,      setStock]      = useState([])
  const [colorSelec, setColorSelec] = useState(null)
  const [tallaSelec, setTallaSelec] = useState(null)
  const [cantidad,   setCantidad]   = useState(1)
  const [esFav,      setEsFav]      = useState(false)
  const [cargando,   setCargando]   = useState(true)
  const usuario = getUsuarioActual()

  const coloresUnicos = [...new Set(stock.map(s => s.color))]
  const tallasPorColor = stock.filter(s => s.color === colorSelec)
  const stockSelec = stock.find(s => s.color === colorSelec && s.id_talla === tallaSelec)

  useEffect(() => {
    Promise.all([
      getProductoPorId(id),
      getStockPorProducto(id),
      usuario ? getFavoritos(usuario.numero_documento) : Promise.resolve([])
    ]).then(([prod, st, favs]) => {
      setProducto(prod)
      setStock(st)
      setEsFav(favs.some(f => f.id_producto === Number(id)))
      if (st.length > 0) setColorSelec(st[0].color)
      setCargando(false)
    })
  }, [id])

  useEffect(() => {
    setCantidad(1)
  }, [colorSelec, tallaSelec])

  function cambiarCantidad(delta) {
    if (!stockSelec) return
    setCantidad(prev => {
      const nuevo = prev + delta
      if (nuevo < 1) return 1
      if (nuevo > stockSelec.stock_actual) return stockSelec.stock_actual
      return nuevo
    })
  }

  async function toggleFav() {
    // RF-03: marcar favoritos requiere cuenta
    if (!usuario) {
      navigate('/login')
      return
    }
    if (esFav) {
      await eliminarFavorito(usuario?.numero_documento, Number(id))
      setEsFav(false)
    } else {
      await agregarFavorito(usuario?.numero_documento, Number(id))
      setEsFav(true)
    }
  }

  function agregarAlCarrito() {
    if (!colorSelec || !tallaSelec) return
    if (!stockSelec) {
      console.warn('No se encontró stock para', { colorSelec, tallaSelec, stock })
      return
    }
    if (cantidad < 1 || cantidad > stockSelec.stock_actual) return

    const carrito = JSON.parse(sessionStorage.getItem('carrito') || '[]')
    const existe = carrito.find(i => i.id_stock === stockSelec.id_stock)
    if (existe) {
      const total = existe.cantidad + cantidad
      existe.cantidad = total > stockSelec.stock_actual ? stockSelec.stock_actual : total
    } else {
      carrito.push({
        id_stock: stockSelec.id_stock,
        id_producto: Number(id),
        nombre: producto.nombre,
        precio: producto.precio,
        color: colorSelec,
        talla: stockSelec.tallas?.talla,
        cantidad,
        imagen: obtenerImagenPrincipal(producto)
      })
    }
    sessionStorage.setItem('carrito', JSON.stringify(carrito))
    navigate('/carrito')
  }

  if (cargando) return <div className="detalle-loading">Cargando...</div>
  if (!producto) return <div className="detalle-loading">Producto no encontrado</div>

  return (
    <div className="detalle-wrapper">
      {/* IMAGEN */}
      <div className="detalle-img-section">
        <img
          src={obtenerImagenPrincipal(producto)}
          alt={producto.nombre}
          className="detalle-img"
          onError={manejarErrorImagen}
        />
      </div>

      {/* INFO */}
      <div className="detalle-info">
        <button className="favoritos-back" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>

        <h1 className="detalle-nombre">{producto.nombre}</h1>
        <p className="detalle-precio">${Number(producto.precio).toLocaleString()}</p>
        <hr className="detalle-divider" />

        {/* COLORES */}
        <div className="detalle-section">
          <p className="detalle-label">Color</p>
          <div className="detalle-colores">
            {coloresUnicos.map(color => (
              <button
                key={color}
                className={`detalle-color-btn ${colorSelec === color ? 'active' : ''}`}
                style={{ background: getColorHex(color) }}
                onClick={() => { setColorSelec(color); setTallaSelec(null) }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* TALLAS */}
        <div className="detalle-section">
          <p className="detalle-label">Tallas</p>
          <select
            className="detalle-select"
            value={tallaSelec ?? ""}
            onChange={e => setTallaSelec(Number(e.target.value))}
          >
            <option value="">Selecciona</option>
            {tallasPorColor.map(s => (
              <option key={s.id_stock} value={s.id_talla} disabled={s.stock_actual === 0}>
                {s.tallas?.talla} {s.stock_actual === 0 ? '(Agotado)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* CANTIDAD */}
        {stockSelec && (
          <div className="detalle-section">
            <p className="detalle-label">Cantidad</p>
            <div className="detalle-cantidad">
              <button
                type="button"
                className="detalle-cantidad-btn"
                onClick={() => cambiarCantidad(-1)}
                disabled={cantidad <= 1}
              >
                <FiMinus />
              </button>
              <span className="detalle-cantidad-valor">{cantidad}</span>
              <button
                type="button"
                className="detalle-cantidad-btn"
                onClick={() => cambiarCantidad(1)}
                disabled={cantidad >= stockSelec.stock_actual}
              >
                <FiPlus />
              </button>
            </div>
          </div>
        )}

        {/* STOCK */}
        {stockSelec && (
          <p className="detalle-stock">Stock: {stockSelec.stock_actual} disponibles</p>
        )}

        {/* BOTONES */}
        <div className="detalle-btns">
          <button
            className={`detalle-fav-btn ${esFav ? 'active' : ''}`}
            onClick={toggleFav}
          >
            <FiHeart />
          </button>
          <button
            className="detalle-carrito-btn"
            onClick={agregarAlCarrito}
            disabled={!colorSelec || !tallaSelec}
          >
            <FiShoppingCart /> Añadir al carrito
          </button>
        </div>

        <p className="detalle-descripcion">{producto.descripcion}</p>
      </div>
    </div>
  )
}