import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getPedidosPorUsuario, actualizarEstadoPedido, crearDevolucion, getUsuarioActual } from "../../Api/api"
import { PLACEHOLDER_PRODUCTO, manejarErrorImagen } from "../../utils/imagenes"
import { FiArrowLeft, FiPackage } from "react-icons/fi"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import "./Historial.css"

function obtenerImagenPedido(pedido) {
  const detalle = (pedido.factura ?? pedido.detalles ?? [])[0]
  const imagenes = detalle?.stock?.productos?.imagenes_producto
  if (!imagenes || imagenes.length === 0) return PLACEHOLDER_PRODUCTO

  const principal = [...imagenes].sort((a, b) => a.orden - b.orden)[0]
  return principal?.url_imagen || PLACEHOLDER_PRODUCTO
}

export default function Historial() {
  const [pedidos,         setPedidos]         = useState([])
  const [cargando,        setCargando]        = useState(true)
  const [modalDevolucion, setModalDevolucion]  = useState(null)
  const [motivo,          setMotivo]           = useState("")
  const [enviandoDev,     setEnviandoDev]      = useState(false)
  const [errorDev,        setErrorDev]         = useState("")
  const [devolucionesEnviadas, setDevolucionesEnviadas] = useState([])
  const usuario  = getUsuarioActual()
  const navigate = useNavigate()

  const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const datosGraficaAnual = useMemo(() => {
    const anioActual = new Date().getFullYear()
    const totalesPorMes = Array(12).fill(0)

    pedidos.forEach(p => {
      if (p.estado_pedido === 'cancelado') return
      if (!p.fecha_pedido) return
      const fecha = new Date(p.fecha_pedido)
      if (fecha.getFullYear() !== anioActual) return
      totalesPorMes[fecha.getMonth()] += Number(p.precio_total) || 0
    })

    return MESES_CORTOS.map((mes, i) => ({ mes, total: totalesPorMes[i] }))
  }, [pedidos])

  const hayComprasEsteAnio = datosGraficaAnual.some(d => d.total > 0)

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

  function abrirModalDevolucion(id_pedido, id_detalle) {
    setModalDevolucion({ id_pedido, id_detalle })
    setMotivo("")
    setErrorDev("")
  }

  async function handleEnviarDevolucion(e) {
    e.preventDefault()
    if (!motivo.trim()) {
      setErrorDev("Indica el motivo de la devolución")
      return
    }
    setEnviandoDev(true)
    setErrorDev("")
    try {
      await crearDevolucion({
        id_pedido: modalDevolucion.id_pedido,
        id_detalle_pedido: modalDevolucion.id_detalle,
        motivo
      })
      setDevolucionesEnviadas(prev => [...prev, modalDevolucion.id_detalle])
      setModalDevolucion(null)
    } catch (err) {
      setErrorDev(err.response?.data?.error || err.message)
    } finally {
      setEnviandoDev(false)
    }
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

      {/* GRÁFICA ANUAL — solo se muestra si hay al menos una compra este año */}
      {!cargando && hayComprasEsteAnio && (
        <div className="historial-grafica-card">
          <p className="historial-grafica-titulo">Tus compras en {new Date().getFullYear()}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosGraficaAnual} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="mes"
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-bg-input)' }}
                contentStyle={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--color-text)',
                  fontSize: 13
                }}
                labelStyle={{ color: 'var(--color-text-muted)' }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total']}
              />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
          {pedidos.map(p => {
            const primerDetalle = (p.factura ?? p.detalles ?? [])[0]
            const yaSolicitada = primerDetalle && devolucionesEnviadas.includes(primerDetalle.id_detalle)
            const nombreProducto = primerDetalle?.stock?.productos?.nombre ?? primerDetalle?.nombre_producto ?? 'Producto del pedido'

            return (
              <div key={p.id_pedido} className="historial-card">
                <div className="historial-card-img">
                  <img
                    src={obtenerImagenPedido(p)}
                    alt={nombreProducto}
                    loading="lazy"
                    onError={manejarErrorImagen}
                  />
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

                  {p.estado_pedido === 'entregado' && primerDetalle && (
                    <button
                      className="historial-btn-devolucion"
                      onClick={() => abrirModalDevolucion(p.id_pedido, primerDetalle.id_detalle)}
                      disabled={yaSolicitada}
                    >
                      {yaSolicitada ? "Devolución solicitada" : "Solicitar devolución / cambio"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE DEVOLUCIÓN */}
      {modalDevolucion && (
        <div className="historial-modal-overlay" onClick={() => setModalDevolucion(null)}>
          <div className="historial-modal" onClick={e => e.stopPropagation()}>
            <h3 className="historial-modal-title">Solicitar devolución o cambio</h3>
            <form onSubmit={handleEnviarDevolucion}>
              <label className="historial-modal-label">Motivo</label>
              <textarea
                className="historial-modal-textarea"
                rows={4}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Ej: La talla no corresponde, producto defectuoso..."
              />
              {errorDev && <p className="historial-modal-error">{errorDev}</p>}
              <div className="historial-modal-btns">
                <button
                  type="button"
                  className="historial-modal-btn-cancelar"
                  onClick={() => setModalDevolucion(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="historial-modal-btn-enviar"
                  disabled={enviandoDev}
                >
                  {enviandoDev ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}