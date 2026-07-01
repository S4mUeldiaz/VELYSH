import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getCategorias, logout } from "../../Api/api"
import { FiX, FiLogOut } from "react-icons/fi"
import "./Sidebar.css"

export default function Sidebar({ abierto, onCerrar, usuario }) {
  const [categorias, setCategorias] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getCategorias().then(setCategorias)
  }, [])

  function handleLogout() {
    logout()
    navigate("/home")
    onCerrar()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${abierto ? 'visible' : ''}`}
        onClick={onCerrar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${abierto ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={onCerrar}>
          <FiX />
        </button>

        {/* Categorías */}
        <nav className="sidebar-nav">
          {categorias.map(c => (
            <Link
              key={c.id_categoria}
              to={`/catalogo?categoria=${c.id_categoria}`}
              className="sidebar-link"
              onClick={onCerrar}
            >
              {c.nombre_categoria}
            </Link>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          {usuario ? (
            <>
              <Link to="/perfil" className="sidebar-footer-link" onClick={onCerrar}>
                Mi perfil
              </Link>
              <button className="sidebar-logout" onClick={handleLogout}>
                <FiLogOut /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="sidebar-footer-link" onClick={onCerrar}>
                Iniciar sesión
              </Link>
              <Link to="/contacto" className="sidebar-footer-link" onClick={onCerrar}>
                Contáctanos
              </Link>
              <span className="sidebar-email">velysh329@gmail.com</span>
            </>
          )}
        </div>
      </div>
    </>
  )
}