import { Link, useNavigate } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import "./BackButton.css"

// Botón "Volver" único de la web. Sin `to` vuelve en el historial; con `to` navega a esa ruta
// (para pantallas a las que se llega desde un enlace externo y no hay historial, ej. restablecer contraseña).
export default function BackButton({ to, label = "Volver", className = "" }) {
  const navigate = useNavigate()
  const cls = `back-button ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={cls}>
        <FiArrowLeft /> {label}
      </Link>
    )
  }

  return (
    <button type="button" className={cls} onClick={() => navigate(-1)}>
      <FiArrowLeft /> {label}
    </button>
  )
}
