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
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc", display: "flex", gap: "16px", alignItems: "center" }}>
      <span><strong>VELYSH</strong> — {usuario.nombre} ({usuario.nombre_rol})</span>
      <Link to="/productos">Productos</Link>
      <Link to="/inventario">Inventario</Link>
      <Link to="/ventas">Ventas</Link>
      <button onClick={handleLogout} style={{ marginLeft: "auto" }}>Cerrar sesión</button>
    </nav>
  );
}
