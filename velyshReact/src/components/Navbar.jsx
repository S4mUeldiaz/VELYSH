// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/api";

// Recibe el objeto usuario desde RutaProtegida en App.jsx
export default function Navbar({ usuario }) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();           // Borra token y usuario de sessionStorage
    navigate("/login"); // Redirige al login
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand">VELYSH -{usuario.nombre} ({usuario.nombre_rol})</span>
      </div>
      <div className="navbar-links">
      <Link className="navbar-link" to="/productos">Productos</Link>
      <Link className="navbar-link" to="/inventario">Inventario</Link>
      <Link className="navbar-link" to="/pedidos">Pedidos</Link>
      </div>
      <button className="navbar-cerrar" onClick={handleLogout} style={{ marginLeft: "auto" }}>Cerrar sesión</button>
    </nav>
  );
}
