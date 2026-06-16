import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout, getUsuarioActual } from "../../Api/api"
import { FiMenu, FiSearch, FiBell, FiHeart, FiShoppingCart, FiUser, FiX } from "react-icons/fi"
import Sidebar from "./Sidebar"
import "./NavbarCliente.css"

export default function NavbarCliente({ usuario }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <nav className="navbar-cliente">
        <div className="navbar-cliente-left">
          <button className="navbar-icon-btn" onClick={() => setSidebarAbierto(true)}>
            <FiMenu />
          </button>
        </div>

        <Link to="/home" className="navbar-cliente-logo">VELYSH</Link>

        <div className="navbar-cliente-right">
          <button className="navbar-icon-btn"><FiBell /></button>
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