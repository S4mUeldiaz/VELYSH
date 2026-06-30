import { Link } from "react-router-dom"
import { FiChevronRight } from "react-icons/fi"
import "./Breadcrumbs.css"

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null

  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      {items.map((item, i) => {
        const esUltimo = i === items.length - 1
        return (
          <span key={i} className="breadcrumbs-item">
            {item.to && !esUltimo ? (
              <Link to={item.to} className="breadcrumbs-link">{item.label}</Link>
            ) : (
              <span className="breadcrumbs-current">{item.label}</span>
            )}
            {!esUltimo && <FiChevronRight className="breadcrumbs-sep" />}
          </span>
        )
      })}
    </nav>
  )
}