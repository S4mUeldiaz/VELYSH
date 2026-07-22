import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { logout, getUsuarioActual, getPedidosPorUsuario } from "../../Api/api"
import { FiMenu, FiSearch, FiBell, FiHeart, FiShoppingCart, FiUser, FiX, FiPackage } from "react-icons/fi"
import Sidebar from "./Sidebar"
import "./NavbarCliente.css"

// Debe coincidir con HERO_SCROLL_RANGE en Home.jsx para que el logo
// del hero (grande) y el del navbar (chico) se sincronicen en el scroll.
const HERO_SCROLL_RANGE = 320

function claveVistas(numero_documento) {
  return `notif_estados_vistos_${numero_documento}`
}

function getEstadoLabel(estado) {
  if (estado === 'pendiente')   return 'pendiente'
  if (estado === 'confirmado')  return 'confirmado'
  if (estado === 'preparacion') return 'en preparación'
  if (estado === 'enviado')     return 'enviado'
  if (estado === 'entregado')   return 'entregado'
  if (estado === 'cancelado')   return 'cancelado'
  return estado
}

export default function NavbarCliente({ usuario }) {
  const [sidebarAbierto,     setSidebarAbierto]     = useState(false)
  const [notifAbierta,       setNotifAbierta]       = useState(false)
  const [notificaciones,     setNotificaciones]     = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const usuarioActual = usuario ?? getUsuarioActual()

  // Solo en Home el logo del navbar nace "oculto" y aparece al hacer scroll,
  // imitando que el logo grande del hero "sube" hasta acá. En cualquier otra
  // página, el logo del navbar se muestra siempre, normal.
  const esHome = location.pathname === "/home" || location.pathname === "/"
  const [scrollProgress, setScrollProgress] = useState(esHome ? 0 : 1)

  useEffect(() => {
    if (!esHome) {
      setScrollProgress(1)
      return
    }

    function handleScroll() {
      const progreso = Math.min(window.scrollY / HERO_SCROLL_RANGE, 1)
      setScrollProgress(progreso)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [esHome])

  useEffect(() => {
    if (!usuarioActual?.numero_documento) return
    cargarNotificaciones()
  }, [usuarioActual?.numero_documento])

  async function cargarNotificaciones() {
    try {
      const pedidos = await getPedidosPorUsuario(usuarioActual.numero_documento)
      const clave = claveVistas(usuarioActual.numero_documento)
      const vistas = JSON.parse(localStorage.getItem(clave) || 'null')

      if (vistas === null) {
        const baseline = {}
        pedidos.forEach(p => { baseline[p.id_pedido] = p.estado_pedido })
        localStorage.setItem(clave, JSON.stringify(baseline))
        setNotificaciones([])
        return
      }

      const nuevas = pedidos
        .filter(p => vistas[p.id_pedido] !== p.estado_pedido)
        .map(p => ({
          id_pedido: p.id_pedido,
          referencia: p.referencia,
          estado_pedido: p.estado_pedido
        }))

      setNotificaciones(nuevas)
    } catch (err) {
      console.warn('No se pudieron cargar las notificaciones de pedidos', err)
    }
  }

  function toggleNotificaciones() {
    if (!notifAbierta) cargarNotificaciones()
    setNotifAbierta(prev => !prev)
  }

  function marcarTodasComoVistas() {
    if (!usuarioActual?.numero_documento) return
    const clave = claveVistas(usuarioActual.numero_documento)
    const vistas = JSON.parse(localStorage.getItem(clave) || '{}')
    notificaciones.forEach(n => { vistas[n.id_pedido] = n.estado_pedido })
    localStorage.setItem(clave, JSON.stringify(vistas))
    setNotificaciones([])
  }

  function irAlPedido() {
    marcarTodasComoVistas()
    setNotifAbierta(false)
    navigate('/historial')
  }

  return (
    <>
      <nav
        className="navbar-cliente"
        style={esHome ? {
          backgroundColor: `rgba(0, 0, 0, ${scrollProgress})`,
          borderBottomColor: `rgba(51, 51, 51, ${scrollProgress})`,
        } : undefined}
      >
        <div className="navbar-cliente-left">
          <button className="navbar-icon-btn" onClick={() => setSidebarAbierto(true)}>
            <FiMenu />
          </button>
        </div>

        <Link
          to="/home"
          className="navbar-cliente-logo"
          style={{
            opacity: scrollProgress,
            transform: `scale(${0.6 + 0.4 * scrollProgress})`,
          }}
        >
          VELYSH
        </Link>

        <div className="navbar-cliente-right">
          <div className="navbar-notif-wrapper">
            <button className="navbar-icon-btn navbar-notif-btn" onClick={toggleNotificaciones}>
              <FiBell />
              {notificaciones.length > 0 && (
                <span className="navbar-notif-badge">{notificaciones.length}</span>
              )}
            </button>

            {notifAbierta && (
              <div className="navbar-notif-dropdown">
                <div className="navbar-notif-header">
                  <span>Notificaciones</span>
                  {notificaciones.length > 0 && (
                    <button className="navbar-notif-marcar" onClick={marcarTodasComoVistas}>
                      Marcar todas como leídas
                    </button>
                  )}
                </div>

                {notificaciones.length === 0 ? (
                  <p className="navbar-notif-vacio">No tienes notificaciones nuevas</p>
                ) : (
                  <div className="navbar-notif-lista">
                    {notificaciones.map(n => (
                      <button key={n.id_pedido} className="navbar-notif-item" onClick={irAlPedido}>
                        <FiPackage className="navbar-notif-icon" />
                        <span>
                          Tu pedido <strong>#{n.referencia}</strong> cambió a estado{" "}
                          <strong>{getEstadoLabel(n.estado_pedido)}</strong>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <button className="navbar-notif-footer" onClick={() => { setNotifAbierta(false); navigate('/historial') }}>
                  Ver todos mis pedidos
                </button>
              </div>
            )}
          </div>

          <Link to="/favoritos" className="navbar-icon-btn"><FiHeart /></Link>
          <Link to="/carrito" className="navbar-icon-btn"><FiShoppingCart /></Link>
          <Link to="/perfil" className="navbar-icon-btn"><FiUser /></Link>
        </div>
      </nav>

      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        usuario={usuario}
      />
    </>
  )
}