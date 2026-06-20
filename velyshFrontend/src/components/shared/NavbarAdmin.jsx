import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../Api/api"
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiBarChart2, FiRotateCcw, FiLogOut } from "react-icons/fi"
import "./NavbarAdmin.css"

export default function NavbarAdmin({ usuario }) {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar-admin">
      <div className="navbar-admin-logo">VELYSH</div>
      <div className="navbar-admin-links">
        <Link to="/admin/dashboard" className="navbar-admin-link">
          <FiGrid /> Dashboard
        </Link>
        <Link to="/admin/productos" className="navbar-admin-link">
          <FiPackage /> Productos
        </Link>
        <Link to="/admin/inventario" className="navbar-admin-link">
          <FiShoppingBag /> Inventario
        </Link>
        <Link to="/admin/pedidos" className="navbar-admin-link">
          <FiUsers /> Pedidos
        </Link>
        <Link to="/admin/usuarios" className="navbar-admin-link">
          <FiUsers /> Usuarios
        </Link>
        <Link to="/admin/reportes" className="navbar-admin-link">
          <FiBarChart2 /> Reportes
        </Link>
        <Link to="/admin/devoluciones" className="navbar-admin-link">
          <FiRotateCcw /> Devoluciones
        </Link>
      </div>
      <div className="navbar-admin-right">
        <span className="navbar-admin-user">{usuario?.nombre}</span>
        <button className="navbar-admin-logout" onClick={handleLogout}>
          <FiLogOut /> Salir
        </button>
      </div>
    </nav>
  )
}