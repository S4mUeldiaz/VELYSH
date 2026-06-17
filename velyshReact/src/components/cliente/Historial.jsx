import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getPedidosPorUsuario, actualizarEstadoPedido, getUsuarioActual } from "../../Api/api"
import { FiArrowLeft, FiPackage } from "react-icons/fi"
import "./Historial.css"

export default function Historial() {
  const [pedidos,  setPedidos]  = useState([])
  const [cargando, setCargando] = useState(true)
  const usuario  = getUsuarioActual()
  const navigate = useNavigate()

  useEffect(() => {
    getPedidosPorUsuario(usuario?.numero_documento)
      .then(data => {
        setPedidos(data)
        setCargando(false)
      })
  }, [])

  async function handleRecibido(id_pedido) {
    await actualizarEstadoPedido(id_pedido, { estado_pedido: 'entregado' })
    setPedidos(prev => prev.map(p =>
      p.id_pedido === id_pedido ? { ...p, estado_pedido: 'entregado' } : p
    ))
  }

  function getEstadoClase(estado) {
    if (estado === 'entregado')  return 'historial-estado-entregado'
    if (estado === 'enviado')    return 'historial-estado-enviado'
    if (estado === 'cancelado')  return 'historial-estado-cancelado'
    return 'historial-estado-pendiente'
  }

  function getEstadoLabel(estado) {
    if (estado === 'pendiente')   return 'PENDIENTE'
    if (estado === 'confirmado')  return 'CONFIRMADO'
    if (estado === 'preparacion') return 'EN PREPARACIÓN'
    if (estado === 'enviado')     return 'ENVIADO'
    if (estado === 'entregado')   return 'ENTREGADO'
    if (estado === 'cancelado')   return 'CANCELADO'
    return estado.toUpperCase()
  }

  return (
    <div className="historial-wrapper">

      {/* HEADER */}
      <div className="historial-header">
        <button className="favoritos-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver
        </button>
        <h1 className="historial-title">Mis pedidos</h1>
      </div>

      {cargando ? (
        <div className="historial-loading">Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="historial-empty">
          <FiPackage className="historial-empty-icon" />
          <p>No tienes pedidos aún</p>
          <button className="favoritos-btn-catalogo" onClick={() => navigate('/catalogo')}>
            Ver catálogo
          </button>
        </div>
      ) : (
        <div className="historial-grid">
          {pedidos.map(p => (
            <div key={p.id_pedido} className="historial-card">
              <div className="historial-card-img">
                <img src="/zapato.png" alt="producto" />
              </div>
              <div className="historial-card-info">
                <p className="historial-card-nombre">
                  {(p.factura ?? p.detalles ?? []).map(d => d.stock?.productos?.nombre ?? d.nombre_producto).join(', ') || 'Producto'}
                </p>
                <p className="historial-card-precio">
                  ${Number(p.precio_total).toLocaleString()}
                </p>
                {(p.factura ?? p.detalles ?? []).slice(0, 1).map((d, i) => (
                  <div key={i}>
                    <p className="historial-card-detalle">Color: {d.stock?.color ?? d.color ?? '—'}</p>
                    <p className="historial-card-detalle">Talla: {d.stock?.tallas?.talla ?? d.talla ?? '—'}</p>
                  </div>
                ))}
                <div className="historial-card-estado-row">
                  <p className="historial-card-detalle">
                    {p.estado_pedido === 'entregado' ? 'Producto entregado' : 'Producto cambio a estado de:'}
                  </p>
                  <span className={`historial-estado ${getEstadoClase(p.estado_pedido)}`}>
                    {getEstadoLabel(p.estado_pedido)}
                  </span>
                </div>

                {p.estado_pedido === 'enviado' && (
                  <button
                    className="historial-btn-recibido"
                    onClick={() => handleRecibido(p.id_pedido)}
                  >
                    ✓ Marcar como recibido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}