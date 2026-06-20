import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getProductos, getUsuarioActual, crearPedido, actualizarEstadoPedido } from "../../Api/api"
import { FiArrowLeft, FiTrash2, FiHeart } from "react-icons/fi"
import "./Carrito.css"

export default function Carrito() {
  const [items,    setItems]    = useState([])
  const [form,     setForm]     = useState({ direccion: "", ciudad: "Bogotá", departamento: "Cundinamarca", codigo_postal: "", metodo_pago: "tarjeta" })
  const [paso,     setPaso]     = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState("")
  const navigate = useNavigate()
  const usuario  = getUsuarioActual()

  useEffect(() => {
    const carrito = JSON.parse(sessionStorage.getItem('carrito') || '[]')
    setItems(carrito)
  }, [])

  function actualizarCantidad(id_stock, cantidad) {
    const nuevo = items.map(i => i.id_stock === id_stock ? { ...i, cantidad: Math.max(1, cantidad) } : i)
    setItems(nuevo)
    sessionStorage.setItem('carrito', JSON.stringify(nuevo))
  }

  function eliminarItem(id_stock) {
    const nuevo = items.filter(i => i.id_stock !== id_stock)
    setItems(nuevo)
    sessionStorage.setItem('carrito', JSON.stringify(nuevo))
  }

  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

  function irAPagar() {
    // RF-03: cualquiera puede armar el carrito, pero para pasar al
    // formulario de pago se exige tener sesión iniciada.
    if (!usuario) {
      setError("Debes iniciar sesión o registrarte para finalizar tu compra")
      return
    }
    setError("")
    setPaso(2)
  }

  async function handlePagar(e) {
    e.preventDefault()

    if (!usuario) {
      setError("Debes iniciar sesión o registrarte para finalizar tu compra")
      return
    }

    if (!form.direccion) { setError("Ingresa una dirección"); return }
    setCargando(true)
    setError("")
    try {
      const pedidosCreados = []
      for (const item of items) {
        const respuesta = await crearPedido({
          id_stock:        item.id_stock,
          cantidad:        item.cantidad,
          precio_unitario: item.precio,
          metodo_pago:     form.metodo_pago,
          direccion:       form.direccion,
          ciudad:          form.ciudad,
          departamento:    form.departamento,
          codigo_postal:   form.codigo_postal
        })
        pedidosCreados.push(respuesta.data)
      }

      // RF-11 (versión simulada, sin pasarela real): se marca el pago como
      // exitoso de inmediato y se genera el comprobante. Documentado en el
      // Excel como simulación, no como integración real con PSE/tarjeta.
      for (const pedido of pedidosCreados) {
        await actualizarEstadoPedido(pedido.id_pedido, { estado_pago: 'pagado' })
      }

      sessionStorage.removeItem('carrito')
      navigate('/comprobante', {
        state: {
          pedidos: pedidosCreados,
          items,
          metodoPago: form.metodo_pago,
          direccionTexto: `${form.direccion}, ${form.ciudad}, ${form.departamento}`,
          total: subtotal
        }
      })
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="carrito-wrapper">

      {/* IZQUIERDA */}
      <div className="carrito-left">
        <div className="carrito-header">
          <button className="favoritos-back" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <h1 className="carrito-title">TUS SELECCIONES</h1>
        </div>

        {items.length === 0 ? (
          <div className="carrito-empty">
            <p>Tu carrito está vacío</p>
            <button className="favoritos-btn-catalogo" onClick={() => navigate('/catalogo')}>
              Ver catálogo
            </button>
          </div>
        ) : (
          <div className="carrito-items">
            {items.map(item => (
              <div key={item.id_stock} className="carrito-item">
                <div className="carrito-item-img">
                  <img src={item.imagen ?? '/zapato.png'} alt={item.nombre} />
                </div>
                <div className="carrito-item-info">
                  <div className="carrito-item-top">
                    <p className="carrito-item-nombre">{item.nombre}</p>
                    <p className="carrito-item-precio">${Number(item.precio).toLocaleString()}</p>
                    <button className="carrito-btn-eliminar" onClick={() => eliminarItem(item.id_stock)}>
                      <FiTrash2 />
                    </button>
                  </div>
                  <p className="carrito-item-detalle">Color: {item.color}</p>
                  <p className="carrito-item-detalle">Talla: {item.talla}</p>
                  <div className="carrito-item-bottom">
                    <input
                      className="carrito-cantidad"
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={e => actualizarCantidad(item.id_stock, Number(e.target.value))}
                    />
                    <button className="carrito-btn-fav">
                      <FiHeart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DERECHA */}
      <div className="carrito-right">

        {/* RESUMEN */}
        <div className="carrito-resumen">
          <h3 className="carrito-resumen-title">Resumen del pedido</h3>
          <div className="carrito-resumen-row">
            <span>{items.length} producto(s)</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="carrito-resumen-row">
            <span>Entrega</span>
            <span className="carrito-gratis">Gratis</span>
          </div>
          <div className="carrito-resumen-row carrito-total">
            <span>Total</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>

          {/* RF-03: invitado ve el aviso antes de poder continuar */}
          {!usuario && items.length > 0 && (
            <p className="carrito-aviso-invitado">
              Estás navegando como invitado.{" "}
              <Link to="/login">Inicia sesión</Link> o{" "}
              <Link to="/register">regístrate</Link> para finalizar tu compra.
            </p>
          )}

          {paso === 1 ? (
            <button
              className="carrito-btn-pagar"
              onClick={irAPagar}
              disabled={items.length === 0}
            >
              Ir a pagar →
            </button>
          ) : (
            <form onSubmit={handlePagar} className="carrito-form">
              <input className="carrito-input" placeholder="Dirección" value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))} />
              <input className="carrito-input" placeholder="Ciudad" value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))} />
              <input className="carrito-input" placeholder="Departamento" value={form.departamento} onChange={e => setForm(p => ({ ...p, departamento: e.target.value }))} />
              <input className="carrito-input" placeholder="Código postal" value={form.codigo_postal} onChange={e => setForm(p => ({ ...p, codigo_postal: e.target.value }))} />
              <select className="carrito-input" value={form.metodo_pago} onChange={e => setForm(p => ({ ...p, metodo_pago: e.target.value }))}>
                <option value="tarjeta">Tarjeta</option>
                <option value="pse">PSE</option>
                <option value="transferencia">Transferencia</option>
                <option value="contraentrega">Contraentrega</option>
              </select>
              {error && <p className="admin-error">{error}</p>}
              <button className="carrito-btn-pagar" type="submit" disabled={cargando}>
                {cargando ? "Procesando..." : "Confirmar pedido"}
              </button>
              <button className="admin-btn-cancelar" type="button" onClick={() => setPaso(1)}>
                Volver
              </button>
            </form>
          )}

          {paso === 1 && error && <p className="admin-error">{error}</p>}
        </div>

        {/* FORMAS DE PAGO */}
        <div className="carrito-pagos">
          <p className="carrito-pagos-title">Formas de pago aceptadas</p>
          <div className="carrito-pagos-iconos">
            <span className="carrito-pago-icon">💳</span>
            <span className="carrito-pago-icon">🏦</span>
            <span className="carrito-pago-icon">PSE</span>
          </div>
        </div>

      </div>
    </div>
  )
}