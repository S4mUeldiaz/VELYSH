import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getProductoPorId, getProductos, getStockPorProducto, agregarFavorito, eliminarFavorito, getFavoritos, getUsuarioActual } from "../../Api/api"
import { getColorHex } from "../../utils/colores"
import { obtenerImagenPrincipal, manejarErrorImagen } from "../../utils/imagenes"
import Breadcrumbs from "../shared/Breadcrumbs"
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiAlertTriangle, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import BackButton from "../shared/BackButton"
import "./DetalleProducto.css"

export default function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto,    setProducto]    = useState(null)
  const [stock,       setStock]       = useState([])
  const [colorSelec,  setColorSelec]  = useState(null)
  const [tallaSelec,  setTallaSelec]  = useState(null)
  const [cantidad,    setCantidad]    = useState(1)
  const [imagenIndex, setImagenIndex] = useState(0)
  const [esFav,       setEsFav]       = useState(false)
  const [cargando,    setCargando]    = useState(true)
  const [recomendados, setRecomendados] = useState([])
  const usuario = getUsuarioActual()

  const coloresUnicos = [...new Set(stock.map(s => s.color))]
  const tallasPorColor = stock.filter(s => s.color === colorSelec)
  const stockSelec = stock.find(s => s.color === colorSelec && s.id_talla === tallaSelec)
  const stockBajo = stockSelec
    ? stockSelec.stock_actual > 0 && stockSelec.stock_actual <= stockSelec.stock_minimo
    : false

  // Galería filtrada por color: si el color elegido tiene fotos propias se
  // muestran esas; si no, se cae a las fotos genéricas del producto
  // (imagenes_producto con color === ""). Misma lógica que ya usa AppMovil
  // en DetalleProductoScreen — antes esta pantalla siempre mostraba la
  // primera imagen del producto sin importar el color seleccionado.
  const imagenesGenericas = (producto?.imagenes_producto ?? []).filter(img => img.color === '')
  const imagenesDelColor = colorSelec
    ? (producto?.imagenes_producto ?? []).filter(img => img.color === colorSelec)
    : []
  const imagenes = [...(imagenesDelColor.length > 0 ? imagenesDelColor : imagenesGenericas)]
    .sort((a, b) => a.orden - b.orden)
  const imagenIndexSeguro = imagenes.length > 0 ? Math.min(imagenIndex, imagenes.length - 1) : 0
  const imagenActual = imagenes[imagenIndexSeguro]?.url_imagen ?? obtenerImagenPrincipal(producto)

  useEffect(() => {
    Promise.all([
      getProductoPorId(id),
      getStockPorProducto(id),
      getProductos(),
      usuario ? getFavoritos(usuario.numero_documento) : Promise.resolve([])
    ]).then(([prod, st, todos, favs]) => {
      setProducto(prod)
      setStock(st)
      setEsFav(favs.some(f => f.id_producto === Number(id)))
      if (st.length > 0) setColorSelec(st[0].color)
      // Recomendados: mismos criterios que AppMovil (DetalleProductoScreen) —
      // misma categoría, excluyendo el producto actual, tope 4.
      setRecomendados(
        todos
          .filter(p => p.id_categoria === prod.id_categoria && p.id_producto !== prod.id_producto)
          .slice(0, 4)
      )
      setCargando(false)
    })
  }, [id])

  useEffect(() => {
    setCantidad(1)
  }, [colorSelec, tallaSelec])

  useEffect(() => {
    setImagenIndex(0)
  }, [colorSelec])

  function cambiarCantidad(delta) {
    if (!stockSelec) return
    setCantidad(prev => {
      const nuevo = prev + delta
      if (nuevo < 1) return 1
      if (nuevo > stockSelec.stock_actual) return stockSelec.stock_actual
      return nuevo
    })
  }

  function imagenAnterior() {
    if (imagenes.length < 2) return
    setImagenIndex(prev => (prev - 1 + imagenes.length) % imagenes.length)
  }

  function imagenSiguiente() {
    if (imagenes.length < 2) return
    setImagenIndex(prev => (prev + 1) % imagenes.length)
  }

  async function toggleFav() {
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
        // Foto que el usuario efectivamente estaba viendo (ya filtrada por
        // color), no siempre la primera imagen del producto.
        imagen: imagenActual
      })
    }
    sessionStorage.setItem('carrito', JSON.stringify(carrito))
    navigate('/carrito')
  }

  if (cargando) return <div className="detalle-loading">Cargando...</div>
  if (!producto) return <div className="detalle-loading">Producto no encontrado</div>

  const breadcrumbItems = [
    { label: "Home", to: "/home" },
    { label: "Catálogo", to: "/catalogo" },
    ...(producto.categorias?.nombre_categoria
      ? [{ label: producto.categorias.nombre_categoria, to: `/catalogo?categoria=${producto.id_categoria}` }]
      : []),
    { label: producto.nombre }
  ]

  return (
    <>
      <div className="detalle-breadcrumbs-wrap">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div className="detalle-wrapper">
      {/* IMAGEN */}
      <div className="detalle-img-section">
        <div className="detalle-img-principal">
          <img
            src={imagenActual}
            alt={producto.nombre}
            className="detalle-img"
            onError={manejarErrorImagen}
          />

          {imagenes.length > 1 && (
            <>
              <button
                type="button"
                className="detalle-galeria-flecha detalle-galeria-flecha--prev"
                onClick={imagenAnterior}
                aria-label="Foto anterior"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="detalle-galeria-flecha detalle-galeria-flecha--next"
                onClick={imagenSiguiente}
                aria-label="Foto siguiente"
              >
                <FiChevronRight />
              </button>
            </>
          )}
        </div>

        {imagenes.length > 1 && (
          <div className="detalle-thumbs">
            {imagenes.map((img, i) => (
              <button
                key={img.url_imagen}
                type="button"
                className={`detalle-thumb ${i === imagenIndexSeguro ? 'active' : ''}`}
                onClick={() => setImagenIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
              >
                <img src={img.url_imagen} alt="" onError={manejarErrorImagen} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="detalle-info">
        <BackButton />

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
          stockBajo ? (
            <p className="detalle-stock detalle-stock-bajo">
              <FiAlertTriangle /> ¡Solo quedan {stockSelec.stock_actual} unidades!
            </p>
          ) : (
            <p className="detalle-stock">Stock: {stockSelec.stock_actual} disponibles</p>
          )
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

      {/* RECOMENDADOS — misma categoría, excluyendo el actual. Mismo criterio
          que AppMovil (DetalleProductoScreen). */}
      {recomendados.length > 0 && (
        <section className="detalle-recomendados">
          <h2 className="detalle-recomendados-titulo">También te puede interesar</h2>
          <div className="detalle-recomendados-grid">
            {recomendados.map(p => (
              <Link key={p.id_producto} to={`/producto/${p.id_producto}`} className="detalle-recomendado-card">
                <div className="detalle-recomendado-img">
                  <img src={obtenerImagenPrincipal(p)} alt={p.nombre} loading="lazy" onError={manejarErrorImagen} />
                </div>
                <p className="detalle-recomendado-nombre">{p.nombre}</p>
                <p className="detalle-recomendado-precio">${Number(p.precio).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
