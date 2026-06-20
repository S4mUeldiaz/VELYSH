import { useState, useEffect } from "react"
import { getPedidos, actualizarEstadoPedido } from "../../Api/api"
import { FiSearch, FiBell, FiUser, FiEye, FiChevronDown } from "react-icons/fi"
import "./Pedidos.css"

export default function Pedidos() {
  const [pedidos,      setPedidos]      = useState([])
  const [busqueda,     setBusqueda]     = useState("")
  const [tabActiva,    setTabActiva]    = useState("todos")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [cargando,     setCargando]     = useState(true)
  const [modalPedido,  setModalPedido]  = useState(null)
  const [cambiandoId,  setCambiandoId]  = useState(null)

  useEffect(() => {
    getPedidos().then(p => { setPedidos(p); setCargando(false) })
  }, [])

  async function handleCambiarEstado(id, nuevoEstado) {
    await actualizarEstadoPedido(id, { estado_pedido: nuevoEstado })
    setPedidos(prev => prev.map(p => p.id_pedido === id ? { ...p, estado_pedido: nuevoEstado } : p))
    setCambiandoId(null)
  }

  const pedidosFiltrados = pedidos.filter(p => {
    const coincideBusqueda = p.referencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.usuarios?.correo?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideTab = tabActiva === 'todos' ? true :
      tabActiva === 'proceso' ? ['pendiente', 'confirmado', 'preparacion', 'enviado'].includes(p.estado_pedido) :
      p.estado_pedido === 'entregado'
    const coincideEstado = estadoFiltro ? p.estado_pedido === estadoFiltro : true
    return coincideBusqueda && coincideTab && coincideEstado
  })

  const enProceso = pedidos.filter(p => ['pendiente', 'confirmado', 'preparacion', 'enviado'].includes(p.estado_pedido)).length

  function getEstadoClase(estado) {
    if (estado === 'entregado') return 'estado-entregado'
    if (estado === 'enviado') return 'estado-enviado'
    if (estado === 'cancelado') return 'estado-cancelado'
    return 'estado-proceso'
  }

  const estadosSiguientes = {
    pendiente:   ['confirmado', 'cancelado'],
    confirmado:  ['preparacion', 'cancelado'],
    preparacion: ['enviado', 'cancelado'],
    enviado:     ['entregado'],
    entregado:   [],
    cancelado:   []
  }

  return (
    <div className="pedidos-admin-wrapper">

      {/* NAVBAR */}
      <nav className="admin-navbar">
        <h1 className="admin-navbar-title">PEDIDOS</h1>
        <div className="admin-navbar-right">
          <button className="admin-icon-btn"><FiBell /></button>
          <div className="admin-search">
            <FiSearch />
            <input placeholder="¿Qué estás buscando?" />
          </div>
          <span className="admin-user-name">Admin VELYSH</span>
          <button className="admin-icon-btn"><FiUser /></button>
        </div>
      </nav>

      <div className="pedidos-admin-content">

        {/* TABS */}
        <div className="admin-tabs">
          <button className={`admin-tab ${tabActiva === 'todos' ? 'active' : ''}`} onClick={() => setTabActiva('todos')}>
            Todos los pedidos
          </button>
          <button className={`admin-tab ${tabActiva === 'proceso' ? 'active' : ''}`} onClick={() => setTabActiva('proceso')}>
            En proceso ({enProceso})
          </button>
          <button className={`admin-tab ${tabActiva === 'completado' ? 'active' : ''}`} onClick={() => setTabActiva('completado')}>
            Completado
          </button>
        </div>

        {/* FILTROS */}
        <div className="admin-filtros">
          <div className="admin-filtro-search">
            <FiSearch />
            <input
              placeholder="Buscar pedido o cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <select className="admin-filtro-select" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="preparacion">En preparación</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* TABLA */}
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Orden#</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map(p => (
              <tr key={p.id_pedido}>
                <td className="pedido-ref">#{p.referencia}</td>
                <td>
                  <p className="admin-producto-nombre">{p.usuarios?.nombre} {p.usuarios?.apellido}</p>
                  <p className="admin-producto-ref">{p.usuarios?.correo}</p>
                </td>
                <td>{p.factura?.length ?? 0} producto(s)</td>
                <td>${Number(p.precio_total).toLocaleString()}</td>
                <td>
                  <span className={`pedido-estado ${getEstadoClase(p.estado_pedido)}`}>
                    {p.estado_pedido}
                  </span>
                </td>
                <td>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
                <td>
                  <div className="pedido-acciones">
                    <button className="inventario-btn-ver" onClick={() => setModalPedido(p)}>
                      <FiEye /> Ver
                    </button>
                    {estadosSiguientes[p.estado_pedido]?.length > 0 && (
                      <div className="pedido-estado-dropdown">
                        <button
                          className="pedido-cambiar-btn"
                          onClick={() => setCambiandoId(cambiandoId === p.id_pedido ? null : p.id_pedido)}
                        >
                          Cambiar estado <FiChevronDown />
                        </button>
                        {cambiandoId === p.id_pedido && (
                          <div className="pedido-dropdown-menu">
                            {estadosSiguientes[p.estado_pedido].map(estado => (
                              <button
                                key={estado}
                                className="pedido-dropdown-item"
                                onClick={() => handleCambiarEstado(p.id_pedido, estado)}
                              >
                                {estado}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL DETALLE */}
        {modalPedido && (
          <div className="inventario-modal-overlay" onClick={() => setModalPedido(null)}>
            <div className="inventario-modal" onClick={e => e.stopPropagation()}>
              <h3>Pedido #{modalPedido.referencia}</h3>
              <p>Cliente: <strong>{modalPedido.usuarios?.nombre} {modalPedido.usuarios?.apellido}</strong></p>
              <p>Correo: <strong>{modalPedido.usuarios?.correo}</strong></p>
              <p>Total: <strong>${Number(modalPedido.precio_total).toLocaleString()}</strong></p>
              <p>Método de pago: <strong>{modalPedido.metodo_pago}</strong></p>
              <p>Estado: <strong>{modalPedido.estado_pedido}</strong></p>
              <p>Dirección: <strong>{modalPedido.direcciones?.direccion}, {modalPedido.direcciones?.ciudad}</strong></p>
              <hr style={{ borderColor: 'var(--color-border)', margin: '8px 0' }} />
              <p style={{ fontWeight: 600 }}>Productos:</p>
              {(modalPedido.factura ?? []).map(d => (
                <p key={d.id_detalle}>• {d.stock?.productos?.nombre} x{d.cantidad} — ${Number(d.subtotal).toLocaleString()}</p>
              ))}
              <button className="admin-btn-guardar" style={{ marginTop: 8 }} onClick={() => setModalPedido(null)}>Cerrar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}