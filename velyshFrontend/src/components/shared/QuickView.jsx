import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getProductoPorId, getStockPorProducto } from "../../Api/api"
import { getColorHex } from "../../utils/colores"
import { obtenerImagenPrincipal, manejarErrorImagen } from "../../utils/imagenes"
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiAlertTriangle } from "react-icons/fi"
import "./QuickView.css"

export default function QuickView({ idProducto, onClose }) {
  const navigate = useNavigate()
  const [producto,   setProducto]   = useState(null)
  const [stock,      setStock]      = useState([])
  const [colorSelec, setColorSelec] = useState(null)
  const [tallaSelec, setTallaSelec] = useState(null)
  const [cantidad,   setCantidad]   = useState(1)
  const [cargando,   setCargando]   = useState(true)

  useEffect(() => {
    if (!idProducto) return
    setCargando(true)
    Promise.all([
      getProductoPorId(idProducto),
      getStockPorProducto(idProducto)
    ]).then(([prod, st]) => {
      setProducto(prod)
      setStock(st)
      setColorSelec(st.length > 0 ? st[0].color : null)
      setTallaSelec(null)
      setCantidad(1)
      setCargando(false)
    })
  }, [idProducto])

  // Bloquea el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Cierra con tecla Escape
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const coloresUnicos = [...new Set(stock.map(s => s.color))]
  const tallasPorColor = stock.filter(s => s.color === colorSelec)
  const stockSelec = stock.find(s => s.color === colorSelec && s.id_talla === tallaSelec)

  const stockBajo = stockSelec
    ? stockSelec.stock_actual > 0 && stockSelec.stock_actual <= stockSelec.stock_minimo
    : false

  function cambiarCantidad(delta) {
    if (!stockSelec) return
    setCantidad(prev => {
      const nuevo = prev + delta
      if (nuevo < 1) return 1
      if (nuevo > stockSelec.stock_actual) return stockSelec.stock_actual
      return nuevo
    })
  }

  function agregarAlCarrito() {
    if (!colorSelec || !tallaSelec || !stockSelec) return
    if (cantidad < 1 || cantidad > stockSelec.stock_actual) return

    const carrito = JSON.parse(sessionStorage.getItem('carrito') || '[]')
    const existe = carrito.find(i => i.id_stock === stockSelec.id_stock)
    if (existe) {
      const total = existe.cantidad + cantidad
      existe.cantidad = total > stockSelec.stock_actual ? stockSelec.stock_actual : total
    } else {
      carrito.push({
        id_stock: stockSelec.id_stock,
        id_producto: idProducto,
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
    onClose()
  }

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-panel" onClick={e => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose} aria-label="Cerrar">
          <FiX />
        </button>

        {cargando || !producto ? (
          <div className="quickview-loading">Cargando...</div>
        ) : (
          <div className="quickview-body">
            <div className="quickview-img">
              <img
                src={obtenerImagenPrincipal(producto)}
                alt={producto.nombre}
                onError={manejarErrorImagen}
              />
            </div>

            <div className="quickview-info">
              <p className="quickview-categoria">{producto.categorias?.nombre_categoria ?? ''}</p>
              <h2 className="quickview-nombre">{producto.nombre}</h2>
              <p className="quickview-precio">${Number(producto.precio).toLocaleString()}</p>

              <div className="quickview-section">
                <p className="quickview-label">Color</p>
                <div className="quickview-colores">
                  {coloresUnicos.map(color => (
                    <button
                      key={color}
                      className={`quickview-color-btn ${colorSelec === color ? 'active' : ''}`}
                      style={{ background: getColorHex(color) }}
                      onClick={() => { setColorSelec(color); setTallaSelec(null) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="quickview-section">
                <p className="quickview-label">Talla</p>
                <select
                  className="quickview-select"
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

              {stockSelec && (
                <div className="quickview-section">
                  <p className="quickview-label">Cantidad</p>
                  <div className="quickview-cantidad">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(-1)}
                      disabled={cantidad <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span>{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(1)}
                      disabled={cantidad >= stockSelec.stock_actual}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              )}

              {stockSelec && (
                stockBajo ? (
                  <p className="quickview-stock quickview-stock-bajo">
                    <FiAlertTriangle /> ¡Solo quedan {stockSelec.stock_actual} unidades!
                  </p>
                ) : (
                  <p className="quickview-stock">Stock: {stockSelec.stock_actual} disponibles</p>
                )
              )}

              <button
                className="quickview-btn-carrito"
                onClick={agregarAlCarrito}
                disabled={!colorSelec || !tallaSelec}
              >
                <FiShoppingCart /> Añadir al carrito
              </button>

              <button
                className="quickview-btn-detalle"
                onClick={() => { onClose(); navigate(`/producto/${idProducto}`) }}
              >
                Ver detalle completo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}